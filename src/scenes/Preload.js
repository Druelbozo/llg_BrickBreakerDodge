
// You can write more code here

/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
import WebFontFile from '../Helpers/WebFontFile.js';
import gameConfig from '../config/game/game-config.js';
/* END-USER-IMPORTS */

export default class Preload extends Phaser.Scene {

	constructor() {
		super("Preload");

		/* START-USER-CTR-CODE */
		// Write your code here.
		/* END-USER-CTR-CODE */
	}

	/** @returns {void} */
	editorPreload() {

		// Add cache-busting parameter to ensure asset pack reloads
		const cacheBuster = Date.now();
		this.load.pack("asset-pack", `assets/asset-pack.json?t=${cacheBuster}`);
	}

	/** @returns {void} */
	editorCreate() {
		// Get canvas dimensions for centering
		const width = this.scale.width;
		const height = this.scale.height;
		const centerX = width / 2;
		const centerY = height / 2;

		// logo - will be created after texture loads
		// Don't create it here to avoid broken image placeholder
		let logo = null;

		// progressBar - centered horizontally, positioned at center Y
		const progressBarWidth = 256;
		const progressBarHeight = 20;
		const progressBarRadius = 6; // Corner radius for rounded corners
		const progressBarX = centerX - (progressBarWidth / 2); // Center the bar
		const progressBarY = centerY + 20; // Position below center

		// Create progress bar background with black-dark gray gradient
		const progressBarBg = this.add.graphics();
		progressBarBg.fillGradientStyle(0x000000, 0x000000, 0x1a1a1a, 0x1a1a1a, 1); // Black to dark gray gradient
		progressBarBg.fillRoundedRect(progressBarX, progressBarY, progressBarWidth, progressBarHeight, progressBarRadius);

		// Create progress bar fill with purple gradient
		const progressBar = this.add.graphics();
		progressBar.fillGradientStyle(0x7C3AED, 0x7C3AED, 0xC084FC, 0xC084FC, 1); // Lighter purple gradient
		progressBar.fillRoundedRect(progressBarX, progressBarY, 0, progressBarHeight, progressBarRadius); // Start with 0 width

		// Create gold stroke border on top of everything
		const progressBarStroke = this.add.graphics();
		progressBarStroke.lineStyle(2, 0xc78e0f, 1); // Gold border
		progressBarStroke.strokeRoundedRect(progressBarX, progressBarY, progressBarWidth, progressBarHeight, progressBarRadius);

		this.progressBar = progressBar;
		this.progressBarBg = progressBarBg;
		this.progressBarStroke = progressBarStroke;
		this.logo = logo;

		this.events.emit("scene-awake");
	}

	/** @type {Phaser.GameObjects.Graphics} */
	progressBar;

	/** @type {Phaser.GameObjects.Graphics} */
	progressBarBg;

	/** @type {Phaser.GameObjects.Graphics} */
	progressBarStroke;

	/** @type {Phaser.GameObjects.Image} */
	logo;

	/* START-USER-CODE */

	// Write your code here

	// Theme image loading tracking
	_themeImageKeys = new Set(); // Track which theme image keys we're loading
	_themeImagesLoaded = 0; // Count of theme images that have completed loading (verified ready)
	_themeImagesTotal = 0; // Total number of theme images to load
	_themeImagesLoading = false; // Flag indicating if theme images are being loaded
	_themeImagesQueued = false; // Flag indicating if theme images have been queued
	_themeImagesVerified = new Set(); // Track which theme images have been verified as ready
	_themeImagesEventFired = new Set(); // Track which theme images have had their filecomplete event fire
	_themeImagesFailed = new Set(); // Track which theme images have failed to load

	themeData = null;

	async preload() {
		// Show the loading screen first
		this.editorCreate();

		// Initialize theme image tracking
		this._themeImageKeys.clear();
		this._themeImagesLoaded = 0;
		this._themeImagesTotal = 0;
		this._themeImagesLoading = false;
		this._themeImagesQueued = false;

		// Track which theme images have actually completed (verified ready)
		this._themeImagesVerified = new Set();
		// Track which theme images have had their filecomplete event fire (but may not be ready yet)
		this._themeImagesEventFired = new Set();
		// Track which theme images have failed to load
		this._themeImagesFailed = new Set();

		// Set up load event listeners to track theme image completion
		// Events may fire before textures are ready, so we mark them and verify later
		this.load.on('filecomplete-image', (key, type, data) => {
			if (this._themeImageKeys.has(key)) {
				console.log(`[Preload] 🔵 filecomplete-image event fired for "${key}"`);
				this._themeImagesEventFired.add(key);
				const isReady = this._verifyTextureReady(key);
				console.log(`[Preload] 🔵 Texture "${key}" ready check: ${isReady}`);
				// Try to verify immediately, but if not ready, periodic checks will catch it
				if (!this._themeImagesVerified.has(key) && isReady) {
					this._themeImagesLoaded++;
					this._themeImagesVerified.add(key);
					console.log(`[Preload] ✅ Theme image "${key}" loaded and verified (${this._themeImagesLoaded}/${this._themeImagesTotal})`);
					// Update progress bar during theme image loading
					this._updateThemeImageProgress();
				} else if (!this._themeImagesVerified.has(key)) {
					console.log(`[Preload] ⏳ Theme image "${key}" event fired but texture not ready yet (will verify later)`);
				}
			}
		});

		this.load.on('filecomplete-spritesheet', (key, type, data) => {
			if (this._themeImageKeys.has(key)) {
				console.log(`[Preload] 🔵 filecomplete-spritesheet event fired for "${key}"`);
				this._themeImagesEventFired.add(key);
				const isReady = this._verifyTextureReady(key);
				console.log(`[Preload] 🔵 Texture "${key}" ready check: ${isReady}`);
				// Try to verify immediately, but if not ready, periodic checks will catch it
				if (!this._themeImagesVerified.has(key) && isReady) {
					this._themeImagesLoaded++;
					this._themeImagesVerified.add(key);
					console.log(`[Preload] ✅ Theme spritesheet "${key}" loaded and verified (${this._themeImagesLoaded}/${this._themeImagesTotal})`);
					// Update progress bar during theme image loading
					this._updateThemeImageProgress();
				} else if (!this._themeImagesVerified.has(key)) {
					console.log(`[Preload] ⏳ Theme spritesheet "${key}" event fired but texture not ready yet (will verify later)`);
				}
			}
		});

		// Listen for load errors - if a theme image fails to load, mark it as failed
		this.load.on('loaderror', (file) => {
			if (this._themeImageKeys.has(file.key)) {
				console.error(`[Preload] ❌ Load error for theme image "${file.key}": ${file.state}`);
				this._themeImagesFailed.add(file.key);
				// Update progress immediately when failure is detected
				this._updateThemeImageProgress();
			}
		});

		// Listen for file errors - additional error event type
		this.load.on('fileerror', (file) => {
			if (this._themeImageKeys.has(file.key)) {
				console.error(`[Preload] ❌ File error for theme image "${file.key}"`);
				if (!this._themeImagesFailed.has(file.key)) {
					this._themeImagesFailed.add(file.key);
					// Update progress immediately when failure is detected
					this._updateThemeImageProgress();
				}
			}
		});

		// Set up logo display listener BEFORE queuing the logo
		// This ensures we catch the filecomplete event when it fires
		this.load.on('filecomplete', (key, type, data) => {
			if (key === 'logo' && type === 'image') {
				// Create the image now that the texture is loaded
				if (!this.logo && this.textures.exists('logo')) {
					const centerX = this.scale.width / 2;
					const centerY = this.scale.height / 2;
					// Position logo closer to the top of the loading bar (bar is at centerY + 20)
					// Place logo just above the bar with small gap
					this.logo = this.add.image(centerX, centerY - 15, "logo");
					this.logo.scaleX = 0.35;
					this.logo.scaleY = 0.35;
					console.log('✅ Logo image created and displayed');
				}
			}
		});

		// Queue common assets first (logo, asset-pack)
		// Load the logo image early in the preload queue
		this.load.image('logo', 'assets/images/common/logo/llg-newlogo-lite.png');
		this.editorPreload();

		// CRITICAL: Fetch theme JSON and queue theme images
		// We do this AFTER queuing common assets, but BEFORE loader starts
		// The loader won't start until preload() completes, so we have time
		let selectedTheme = gameConfig.theme || 'dodge-zone';
		console.log(`Loading theme: src/config/themes/${selectedTheme}.json`);

		// Add cache-busting parameter to ensure we get the latest theme file
		const cacheBuster = Date.now();
		try {
			const themeResponse = await fetch(`src/config/themes/${selectedTheme}.json?t=${cacheBuster}`);
			if (themeResponse.ok) {
				console.log(`Theme loaded: src/config/themes/${selectedTheme}.json`);

				const themeData = await themeResponse.json();
				this.themeData = themeData;
				this._themeImagesLoading = true;
				this.checkType(themeData);
				this._themeImagesQueued = true;

				if (themeData.fontLoader) {
					this.load.addFile(new WebFontFile(this.load, themeData.fontLoader.fonts));
				}

				// Log theme image loading summary
				if (this._themeImagesTotal > 0) {
					const allKeys = Array.from(this._themeImageKeys);
					console.log(`[Preload] ✅ Queued ${this._themeImagesTotal} theme image(s) for loading`);
					console.log(`[Preload] 📋 Theme image keys: [${allKeys.join(', ')}]`);
					
					// CRITICAL: If loader has already finished, we need to start it again
					// to process the newly queued theme images
					if (!this.load.isLoading() && this.load.list.size > 0) {
						console.log('[Preload] Loader was idle, starting it to load theme images...');
						this.load.start();
					}
				} else {
					console.log(`[Preload] No theme images found in theme data`);
				}
			} else {
				console.warn(`[Preload] Failed to load theme: src/config/themes/${selectedTheme}.json (status: ${themeResponse.status})`);
				// Continue without theme - game will use defaults
				this._themeImagesQueued = true; // Mark as done even if failed
			}
		} catch (error) {
			console.error(`[Preload] Error loading theme: src/config/themes/${selectedTheme}.json`, error);
			// Continue without theme - game will use defaults
			this._themeImagesQueued = true; // Mark as done even if failed
		}

		// Store progress bar dimensions for progress calculation
		const progressBarWidth = 256;
		const progressBarHeight = 20;
		const progressBarRadius = 6; // Corner radius for rounded corners
		const centerX = this.scale.width / 2;
		const centerY = this.scale.height / 2;
		const progressBarX = centerX - (progressBarWidth / 2);
		const progressBarY = centerY + 20;

		// Store progress bar dimensions for later use
		this._progressBarX = progressBarX;
		this._progressBarY = progressBarY;
		this._progressBarWidth = progressBarWidth;
		this._progressBarHeight = progressBarHeight;
		this._progressBarRadius = progressBarRadius;

		// Reserve progress ranges:
		// 0-85%: Phaser loader progress (common assets + theme images queued)
		// 85-100%: Theme image loading phase (when waiting in create())
		this._LOADER_MAX_PROGRESS = 0.85; // Cap loader at 85%

		this.load.on("progress", (progress) => {
			// Cap progress at LOADER_MAX_PROGRESS during normal loading
			// This reserves the remaining 15% for theme image loading phase
			const cappedProgress = Math.min(progress, this._LOADER_MAX_PROGRESS);
			this._updateProgressBar(cappedProgress);
		});
	}

	checkType(themeData)
	{
		console.log(themeData)

		// Process images from the images block (new format)
		// Also supports old format where images are at top level for backward compatibility
		if (themeData.images && typeof themeData.images === 'object') {
			// New format: images are in images block
			for (const value of Object.values(themeData.images))
			{
				if (value && typeof value === 'object' && value.type === "image") {
					this.loadImage(value, themeData);
				}
			}
		} else {
			// Old format: images are at top level (backward compatibility)
			for (const value of Object.values(themeData))
			{
				if (value && typeof value === 'object' && value.type === "image") {
					this.loadImage(value, themeData);
				}
			}
		}

		// Process audio from top level (audio may still be at top level)
		for (const value of Object.values(themeData))
		{
			if (value && typeof value === 'object' && value.type === "audio") {
				this.loadAudio(value, themeData);
			}
		}
	}

	loadImage(value, themeData)
	{
		// Skip loading if imageKey is empty or undefined
		if (!value.imageKey || value.imageKey === "") {
			console.log(`Skipping load for ${value.key}: imageKey is empty`);
			return;
		}

		// Track this as a theme image
		this._themeImageKeys.add(value.key);
		this._themeImagesTotal++;
		console.log(`[Preload] 📦 Queued theme image: "${value.key}" (Total: ${this._themeImagesTotal})`);

		let imageKey = "";

		console.log(`Loading image: key="${value.key}", imageKey="${value.imageKey}"`);

		if (value.imageKey.startsWith('http')) 
		{
			imageKey = value.imageKey
		}
		else 
		{	
			//Loading Locally - determine path based on imageKey patterns and actual file structure
			const cacheBuster = Date.now();
			
			// Map known imageKeys to their paths (based on actual file structure)
			const imagePathMap = {
				"DodgeField": "assets/images/theme/field/DodgeField.jpg",
				"SoccerField": "assets/images/theme/field/SoccerField.png",
				"Breaker_DodgeBall": "assets/images/theme/ball/Breaker_DodgeBall.png",
				"Breaker_SoccerBall": "assets/images/theme/ball/Breaker_SoccerBall.png",
				"Btn_OtherButton_Square08": "assets/images/common/ui-buttons/Btn_OtherButton_Square08.png",
				"Btn_OtherButton_Square09": "assets/images/common/ui-buttons/Btn_OtherButton_Square09.png",
				"Btn_OtherButton_Square03_Purple": "assets/images/common/ui-buttons/Btn_OtherButton_Square03_Purple.png",
				"Btn_OtherButton_Square03_Gray": "assets/images/common/ui-buttons/Btn_OtherButton_Square03_Gray.png",
				"ManBody": "assets/images/common/ManBody.png",
				"Breaker_Circle": "assets/images/common/Breaker_Circle.png",
				"CautionLine": "assets/images/common/CautionLine.png",
			};

			imageKey = imagePathMap[value.imageKey];
			
			// Fallback: try pattern-based resolution based on imageKey naming conventions
			if (!imageKey) {
				// Determine extension and directory based on imageKey patterns
				let extension = '.png';
				let directory = 'assets/images';
				
				if (value.imageKey.includes("Field")) {
					directory = "assets/images/theme/field";
					extension = value.imageKey === "DodgeField" ? '.jpg' : '.png';
				} else if (value.imageKey.includes("Ball") || value.imageKey.startsWith("Breaker_")) {
					directory = "assets/images/theme/ball";
					extension = '.png';
				} else if (value.imageKey.includes("Btn_")) {
					directory = "assets/images/common/ui-buttons";
					extension = '.png';
				} else if (value.imageKey.includes("icon_")) {
					directory = "assets/images/common/icons";
					extension = '.png';
				}
				
				imageKey = `${directory}/${value.imageKey}${extension}`;
			}
			
			// Add cache-busting parameter
			imageKey = `${imageKey}?t=${cacheBuster}`;
		}

		console.log(`Loading from path: ${imageKey}`);

		//Is SpriteSheet?
		if (value.imageWidth || value.imageHeight) 
		{
			this.load.spritesheet(value.key, imageKey,
			{
				frameWidth: value.imageWidth,
				frameHeight: value.imageHeight
			});
		}
		else
		{
			this.load.image(value.key, imageKey);
		}		
	}

	loadAudio(value, themeData)
	{
		// Skip loading if audioKey is empty or undefined
		if (!value.audioKey || value.audioKey === "") {
			console.log(`Skipping load for ${value.key}: audioKey is empty`);
			return;
		}

		let audioPath = "";

		console.log(`Loading audio: key="${value.key}", audioKey="${value.audioKey}"`);

		if (value.audioKey.startsWith('http')) 
		{
			audioPath = value.audioKey;
		}
		else 
		{	
			// Loading Locally - add cache-busting parameter to ensure we get the latest audio
			const cacheBuster = Date.now();
			audioPath = `assets/audio/music/${value.audioKey}?t=${cacheBuster}`;
		}

		console.log(`Loading audio from path: ${audioPath}`);

		// Load audio file using Phaser's audio loader
		this.load.audio(value.key, audioPath);
	}

	/**
	 * Update the progress bar with a given progress value (0.0 to 1.0)
	 * @param {number} progress - Progress value from 0.0 to 1.0
	 */
	_updateProgressBar(progress) {
		if (!this.progressBar || this._progressBarX === undefined) {
			// Progress bar dimensions not initialized yet, skip update
			return;
		}
		
		const clampedProgress = Math.max(0, Math.min(1, progress));
		this.progressBar.clear();
		this.progressBar.fillGradientStyle(0x7C3AED, 0x7C3AED, 0xC084FC, 0xC084FC, 1);
		this.progressBar.fillRoundedRect(
			this._progressBarX, 
			this._progressBarY, 
			clampedProgress * this._progressBarWidth, 
			this._progressBarHeight, 
			this._progressBarRadius
		);
	}

	/**
	 * Verify if a texture is actually ready (not just registered in cache)
	 * @param {string} key - Texture key to verify
	 * @returns {boolean} True if texture is ready and has valid source image
	 */
	_verifyTextureReady(key) {
		if (!this.textures.exists(key)) {
			return false;
		}

		try {
			const texture = this.textures.get(key);
			// Verify texture has a valid source image (not just registered)
			const sourceImage = texture.getSourceImage();
			if (sourceImage) {
				const isComplete = sourceImage.complete;
				const hasWidth = sourceImage.naturalWidth > 0;
				const isReady = isComplete || hasWidth;
				if (isReady) {
					return true;
				}
			}
		} catch (error) {
			// Texture exists but not ready yet
			console.warn(`[Preload] ⚠️ Error verifying texture "${key}":`, error);
			return false;
		}
		return false;
	}

	/**
	 * Count how many theme images are actually loaded and ready in the texture cache
	 * Verifies textures are not just registered but actually have valid source image data
	 * @returns {number} Number of theme images that are fully loaded and ready
	 */
	_countThemeImagesInCache() {
		if (this._themeImageKeys.size === 0) {
			return 0;
		}

		let count = 0;
		const readyKeys = [];
		const notReadyKeys = [];
		for (const key of this._themeImageKeys) {
			if (this._verifyTextureReady(key)) {
				count++;
				readyKeys.push(key);
			} else {
				notReadyKeys.push(key);
			}
		}
		// Log detailed cache status (only when count changes or periodically)
		return count;
	}

	/**
	 * Update progress bar based on theme image loading progress
	 * Maps theme image progress (0-100%) to the 85-100% range
	 * Uses actual texture cache count as source (most accurate - reflects textures that are truly ready)
	 * Excludes failed images from progress calculation
	 */
	_updateThemeImageProgress() {
		if (this._themeImagesTotal === 0) {
			// No theme images to load, show 100%
			console.log(`[Preload] 📊 Progress update: No theme images (100%)`);
			this._updateProgressBar(1.0);
			return;
		}

		// Use actual cache count as source - this reflects textures that are truly ready
		// Event counters can fire before textures are ready, so cache count is more accurate
		const verifiedCount = this._countThemeImagesInCache();
		const eventsFired = this._themeImagesEventFired.size;
		const verifiedLoaded = this._themeImagesLoaded;
		
		// Exclude failed images from total - we only count images we expect to load
		const actualTotal = this._themeImagesTotal - this._themeImagesFailed.size;
		
		// Calculate theme image loading progress (0.0 to 1.0)
		// If all images failed, show 100% (nothing to wait for)
		const themeProgress = actualTotal > 0 
			? Math.min(verifiedCount / actualTotal, 1.0)
			: 1.0;
		
		// Map to the 85-100% range
		// 85% = all loader assets done, 100% = all theme images loaded
		const overallProgress = this._LOADER_MAX_PROGRESS + (themeProgress * (1.0 - this._LOADER_MAX_PROGRESS));
		
		const failedCount = this._themeImagesFailed.size;
		console.log(`[Preload] 📊 Progress update: cache=${verifiedCount}/${actualTotal} (${failedCount} failed, ${this._themeImagesTotal} total), events=${eventsFired}, verified=${verifiedLoaded} → themeProgress=${(themeProgress * 100).toFixed(1)}%, overall=${(overallProgress * 100).toFixed(1)}%`);
		
		this._updateProgressBar(overallProgress);
	}

	/**
	 * Check if all theme images are actually available and ready in the texture cache
	 * Verifies textures are not just registered but actually have valid source image data
	 * @returns {boolean} True if all theme images are fully loaded and ready
	 */
	_checkAllThemeImagesInCache() {
		if (this._themeImageKeys.size === 0) {
			return true;
		}

		for (const key of this._themeImageKeys) {
			if (!this.textures.exists(key)) {
				return false;
			}
			
			try {
				const texture = this.textures.get(key);
				// Verify texture has a valid source image (not just registered)
				const sourceImage = texture.getSourceImage();
				if (!sourceImage || (!sourceImage.complete && sourceImage.naturalWidth === 0)) {
					return false;
				}
			} catch (error) {
				// Texture exists but not ready yet
				return false;
			}
		}
		return true;
	}

	/**
	 * Wait for all theme images to complete loading
	 * @returns {Promise<void>} Promise that resolves when all theme images are loaded
	 */
	async _waitForThemeImages() {
		// If theme images haven't been queued yet, wait a bit for them to be queued
		if (!this._themeImagesQueued) {
			console.log('[Preload] Theme images not queued yet, waiting for theme fetch...');
			
			// Wait up to 2 seconds for theme to be queued
			let waited = 0;
			const maxWaitForQueue = 2000;
			const queueCheckInterval = 50;
			
			while (!this._themeImagesQueued && waited < maxWaitForQueue) {
				await new Promise(resolve => setTimeout(resolve, queueCheckInterval));
				waited += queueCheckInterval;
			}
			
			if (!this._themeImagesQueued) {
				console.warn('[Preload] Theme images never queued, proceeding anyway');
				return;
			}
		}

		// If no theme images are being loaded, resolve immediately
		if (!this._themeImagesLoading || this._themeImagesTotal === 0) {
			console.log('[Preload] No theme images to wait for');
			// Show 100% since there are no theme images
			this._updateProgressBar(1.0);
			return;
		}

		// Update progress immediately based on event counter (primary source)
		this._updateThemeImageProgress();

		// Check if all theme images are already loaded (excluding failed ones)
		const actualTotal = this._themeImagesTotal - this._themeImagesFailed.size;
		if (actualTotal > 0 && this._themeImagesLoaded >= actualTotal && this._checkAllThemeImagesInCache()) {
			console.log(`[Preload] All non-failed theme images already loaded (${this._themeImagesLoaded}/${actualTotal}, ${this._themeImagesFailed.size} failed)`);
			// Set progress to 100% since everything is loaded
			this._updateProgressBar(1.0);
			return;
		} else if (actualTotal === 0 && this._themeImagesFailed.size > 0) {
			// All images failed - continue anyway
			console.warn(`[Preload] ⚠️ All theme images failed, continuing...`);
			this._updateProgressBar(1.0);
			return;
		}

		console.log(`[Preload] Waiting for theme images to load (${this._themeImagesLoaded}/${this._themeImagesTotal} completed via events)...`);

		// Start showing progress for theme image loading phase (85-100%)
		// Update immediately to show we've entered the theme loading phase
		this._updateThemeImageProgress();

		// Ensure loader is running if theme images are still queued
		if (!this.load.isLoading() && this.load.list.size > 0) {
			console.log('[Preload] Loader is idle but theme images are queued, starting loader...');
			this.load.start();
		}

		// Wait for all theme images to complete loading
		return new Promise((resolve) => {
			let intervalCheck = null;

			// Set up a listener for the load complete event
			const checkComplete = () => {
				console.log(`[Preload] 🔔 Loader complete event fired`);
				
			// Don't check immediately - textures may not be registered in cache yet when this event fires
			// We'll check after a delay in the periodic interval
				
				const cacheCount = this._countThemeImagesInCache();
				const actualTotal = this._themeImagesTotal - this._themeImagesFailed.size;
				console.log(`[Preload] 🔔 Status: Events=${this._themeImagesEventFired.size}, Verified=${this._themeImagesLoaded}, Cache=${cacheCount}, Total=${this._themeImagesTotal} (${this._themeImagesFailed.size} failed, ${actualTotal} expected)`);
				
				// Update progress immediately when loader completes (events may have fired)
				// Progress is based on cache count, which reflects actual texture readiness
				this._updateThemeImageProgress();
				
				// Verify all non-failed images are loaded
				if (actualTotal > 0 && this._themeImagesLoaded >= actualTotal && cacheCount >= actualTotal) {
					// Show 100% when all non-failed theme images are loaded
					console.log(`[Preload] ✅ All theme images loaded and verified on complete event: Events=${this._themeImagesEventFired.size}, Verified=${this._themeImagesLoaded}/${actualTotal} (${this._themeImagesFailed.size} failed), Cache=${cacheCount}`);
					this._updateProgressBar(1.0);
					this.load.off('complete', checkComplete);
					if (intervalCheck) clearInterval(intervalCheck);
					resolve();
				} else if (actualTotal === 0 && this._themeImagesFailed.size > 0) {
					// All images failed - continue anyway
					console.warn(`[Preload] ⚠️ All theme images failed to load, continuing...`);
					this._updateProgressBar(1.0);
					this.load.off('complete', checkComplete);
					if (intervalCheck) clearInterval(intervalCheck);
					resolve();
				}
			};

			// Check immediately in case they're already all loaded
			const initialCacheCount = this._countThemeImagesInCache();
			const allKeys = Array.from(this._themeImageKeys);
			const failedKeys = Array.from(this._themeImagesFailed);
			const actualTotal = this._themeImagesTotal - this._themeImagesFailed.size;
			console.log(`[Preload] 🚀 Wait phase starting: Events=${this._themeImagesEventFired.size}, Verified=${this._themeImagesLoaded}, Cache=${initialCacheCount}, Total=${this._themeImagesTotal} (${this._themeImagesFailed.size} failed, ${actualTotal} expected)`);
			console.log(`[Preload] 🚀 Tracking theme image keys: [${allKeys.join(', ')}]`);
			if (failedKeys.length > 0) {
				console.log(`[Preload] ⚠️ Failed theme image keys: [${failedKeys.join(', ')}]`);
			}
			
			if (actualTotal > 0 && this._themeImagesLoaded >= actualTotal && initialCacheCount >= actualTotal) {
				console.log(`[Preload] ✅ All non-failed theme images already loaded before wait phase`);
				this._updateProgressBar(1.0);
				resolve();
				return;
			} else if (actualTotal === 0 && this._themeImagesFailed.size > 0) {
				// All images failed - continue anyway
				console.warn(`[Preload] ⚠️ All theme images failed, continuing...`);
				this._updateProgressBar(1.0);
				resolve();
				return;
			}

			// Listen for load complete events (loader might complete multiple times if new files are added)
			this.load.on('complete', checkComplete);

			// Also check periodically as a fallback (verifies textures are actually in cache)
			const maxWaitTime = 10000; // 10 seconds max wait
			const checkInterval = 100; // Check every 100ms
			let elapsed = 0;

			intervalCheck = setInterval(() => {
				elapsed += checkInterval;
				
				console.log(`[Preload] 🔄 Periodic check (${elapsed}ms): Events fired=${this._themeImagesEventFired.size}, Verified loaded=${this._themeImagesLoaded}, Total=${this._themeImagesTotal}`);
				
				// Check for any theme images that have completed but weren't verified yet
				// This handles cases where filecomplete events fired but textures weren't ready
				let newlyVerified = 0;
				for (const key of this._themeImageKeys) {
					if (!this._themeImagesVerified.has(key)) {
						const isReady = this._verifyTextureReady(key);
						if (isReady) {
							this._themeImagesLoaded++;
							this._themeImagesVerified.add(key);
							newlyVerified++;
							console.log(`[Preload] ✅ Theme image "${key}" verified as ready during interval check (${this._themeImagesLoaded}/${this._themeImagesTotal})`);
						}
					}
				}
				
				if (newlyVerified > 0) {
					console.log(`[Preload] 🎉 Verified ${newlyVerified} new theme image(s) during interval check`);
				}
				
				// Update progress during periodic checks based on verified count
				this._updateThemeImageProgress();
				
				// Log progress periodically for debugging
				if (elapsed % 1000 === 0) { // Every second
					const cacheCount = this._countThemeImagesInCache();
					console.log(`[Preload] 📈 Progress summary: Events=${this._themeImagesEventFired.size}/${this._themeImagesTotal}, Verified=${this._themeImagesLoaded}/${this._themeImagesTotal}, Cache=${cacheCount}/${this._themeImagesTotal}`);
				}
				
				// FAILURE DETECTION: Check for missing images after loader completes AND textures have time to register
				// Wait 500ms after loader completes to give textures time to be registered in cache
				// This handles cases where loaderror/fileerror events don't fire
				// Only check once per image to avoid spam
				if (elapsed >= 500 && elapsed < 600) {
					// Only check if loader has definitely completed
					if (!this.load.isLoading()) {
						for (const key of this._themeImageKeys) {
							if (!this._themeImagesFailed.has(key) && 
								!this._themeImagesVerified.has(key)) {
								// If texture still doesn't exist after loader completed and we've waited, it likely failed
								if (!this.textures.exists(key)) {
									console.error(`[Preload] ❌ Theme image "${key}" failed to load (not found after loader completed + 500ms delay)`);
									this._themeImagesFailed.add(key);
									// Update progress immediately
									this._updateThemeImageProgress();
								}
							}
						}
					}
				}
				
				// Calculate actual total (excluding failed images)
				const actualTotal = this._themeImagesTotal - this._themeImagesFailed.size;
				const cacheCount = this._countThemeImagesInCache();
				
				// Check if all non-failed images are loaded
				if (actualTotal > 0 && this._themeImagesLoaded >= actualTotal && cacheCount >= actualTotal) {
					const failedCount = this._themeImagesFailed.size;
					console.log(`[Preload] ✅ All theme images verified via interval check: Verified=${this._themeImagesLoaded}/${actualTotal} (${failedCount} failed), Cache=${cacheCount}`);
					this._updateProgressBar(1.0);
					clearInterval(intervalCheck);
					this.load.off('complete', checkComplete);
					resolve();
					return;
				} else if (actualTotal === 0 && this._themeImagesFailed.size > 0) {
					// All images failed - continue anyway
					console.warn(`[Preload] ⚠️ All theme images failed to load, continuing...`);
					this._updateProgressBar(1.0);
					clearInterval(intervalCheck);
					this.load.off('complete', checkComplete);
					resolve();
					return;
				}

				// Timeout after max wait time
				if (elapsed >= maxWaitTime) {
					clearInterval(intervalCheck);
					this.load.off('complete', checkComplete);
					
					// Show current progress even on timeout (based on event counter)
					this._updateThemeImageProgress();
					
					// Log which images are missing (check both event counter and cache)
					const missingByEvents = [];
					const missingInCache = [];
					
					for (const key of this._themeImageKeys) {
						if (!this.textures.exists(key)) {
							missingInCache.push(key);
						}
					}
					
					// Calculate how many are missing based on event counter
					const missingCount = this._themeImagesTotal - this._themeImagesLoaded;
					
					if (missingCount > 0 || missingInCache.length > 0) {
						console.warn(`[Preload] ⚠️ Timeout waiting for theme images. Events: ${this._themeImagesLoaded}/${this._themeImagesTotal}, Cache: ${this._themeImagesTotal - missingInCache.length}/${this._themeImagesTotal}. Missing in cache: ${missingInCache.join(', ') || 'none'} (after ${maxWaitTime}ms)`);
					} else {
						console.warn(`[Preload] ⚠️ Timeout waiting for theme images (${this._themeImagesLoaded}/${this._themeImagesTotal} events, verified in cache after ${maxWaitTime}ms)`);
					}
					
					// Resolve anyway to prevent hanging - game will continue with partial loading
					// Progress bar will show current state based on event counter
					resolve();
				}
			}, checkInterval);
		});
	}

	async create() {
		// Wait for all theme images to load before switching scenes
		// This prevents green grid squares from appearing on cold start
		try {
			await this._waitForThemeImages();
		} catch (error) {
			console.error('[Preload] Error waiting for theme images:', error);
			// Continue anyway to prevent hanging - game will use available assets
		}

		console.log('🎬 Preload scene create() called - starting Level scene...');
		this.scene.start("Level", { themeData: this.themeData });
	}

	/* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here
