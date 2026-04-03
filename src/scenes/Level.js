
// You can write more code here

/* START OF COMPILED CODE */

import BrickSpawner from "../BrickSpawner.js";
import BallLauncher from "../BallLauncher.js";
import Text from "../ScriptNodes/Basics/Text.js";
import OnEvent from "../ScriptNodes/Utils/OnEvent.js";
import FlashObject from "../ScriptNodes/Utils/FlashObject.js";
import OnEventEmit from "../ScriptNodes/Utils/OnEventEmit.js";
import ScoreManager from "../ScoreManager.js";
import Pause from "../ScriptNodes/Utils/Pause.js";
import SetVisable from "../ScriptNodes/Utils/SetVisable.js";
import Timer from "../Timer.js";
import MessageDisplay from "../ScriptNodes/Utils/MessageDisplay.js";
import MoveTween from "../ScriptNodes/Utils/MoveTween.js";
import AlphaTween from "../ScriptNodes/Utils/AlphaTween.js";
import ToggleImage from "../ScriptNodes/Utils/ToggleImage.js";
import ToggleSound from "../ScriptNodes/Utils/ToggleSound.js";
import OnAwake from "../ScriptNodes/Utils/OnAwake.js";
import CameraFade from "../ScriptNodes/Utils/CameraFade.js";
import ScaleTween from "../ScriptNodes/Utils/ScaleTween.js";
import PlayAudio from "../ScriptNodes/Utils/PlayAudio.js";
import Delay from "../ScriptNodes/Utils/Delay.js";
/* START-USER-IMPORTS */
import { GameConfig } from '../config/Global.js';
import { showNovalinkTournamentOverlay, submitNovalinkTournamentScore } from '../services/novalink/tournamentSdk.js';
import { getThemeImageKey, applyTextTheme, applySingleHexTint, applyGameMessageTextTheme } from '../utils/themeUtils.js';
/* END-USER-IMPORTS */

export default class Level extends Phaser.Scene {

	constructor() {
		super("Level");

		/* START-USER-CTR-CODE */
		// Write your code here.
		/* END-USER-CTR-CODE */
	}

	/** @returns {void} */
	editorCreate() {

		// BG
		const fieldKey = this.themeData ? getThemeImageKey(this.themeData, "field") : "DodgeField";
		const bG = this.add.image(-30, 0, fieldKey || "DodgeField");
		bG.scaleX = 0.957533067724055;
		bG.scaleY = 0.957533067724055;
		bG.angle = 90;
		bG.setOrigin(0, 1);

		// wallsContainer
		const wallsContainer = this.add.container(0, 0);
		wallsContainer.blendMode = Phaser.BlendModes.SKIP_CHECK;

		// wall
		const wall = this.physics.add.image(0, 0, "_MISSING");
		wall.scaleX = 22;
		wall.scaleY = 3;
		wall.setOrigin(0, 0);
		wall.visible = false;
		wall.body.moves = false;
		wall.body.allowGravity = false;
		wall.body.allowDrag = false;
		wall.body.allowRotation = false;
		wall.body.pushable = false;
		wall.body.setSize(32, 32, false);
		wallsContainer.add(wall);

		// gameObjects
		const gameObjects = this.add.layer();
		gameObjects.blendMode = Phaser.BlendModes.SKIP_CHECK;

		// brickSpawner
		const brickSpawner = new BrickSpawner(this, 0, 200);
		brickSpawner.alpha = 1;
		gameObjects.add(brickSpawner);

		// ballLauncher
		const ballLauncher = new BallLauncher(this, 350, 1050);
		gameObjects.add(ballLauncher);

		// UI
		const uI = this.add.layer();
		uI.blendMode = Phaser.BlendModes.SKIP_CHECK;

		// startButton
		const startButton = new Text(this, 350, -270);
		startButton.name = "startButton";
		startButton.removeInteractive();
		startButton.setInteractive(new Phaser.Geom.Rectangle(0, 0, 679, 295.96875), Phaser.Geom.Rectangle.Contains);
		startButton.text = "START";
		startButton.setStyle({ "color": "#ffffffff", "fontSize": "216px", "strokeThickness": 25, "shadow.offsetX": 0, "shadow.offsetY": 21 });
		uI.add(startButton);

		// onEvent
		const onEvent = new OnEvent(startButton);

		// flashObject
		const flashObject = new FlashObject(onEvent);

		// onEventEmit
		const onEventEmit = new OnEventEmit(flashObject);

		// nineslice_1
		const titleBarKey = this.themeData ? getThemeImageKey(this.themeData, "titleBar") : "Btn_OtherButton_Square03_Purple";
		const nineslice_1 = this.add.nineslice(0, 0, titleBarKey || "Btn_OtherButton_Square03_Purple", undefined, 700, 100, 20, 20, 23, 31);
		nineslice_1.setOrigin(0, 0);
		// Apply tint if specified in theme
		if (this.themeData) {
			applySingleHexTint(nineslice_1, this.themeData, "titleBar");
		}
		uI.add(nineslice_1);

		// scoreManager
		const scoreManager = new ScoreManager(this, 350, -10);
		uI.add(scoreManager);

		// CountDown_1
		const countDown_1 = new Text(this, 350, 640);
		countDown_1.scaleX = 0;
		countDown_1.scaleY = 0;
		countDown_1.text = "1";
		countDown_1.setStyle({ "color": "#ffffffff", "fontSize": "527px", "strokeThickness": 39, "shadow.offsetX": 0, "shadow.offsetY": 21 });
		uI.add(countDown_1);

		// CountDown_2
		const countDown_2 = new Text(this, 350, 640);
		countDown_2.scaleX = 0;
		countDown_2.scaleY = 0;
		countDown_2.text = "2";
		countDown_2.setStyle({ "color": "#ffffffff", "fontSize": "527px", "strokeThickness": 39, "shadow.offsetX": 0, "shadow.offsetY": 21 });
		uI.add(countDown_2);

		// CountDown_3
		const countDown_3 = new Text(this, 350, 640);
		countDown_3.scaleX = 0;
		countDown_3.scaleY = 0;
		countDown_3.text = "3";
		countDown_3.setStyle({ "color": "#ffffffff", "fontSize": "527px", "strokeThickness": 39, "shadow.offsetX": 0, "shadow.offsetY": 21 });
		uI.add(countDown_3);

		// CountDown
		const countDown = new Text(this, 350, 640);
		countDown.scaleX = 0;
		countDown.scaleY = 0;
		countDown.text = "GO";
		countDown.setStyle({ "color": "#ffffffff", "fontSize": "538px", "strokeThickness": 41, "shadow.offsetX": 0, "shadow.offsetY": 22 });
		uI.add(countDown);

		// GameOverText
		const gameOverText = new Text(this, 350, 650);
		gameOverText.scaleX = 0;
		gameOverText.scaleY = 0;
		gameOverText.angle = -10;
		gameOverText.text = "GAME OVER";
		gameOverText.setStyle({ "color": "#ffffffff", "fontSize": "109px", "strokeThickness": 20, "shadow.offsetX": 0, "shadow.offsetY": 10 });
		uI.add(gameOverText);

		// Pause
		const pause = this.add.text(640, 40, "", {});
		pause.name = "Pause";
		pause.preFX.padding = 1;
		pause.setInteractive(new Phaser.Geom.Rectangle(-14, 0, 60, 70), Phaser.Geom.Rectangle.Contains);
		pause.setOrigin(0.5, 0.5);
		pause.text = "II";
		pause.setStyle({ "color": "#ffffffff", "fontFamily": "Jersey15-Regular", "fontSize": "70px", "stroke": "#000000ff", "strokeThickness": 6, "shadow.offsetX": 3, "shadow.offsetY": 2, "shadow.stroke": true, "shadow.fill": true });
		uI.add(pause);

		// onEvent_2
		const onEvent_2 = new OnEvent(pause);

		// pause
		new Pause(onEvent_2);

		// setVisable_1
		const setVisable_1 = new SetVisable(onEvent_2);

		// Timer
		const timer = new Text(this, 80, 40);
		timer.name = "Timer";
		timer.text = "0:00";
		timer.setStyle({ "fontSize": "60px" });
		uI.add(timer);

		// onGameStartTimer
		const onGameStartTimer = new OnEvent(timer);

		// timer_1
		const timer_1 = new Timer(onGameStartTimer);

		// onGameOverTimerEvent
		const onGameOverTimerEvent = new OnEventEmit(timer_1);

		// PointsMessageDisplay
		const pointsMessageDisplay = this.add.container(360, 640);
		pointsMessageDisplay.blendMode = Phaser.BlendModes.SKIP_CHECK;
		pointsMessageDisplay.alpha = 0;
		uI.add(pointsMessageDisplay);

		// PointsGainsMessage_String
		const pointsGainsMessage_String = new Text(this, -10, 10);
		pointsGainsMessage_String.angle = -6;
		pointsGainsMessage_String.text = "POINTS!";
		pointsGainsMessage_String.setStyle({ "fontSize": "135px", "strokeThickness": 19 });
		pointsMessageDisplay.add(pointsGainsMessage_String);

		// PointsGainedMessage_Number
		const pointsGainedMessage_Number = new Text(this, -30, -140);
		pointsGainedMessage_Number.angle = -5;
		pointsGainedMessage_Number.text = "100";
		pointsGainedMessage_Number.setStyle({ "fontSize": "274px", "strokeThickness": 21 });
		pointsMessageDisplay.add(pointsGainedMessage_Number);

		// messageDisplay_1
		const messageDisplay_1 = new MessageDisplay(pointsMessageDisplay);

		// moveTween_1
		const moveTween_1 = new MoveTween(messageDisplay_1);

		// alphaTween_5
		const alphaTween_5 = new AlphaTween(moveTween_1);

		// moveTween_2
		const moveTween_2 = new MoveTween(messageDisplay_1);

		// alphaTween_4
		const alphaTween_4 = new AlphaTween(messageDisplay_1);

		// BricksMessageDisplay
		const bricksMessageDisplay = this.add.container(360, 640);
		bricksMessageDisplay.blendMode = Phaser.BlendModes.SKIP_CHECK;
		bricksMessageDisplay.alpha = 0;
		uI.add(bricksMessageDisplay);

		// BricksMessage_String
		const bricksMessage_String = new Text(this, 10, 10);
		bricksMessage_String.angle = -8;
		bricksMessage_String.text = "ELIMINATED!";
		bricksMessage_String.setStyle({ "fontSize": "145px", "strokeThickness": 16 });
		bricksMessageDisplay.add(bricksMessage_String);

		// BricksMessage_Number
		const bricksMessage_Number = new Text(this, -30, -140);
		bricksMessage_Number.angle = -8;
		bricksMessage_Number.text = "5";
		bricksMessage_Number.setStyle({ "fontSize": "270px", "strokeThickness": 15 });
		bricksMessageDisplay.add(bricksMessage_Number);

		// messageDisplay_2
		const messageDisplay_2 = new MessageDisplay(bricksMessageDisplay);

		// moveTween_3
		const moveTween_3 = new MoveTween(messageDisplay_2);

		// alphaTween_6
		const alphaTween_6 = new AlphaTween(moveTween_3);

		// moveTween_4
		const moveTween_4 = new MoveTween(messageDisplay_2);

		// alphaTween_7
		const alphaTween_7 = new AlphaTween(messageDisplay_2);

		// icon_musicOn_128
		const icon_musicOn_128 = this.add.image(560, 40, "icon_musicOn_128");
		icon_musicOn_128.setInteractive(new Phaser.Geom.Rectangle(0, 0, 128, 128), Phaser.Geom.Rectangle.Contains);
		icon_musicOn_128.scaleX = 0.5;
		icon_musicOn_128.scaleY = 0.5;
		uI.add(icon_musicOn_128);

		// onEvent_4
		const onEvent_4 = new OnEvent(icon_musicOn_128);

		// toggleImage
		const toggleImage = new ToggleImage(onEvent_4);

		// toggleSound
		const toggleSound = new ToggleSound(onEvent_4);

		// onSceneStart
		const onSceneStart = this.add.container(0, 0);
		onSceneStart.blendMode = Phaser.BlendModes.SKIP_CHECK;

		// onAwake
		const onAwake = new OnAwake(onSceneStart);

		// moveTween
		const moveTween = new MoveTween(onAwake);

		// cameraFadeIn
		new CameraFade(onAwake);

		// onStartButtonPressed
		const onStartButtonPressed = new OnEvent(onSceneStart);

		// alphaTween
		const alphaTween = new AlphaTween(onStartButtonPressed);

		// scaleTween
		const scaleTween = new ScaleTween(onStartButtonPressed);

		// alphaTween_1
		const alphaTween_1 = new AlphaTween(scaleTween);

		// scaleTween_1
		const scaleTween_1 = new ScaleTween(scaleTween);

		// alphaTween_2
		const alphaTween_2 = new AlphaTween(scaleTween_1);

		// scaleTween_2
		const scaleTween_2 = new ScaleTween(scaleTween_1);

		// alphaTween_3
		const alphaTween_3 = new AlphaTween(scaleTween_2);

		// scaleTween_3
		const scaleTween_3 = new ScaleTween(scaleTween_2);

		// onEventEmit_1
		const onEventEmit_1 = new OnEventEmit(scaleTween_2);

		// playAudio
		const playAudio = new PlayAudio(scaleTween_2);

		// EndPanel
		const endPanel = this.add.container(350, -400);
		endPanel.blendMode = Phaser.BlendModes.SKIP_CHECK;

		// rectangle_1
		const rectangle_1 = this.add.rectangle(0, 0, 4000, 4000);
		rectangle_1.alpha = 0;
		rectangle_1.isFilled = true;
		rectangle_1.fillColor = 0;
		endPanel.add(rectangle_1);

		// backing
		const backing = this.add.nineslice(0, 9, "Btn_OtherButton_Square04", undefined, 400, 500, 24, 28, 26, 37);
		endPanel.add(backing);

		// scoreManager_1
		const scoreManager_1 = new ScoreManager(this, 0, -120);
		endPanel.add(scoreManager_1);

		// finalScore
		const finalScore = new Text(this, 0, -180);
		finalScore.text = "Final Score";
		finalScore.setStyle({ "fontSize": "50px", "strokeThickness": 5, "shadow.offsetX": 0, "shadow.offsetY": 11 });
		endPanel.add(finalScore);

		// RestartButton
		const restartButton = this.add.nineslice(0, 170, "Btn_OtherButton_Square02", undefined, 200, 100, 16, 21, 20, 26);
		restartButton.setInteractive(new Phaser.Geom.Rectangle(0, 0, 200, 100), Phaser.Geom.Rectangle.Contains);
		endPanel.add(restartButton);

		// onEvent_1
		const onEvent_1 = new OnEvent(restartButton);

		// cameraFade
		const cameraFade = new CameraFade(onEvent_1);

		// onGameRestart
		const onGameRestart = new OnEventEmit(cameraFade);

		// PlayAgain
		const playAgain = new Text(this, 0, 160);
		playAgain.text = "Play Again";
		playAgain.setStyle({ "fontSize": "42px" });
		endPanel.add(playAgain);

		// OnGameOverGroup
		const onGameOverGroup = this.add.container(0, 0);
		onGameOverGroup.blendMode = Phaser.BlendModes.SKIP_CHECK;

		// onGameOver
		const onGameOver = new OnEvent(onGameOverGroup);

		// scaleTween_gameover
		const scaleTween_gameover = new ScaleTween(onGameOver);

		// delay
		const delay = new Delay(onGameOver);

		// alphaTween_gameover
		const alphaTween_gameover = new AlphaTween(delay);

		// moveTween_EndPanel
		const moveTween_EndPanel = new MoveTween(alphaTween_gameover);

		// alphaTween_BlackTransparent
		const alphaTween_BlackTransparent = new AlphaTween(alphaTween_gameover);

		// playAudio_1
		const playAudio_1 = new PlayAudio(onGameOver);

		// PausePanel
		const pausePanel = this.add.container(350, 660);
		pausePanel.blendMode = Phaser.BlendModes.SKIP_CHECK;
		pausePanel.visible = false;

		// rectangle
		const rectangle = this.add.rectangle(0, 0, 4000, 4000);
		rectangle.alpha = 0.52;
		rectangle.isFilled = true;
		rectangle.fillColor = 0;
		pausePanel.add(rectangle);

		// backing_1
		const backing_1 = this.add.nineslice(0, 9, "Btn_OtherButton_Square04", undefined, 400, 300, 24, 28, 26, 37);
		pausePanel.add(backing_1);

		// PausedText
		const pausedText = this.add.text(0, -70, "", {});
		pausedText.preFX.padding = 1;
		pausedText.setOrigin(0.5, 0.5);
		pausedText.text = "Paused";
		pausedText.setStyle({ "color": "#ffffffff", "fontFamily": "Jersey15-Regular", "fontSize": "87px", "stroke": "#000000ff", "strokeThickness": 10, "shadow.offsetX": 12, "shadow.offsetY": 8, "shadow.stroke": true, "shadow.fill": true });
		pausePanel.add(pausedText);

		// RestartButton_1
		const restartButton_1 = this.add.nineslice(0, 60, "Btn_OtherButton_Square02", undefined, 200, 100, 16, 21, 20, 26);
		restartButton_1.setInteractive(new Phaser.Geom.Rectangle(0, 0, 200, 100), Phaser.Geom.Rectangle.Contains);
		pausePanel.add(restartButton_1);

		// onEvent_3
		const onEvent_3 = new OnEvent(restartButton_1);

		// pause_1
		const pause_1 = new Pause(onEvent_3);

		// setVisable
		const setVisable = new SetVisable(onEvent_3);

		// PlayAgain_1
		const playAgain_1 = this.add.text(0, 50, "", {});
		playAgain_1.preFX.padding = 1;
		playAgain_1.setOrigin(0.5, 0.5);
		playAgain_1.text = "Resume";
		playAgain_1.setStyle({ "color": "#ffffffff", "fontFamily": "Jersey15-Regular", "fontSize": "46px", "stroke": "#000000ff", "strokeThickness": 8, "shadow.offsetX": 6, "shadow.offsetY": 6, "shadow.stroke": true, "shadow.fill": true });
		pausePanel.add(playAgain_1);

		// lists
		const walls = [];

		// Col_Balls_Bricks
		this.physics.add.collider(ballLauncher.ballGroup, brickSpawner.group, this.destroyBrick);

		// Col_Bricks_EndLine
		this.physics.add.collider(brickSpawner.group, ballLauncher.ballLine, this.gameOver, undefined, this);

		// Col_Balls_Walls
		this.physics.add.collider(ballLauncher.ballGroup, wall);

		// onEvent (prefab fields)
		onEvent.eventName = "pointerdown";
		onEvent.once = true;

		// flashObject (prefab fields)
		flashObject.targetGameObject = startButton;
		flashObject.numberOfFlashes = 14;
		flashObject.timeBetweenFlashes = 50;

		// onEventEmit (prefab fields)
		onEventEmit.eventName = "onStartButtonPressed";
		onEventEmit.eventEmitter = "scene.events";

		// onEvent_2 (prefab fields)
		onEvent_2.eventName = "pointerdown";

		// setVisable_1 (prefab fields)
		setVisable_1.targetGameObject = pausePanel;
		setVisable_1.show = true;

		// onGameStartTimer (prefab fields)
		onGameStartTimer.eventName = "onGameStart";
		onGameStartTimer.eventEmitter = "scene.events";
		onGameStartTimer.once = true;

		// timer_1 (prefab fields)
		timer_1.timerLength = 360;

		// onGameOverTimerEvent (prefab fields)
		onGameOverTimerEvent.eventName = "onGameOver";
		onGameOverTimerEvent.eventEmitter = "scene.events";

		// messageDisplay_1 (prefab fields)
		messageDisplay_1.textObject = pointsGainedMessage_Number;
		messageDisplay_1.messageEvent = "onDisplayPoints";

		// moveTween_1 (prefab fields)
		moveTween_1.targetGameObject = pointsGainedMessage_Number;
		moveTween_1.fromX = -650;
		moveTween_1.fromY = -140;
		moveTween_1.x = -30;
		moveTween_1.y = -140;
		moveTween_1.duration = 500;
		moveTween_1.ease = "Back.easeOut";

		// alphaTween_5 (prefab fields)
		alphaTween_5.targetGameObject = pointsMessageDisplay;
		alphaTween_5.fromAlpha = 1;
		alphaTween_5.alpha = 0;
		alphaTween_5.duration = 1000;

		// moveTween_2 (prefab fields)
		moveTween_2.targetGameObject = pointsGainsMessage_String;
		moveTween_2.fromX = 650;
		moveTween_2.fromY = 10;
		moveTween_2.x = -30;
		moveTween_2.y = 10;
		moveTween_2.duration = 500;
		moveTween_2.ease = "Back.easeOut";

		// alphaTween_4 (prefab fields)
		alphaTween_4.targetGameObject = pointsMessageDisplay;
		alphaTween_4.fromAlpha = 0;
		alphaTween_4.alpha = 1;
		alphaTween_4.duration = 200;

		// messageDisplay_2 (prefab fields)
		messageDisplay_2.textObject = bricksMessage_Number;
		messageDisplay_2.messageEvent = "onDisplayBricks";

		// moveTween_3 (prefab fields)
		moveTween_3.targetGameObject = bricksMessage_Number;
		moveTween_3.fromX = -650;
		moveTween_3.fromY = -140;
		moveTween_3.x = -30;
		moveTween_3.y = -140;
		moveTween_3.duration = 500;
		moveTween_3.ease = "Back.easeOut";

		// alphaTween_6 (prefab fields)
		alphaTween_6.targetGameObject = bricksMessageDisplay;
		alphaTween_6.fromAlpha = 1;
		alphaTween_6.alpha = 0;
		alphaTween_6.duration = 1000;

		// moveTween_4 (prefab fields)
		moveTween_4.targetGameObject = bricksMessage_String;
		moveTween_4.fromX = 650;
		moveTween_4.fromY = 10;
		moveTween_4.x = -30;
		moveTween_4.y = 10;
		moveTween_4.duration = 500;
		moveTween_4.ease = "Back.easeOut";

		// alphaTween_7 (prefab fields)
		alphaTween_7.targetGameObject = bricksMessageDisplay;
		alphaTween_7.fromAlpha = 0;
		alphaTween_7.alpha = 1;
		alphaTween_7.duration = 200;

		// onEvent_4 (prefab fields)
		onEvent_4.eventName = "pointerdown";

		// toggleImage (prefab fields)
		toggleImage.onImage = "icon_musicOn_128";
		toggleImage.offImage = "icon_musicOff_128";
		toggleImage.imageObject = icon_musicOn_128;

		// toggleSound (prefab fields)
		toggleSound.toggle = true;

		// moveTween (prefab fields)
		moveTween.targetGameObject = startButton;
		moveTween.fromX = 350;
		moveTween.fromY = -100;
		moveTween.x = 350;
		moveTween.y = 630;
		moveTween.duration = 1000;
		moveTween.ease = "Bounce.easeOut";

		// onStartButtonPressed (prefab fields)
		onStartButtonPressed.eventName = "onStartButtonPressed";
		onStartButtonPressed.eventEmitter = "scene.events";

		// alphaTween (prefab fields)
		alphaTween.targetGameObject = countDown_3;
		alphaTween.fromAlpha = 1;
		alphaTween.alpha = 0;
		alphaTween.duration = 1000;
		alphaTween.ease = "Linear";

		// scaleTween (prefab fields)
		scaleTween.targetGameObject = countDown_3;
		scaleTween.x = 1;
		scaleTween.y = 1;
		scaleTween.duration = 1000;
		scaleTween.ease = "Quad.easeOut";

		// alphaTween_1 (prefab fields)
		alphaTween_1.targetGameObject = countDown_2;
		alphaTween_1.fromAlpha = 1;
		alphaTween_1.alpha = 0;
		alphaTween_1.duration = 1000;
		alphaTween_1.ease = "Linear";

		// scaleTween_1 (prefab fields)
		scaleTween_1.targetGameObject = countDown_2;
		scaleTween_1.x = 1;
		scaleTween_1.y = 1;
		scaleTween_1.duration = 1000;
		scaleTween_1.ease = "Quad.easeOut";

		// alphaTween_2 (prefab fields)
		alphaTween_2.targetGameObject = countDown_1;
		alphaTween_2.fromAlpha = 1;
		alphaTween_2.alpha = 0;
		alphaTween_2.duration = 1000;
		alphaTween_2.ease = "Linear";

		// scaleTween_2 (prefab fields)
		scaleTween_2.targetGameObject = countDown_1;
		scaleTween_2.x = 1;
		scaleTween_2.y = 1;
		scaleTween_2.duration = 1000;
		scaleTween_2.ease = "Quad.easeOut";

		// alphaTween_3 (prefab fields)
		alphaTween_3.targetGameObject = countDown;
		alphaTween_3.fromAlpha = 1;
		alphaTween_3.alpha = 0;
		alphaTween_3.duration = 1000;
		alphaTween_3.ease = "Linear";

		// scaleTween_3 (prefab fields)
		scaleTween_3.targetGameObject = countDown;
		scaleTween_3.x = 1;
		scaleTween_3.y = 1;
		scaleTween_3.duration = 1000;
		scaleTween_3.ease = "Quad.easeOut";

		// onEventEmit_1 (prefab fields)
		onEventEmit_1.eventName = "onGameStart";
		onEventEmit_1.eventEmitter = "scene.events";

		// playAudio (prefab fields)
		playAudio.audio = "Afro Beats Riddim Cut 30";
		playAudio.loop = true;

		// onEvent_1 (prefab fields)
		onEvent_1.eventName = "pointerdown";
		onEvent_1.eventEmitter = "gameObject";
		onEvent_1.once = true;

		// cameraFade (prefab fields)
		cameraFade.fadeDirection = "Out";

		// onGameRestart (prefab fields)
		onGameRestart.eventName = "onRestart";
		onGameRestart.eventEmitter = "scene.events";

		// onGameOver (prefab fields)
		onGameOver.eventName = "onGameOver";
		onGameOver.eventEmitter = "scene.events";
		onGameOver.once = true;

		// scaleTween_gameover (prefab fields)
		scaleTween_gameover.targetGameObject = gameOverText;
		scaleTween_gameover.x = 1;
		scaleTween_gameover.y = 1;
		scaleTween_gameover.duration = 1000;
		scaleTween_gameover.ease = "Quad.easeOut";

		// delay (prefab fields)
		delay.delay = 1000;

		// alphaTween_gameover (prefab fields)
		alphaTween_gameover.targetGameObject = gameOverText;
		alphaTween_gameover.fromAlpha = 1;
		alphaTween_gameover.alpha = 0;
		alphaTween_gameover.duration = 1000;
		alphaTween_gameover.ease = "Linear";

		// moveTween_EndPanel (prefab fields)
		moveTween_EndPanel.targetGameObject = endPanel;
		moveTween_EndPanel.fromX = 350;
		moveTween_EndPanel.fromY = -600;
		moveTween_EndPanel.x = 350;
		moveTween_EndPanel.y = 630;
		moveTween_EndPanel.duration = 1000;
		moveTween_EndPanel.ease = "Back.easeOut";

		// alphaTween_BlackTransparent (prefab fields)
		alphaTween_BlackTransparent.targetGameObject = rectangle_1;
		alphaTween_BlackTransparent.alpha = 0.5;
		alphaTween_BlackTransparent.duration = 1000;
		alphaTween_BlackTransparent.ease = "Quad.easeOut";

		// playAudio_1 (prefab fields)
		playAudio_1.audio = "Electronicish Neutral K";

		// onEvent_3 (prefab fields)
		onEvent_3.eventName = "pointerdown";
		onEvent_3.eventEmitter = "gameObject";

		// pause_1 (prefab fields)
		pause_1.pause = false;

		// setVisable (prefab fields)
		setVisable.targetGameObject = pausePanel;

		this.bG = bG;
		this.scoreManager = scoreManager;
		this.wallsContainer = wallsContainer;
		this.ballLauncher = ballLauncher;
		this.startButton = startButton;
		this.countDown_1 = countDown_1;
		this.countDown_2 = countDown_2;
		this.countDown_3 = countDown_3;
		this.countDown = countDown;
		this.gameOverText = gameOverText;
		this.pause = pause;
		this.timer = timer;
		this.pointsGainsMessage_String = pointsGainsMessage_String;
		this.pointsGainedMessage_Number = pointsGainedMessage_Number;
		this.bricksMessage_String = bricksMessage_String;
		this.bricksMessage_Number = bricksMessage_Number;
		this.finalScore = finalScore;
		this.playAgain = playAgain;
		this.endPanel = endPanel;
		this.pausePanel = pausePanel;
		this.walls = walls;

		this.events.emit("scene-awake");
	}

	/** @type {Phaser.GameObjects.Image} */
	bG;
	/** @type {Phaser.GameObjects.Container} */
	wallsContainer;
	/** @type {ScoreManager} */
	scoreManager;
	/** @type {BallLauncher} */
	ballLauncher;
	/** @type {Text} */
	startButton;
	/** @type {Text} */
	countDown_1;
	/** @type {Text} */
	countDown_2;
	/** @type {Text} */
	countDown_3;
	/** @type {Text} */
	countDown;
	/** @type {Text} */
	gameOverText;
	/** @type {Phaser.GameObjects.Text} */
	pause;
	/** @type {Text} */
	timer;
	/** @type {Text} */
	pointsGainsMessage_String;
	/** @type {Text} */
	pointsGainedMessage_Number;
	/** @type {Text} */
	bricksMessage_String;
	/** @type {Text} */
	bricksMessage_Number;
	/** @type {Phaser.GameObjects.Container} */
	endPanel;
	/** @type {Phaser.GameObjects.Container} */
	pausePanel;
	/** @type {Array<any>} */
	walls;

	/* START-USER-CODE */
	gameStart = true;
	themeData = null;
	/** Balance in minor units when session/test registry is used (optional UI hook) */
	balancePennies = 0;
	// Write more your code here

	init(data) {
		// Receive theme data from Preload scene
		this.themeData = data?.themeData || null;
	}

	create()
		 {
		const useSession = this.registry.get('preloadUseSessionConfig');
		const minor = this.registry.get('preloadOperatorBalance');
		if (useSession && minor != null) {
			this.balancePennies = minor;
		} else {
			this.balancePennies = GameConfig.game.TEST_BALANCE_MINOR;
		}

		this.editorCreate();
		this.gameStart = true;
		this.bG.setDepth(-1000);
		
		// Apply theme to text elements
		if (this.themeData) {
			this.applyThemeToTexts();
		}
		
		this.events.once("onRestart", () => {this.restart()});
		this.input.keyboard.once("keydown-SPACE", () => {this.events.emit("onGameOver"); this.restart()})
		//this.events.once("onGameOver", () => {this.active = false})

		void showNovalinkTournamentOverlay();
		this.events.once('onGameOver', () => {
			void submitNovalinkTournamentScore(this.scoreManager?.score ?? 0);
		});

        }

	applyThemeToTexts() {
		// Apply theme to all text elements
		if (this.timer) applyTextTheme(this.timer, this.themeData);
		// Apply game message theme to START, countdown, game over, and goals messages
		if (this.startButton) applyGameMessageTextTheme(this.startButton, this.themeData);
		if (this.countDown_1) applyGameMessageTextTheme(this.countDown_1, this.themeData);
		if (this.countDown_2) applyGameMessageTextTheme(this.countDown_2, this.themeData);
		if (this.countDown_3) applyGameMessageTextTheme(this.countDown_3, this.themeData);
		if (this.countDown) applyGameMessageTextTheme(this.countDown, this.themeData);
		if (this.gameOverText) applyGameMessageTextTheme(this.gameOverText, this.themeData);
		if (this.pointsGainsMessage_String) applyGameMessageTextTheme(this.pointsGainsMessage_String, this.themeData);
		if (this.pointsGainedMessage_Number) applyGameMessageTextTheme(this.pointsGainedMessage_Number, this.themeData);
		if (this.bricksMessage_String) applyGameMessageTextTheme(this.bricksMessage_String, this.themeData);
		if (this.bricksMessage_Number) applyGameMessageTextTheme(this.bricksMessage_Number, this.themeData);
		if (this.finalScore) applyTextTheme(this.finalScore, this.themeData);
		if (this.playAgain) applyTextTheme(this.playAgain, this.themeData);
	}

		destroyBrick(ball, brick)
		{
			brick.damage(ball);
		}

		gameOver(brick, line)
		{
			if(this.gameStart == false) {return};
			this.gameStart = false;
			this.events.emit("onGameOver");
		}

		restart()
		{
			this.scene.stop('Level');
			this.scene.start("Preload")
		}



	/* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here
