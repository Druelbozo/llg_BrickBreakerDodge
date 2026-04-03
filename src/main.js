import Level from "./scenes/Level.js";
import Preload from "./scenes/Preload.js";
import ProviderAPIService from "./services/api/ProviderAPIService.js";
import { GameConfig } from "./config/Global.js";
import { initNovalinkTournamentSdk } from "./services/novalink/tournamentSdk.js";

const BREAKER_RUNTIME_DEFAULTS = {
	theme: 'dodge-zone',
	creditValueMinor: 100,
	match: 3
};

function mergeBreakerRuntimeConfig(fileConfig = {}, meta = {}) {
	const base = { ...BREAKER_RUNTIME_DEFAULTS, ...fileConfig };
	const scratchType = meta.scratchType;
	return {
		theme: meta.theme ?? base.theme ?? 'dodge-zone',
		creditValueMinor: meta.creditValueMinor ?? base.creditValueMinor ?? 100,
		paytableId: meta.paytableId ?? base.paytableId,
		match: meta.match ?? base.match ?? 3,
		gameId: meta.gameId ?? base.gameId,
		subcategory: scratchType === 'poker' ? 'poker' : (base.subcategory ?? 'card'),
		pokerType: meta.pokerType ?? base.pokerType,
		scheduleCode: meta.scheduleCode ?? base.scheduleCode,
		currencyCode: meta.currencyCode ?? base.currencyCode,
		credits: meta.credits ?? base.credits
	};
}

function getSessionIdFromUrl() {
	const read = (win) => {
		try {
			return new URLSearchParams(win.location.search).get('sessionId');
		} catch (_) {
			return null;
		}
	};
	return read(window) || read(window.parent) || read(window.top);
}

window.addEventListener('load', async function () {

	const sessionId = getSessionIdFromUrl();
	if (sessionId) {
		window.__sessionId = sessionId;
		window.__selectedGameConfig = mergeBreakerRuntimeConfig({}, {});
	} else {
		try {
			const { loadSelectedConfig, getSelectedConfigName, DEFAULT_CONFIG } = await import('./config/game/game-config.js');
			let raw = await loadSelectedConfig();
			if (!raw) {
				const name = getSelectedConfigName() || DEFAULT_CONFIG;
				raw = { theme: name };
				console.warn('Game config failed to load, using fallback theme:', name);
			}
			window.__selectedGameConfig = mergeBreakerRuntimeConfig(raw, {});
		} catch (err) {
			console.error('Failed to load game config:', err);
			window.__selectedGameConfig = mergeBreakerRuntimeConfig({ theme: 'dodge-zone' }, {});
		}
	}

	var game = new Phaser.Game({
		width: 700,
		height: 1280,
		type: Phaser.AUTO,
        backgroundColor: "#242424",
		scale: {
			mode: Phaser.Scale.FIT,
			autoCenter: Phaser.Scale.CENTER_BOTH
		},
		physics:{
			default: "arcade",
			arcade:{
				debug: false,
			}
		}
	});

	game.scene.add("Preload", Preload);
	game.scene.add("Level", Level);
	game.scene.add("Boot", Boot, true);
});

class Boot extends Phaser.Scene {

	preload() {
		
		this.load.pack("pack", "assets/preload-asset-pack.json");
	}

	async create() {

		let config = window.__selectedGameConfig || {};
		this.registry.set('preloadUseSessionConfig', false);

		if (window.__sessionId) {
			const providerAPI = new ProviderAPIService();
			if (!providerAPI.sessionId) {
				providerAPI.sessionId = window.__sessionId;
				providerAPI.isSessionMode = true;
			}
			try {
				const sessionInfo = await providerAPI.getSessionInfo();
				const meta = sessionInfo.gameMetadata || {};
				config = mergeBreakerRuntimeConfig({}, meta);
				window.__selectedGameConfig = config;

				const mode = sessionInfo.mode || providerAPI.mode || 'demo';
				const operatorBalance = sessionInfo.operatorBalance;
				this.registry.set('preloadSessionId', window.__sessionId);
				this.registry.set('preloadSessionMode', mode);
				this.registry.set('preloadUseSessionConfig', true);
				if (mode === 'real' && operatorBalance != null) {
					this.registry.set('preloadOperatorBalance', operatorBalance);
				} else {
					this.registry.set('preloadOperatorBalance', GameConfig.game.SESSION_DEMO_BALANCE_MINOR);
				}
			} catch (err) {
				console.error('Boot: Failed to fetch session:', err);
				window.__sessionId = null;
				try {
					const { loadSelectedConfig } = await import('./config/game/game-config.js');
					const fileCfg = await loadSelectedConfig();
					config = mergeBreakerRuntimeConfig(fileCfg || {}, {});
				} catch {
					config = mergeBreakerRuntimeConfig({}, {});
				}
				window.__selectedGameConfig = config;
				this.registry.set('preloadSessionId', null);
				this.registry.set('preloadOperatorBalance', GameConfig.game.SESSION_DEMO_BALANCE_MINOR);
				this.registry.set('preloadSessionMode', 'demo');
				this.registry.set('preloadUseSessionConfig', false);
			}
		}

		this.registry.set('preloadGameConfig', config);
		initNovalinkTournamentSdk(config);
		this.scene.start("Preload");
	}
}
