
// You can write more code here

/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
import WebFontFile from '../Helpers/WebFontFile.js';
import gameConfig from '../config/game-config.js';
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

		this.load.pack("asset-pack", "assets/asset-pack.json");
	}

	/** @returns {void} */
	editorCreate() {

		// progressBar
		const progressBar = this.add.rectangle(553, 361, 256, 20);
		progressBar.setOrigin(0, 0);
		progressBar.isFilled = true;
		progressBar.fillColor = 14737632;

		// progressBarBg
		const progressBarBg = this.add.rectangle(553.0120849609375, 361, 256, 20);
		progressBarBg.setOrigin(0, 0);
		progressBarBg.fillColor = 14737632;
		progressBarBg.isStroked = true;

		// loadingText
		const loadingText = this.add.text(552.0120849609375, 329, "", {});
		loadingText.text = "Loading...";
		loadingText.setStyle({ "color": "#e0e0e0", "fontFamily": "arial", "fontSize": "20px" });

		this.progressBar = progressBar;

		this.events.emit("scene-awake");
	}

	/** @type {Phaser.GameObjects.Rectangle} */
	progressBar;

	/* START-USER-CODE */

	// Write your code here
	themeData = null;

	async preload() {

		this.editorCreate();

		this.editorPreload();

		const width =  this.progressBar.width;

		this.load.on("progress", (progress) => {

			this.progressBar.width = progress * width;
		});

		// Load theme JSON and queue theme images
		const selectedTheme = gameConfig.theme || 'dodge-zone';
		console.log(`[Preload] Loading theme: Themes/${selectedTheme}.json`);

		const cacheBuster = Date.now();
		try {
			const themeResponse = await fetch(`Themes/${selectedTheme}.json?t=${cacheBuster}`);
			if (themeResponse.ok) {
				console.log(`[Preload] Theme loaded: Themes/${selectedTheme}.json`);
				const themeData = await themeResponse.json();
				this.themeData = themeData;

				// Load fonts
				if (themeData.fontLoader && themeData.fontLoader.fonts) {
					this.load.addFile(new WebFontFile(this.load, themeData.fontLoader.fonts));
				}

				// Queue theme images
				if (themeData.images && typeof themeData.images === 'object') {
					for (const [imageName, imageConfig] of Object.entries(themeData.images)) {
						if (imageConfig && typeof imageConfig === 'object' && imageConfig.type === "image") {
							this.loadThemeImage(imageConfig);
						}
					}
				}
			} else {
				console.warn(`[Preload] Failed to load theme: Themes/${selectedTheme}.json (status: ${themeResponse.status})`);
			}
		} catch (error) {
			console.error(`[Preload] Error loading theme: Themes/${selectedTheme}.json`, error);
		}
	}

	loadThemeImage(imageConfig) {
		// Skip loading if imageKey is empty or undefined
		if (!imageConfig.imageKey || imageConfig.imageKey === "") {
			console.log(`[Preload] Skipping load for ${imageConfig.key}: imageKey is empty`);
			return;
		}

		let imagePath = "";
		const cacheBuster = Date.now();

		if (imageConfig.imageKey.startsWith('http')) {
			imagePath = imageConfig.imageKey;
		} else {
			// Construct path based on imageKey patterns from asset-pack.json
			// Map known imageKeys to their paths
			const imagePathMap = {
				"DodgeField": "assets/Images/Field/DodgeField.jpg",
				"SoccerField": "assets/Images/Field/SoccerField.jpg",
				"Breaker_DodgeBall": "assets/Images/Ball/Breaker_DodgeBall.png",
				"Breaker_SoccerBall": "assets/Images/Ball/Breaker_SoccerBall.png",
				"Btn_OtherButton_Square08": "assets/Images/UI-Buttons/Btn_OtherButton_Square08.png",
				"Btn_OtherButton_Square09": "assets/Images/UI-Buttons/Btn_OtherButton_Square09.png",
				"Btn_OtherButton_Square03_Purple": "assets/Images/UI-Buttons/Btn_OtherButton_Square03_Purple.png",
				"ManBody": "assets/Images/ManBody.png",
			};

			imagePath = imagePathMap[imageConfig.imageKey];
			if (!imagePath) {
				// Fallback: try common locations
				const extensions = ['.png', '.jpg', '.jpeg'];
				const directories = [
					`assets/Images/Field/${imageConfig.imageKey}`,
					`assets/Images/Ball/${imageConfig.imageKey}`,
					`assets/Images/Brick/${imageConfig.imageKey}`,
					`assets/Images/UI-Buttons/${imageConfig.imageKey}`,
					`assets/Images/UI-Icons/${imageConfig.imageKey}`,
					`assets/Images/${imageConfig.imageKey}`,
				];

				for (const dir of directories) {
					for (const ext of extensions) {
						const testPath = `${dir}${ext}`;
						// We can't check if file exists, so use first match pattern
						if (imageConfig.imageKey.includes("Field")) {
							imagePath = `assets/Images/Field/${imageConfig.imageKey}.jpg`;
							break;
						} else if (imageConfig.imageKey.includes("Ball")) {
							imagePath = `assets/Images/Ball/${imageConfig.imageKey}.png`;
							break;
						} else if (imageConfig.imageKey.includes("Btn_")) {
							imagePath = `assets/Images/UI-Buttons/${imageConfig.imageKey}.png`;
							break;
						} else {
							imagePath = `assets/Images/${imageConfig.imageKey}.png`;
						}
					}
					if (imagePath) break;
				}
			}

			if (imagePath) {
				imagePath = `${imagePath}?t=${cacheBuster}`;
			} else {
				console.warn(`[Preload] Could not determine path for imageKey: ${imageConfig.imageKey}`);
				return;
			}
		}

		console.log(`[Preload] Loading theme image: key="${imageConfig.key}", imageKey="${imageConfig.imageKey}", path="${imagePath}"`);

		// Check if it's a spritesheet
		if (imageConfig.imageWidth || imageConfig.imageHeight) {
			this.load.spritesheet(imageConfig.key, imagePath, {
				frameWidth: imageConfig.imageWidth,
				frameHeight: imageConfig.imageHeight
			});
		} else {
			this.load.image(imageConfig.key, imagePath);
		}
	}

	create() {
		// Pass theme data to Level scene
		this.scene.start("Level", { themeData: this.themeData });
	}

	/* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here
