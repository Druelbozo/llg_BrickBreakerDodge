
// You can write more code here

/* START OF COMPILED CODE */

import TileScroll from "./ScriptNodes/Utils/TileScroll.js";
import AimLine from "./AimLine.js";
import Text from "./ScriptNodes/Basics/Text.js";
/* START-USER-IMPORTS */
import Ball from "./Ball.js";
/* END-USER-IMPORTS */

export default class BallLauncher extends Phaser.GameObjects.Container {

	constructor(scene, x, y) {
		super(scene, x ?? 0, y ?? 0);

		this.blendMode = Phaser.BlendModes.SKIP_CHECK;
		this.setInteractive(new Phaser.Geom.Rectangle(-1600, -5, 3200, -1468.3995624404847), Phaser.Geom.Rectangle.Contains);

		// cautionLine
		const cautionLine = scene.add.tileSprite(0, 0, 2000, 24, "CautionLine");
		cautionLine.alpha = 0.27;
		cautionLine.alphaTopLeft = 0.27;
		cautionLine.alphaTopRight = 0.27;
		cautionLine.alphaBottomLeft = 0.27;
		cautionLine.alphaBottomRight = 0.27;
		cautionLine.tintTopLeft = 15925493;
		cautionLine.tintTopRight = 15925493;
		cautionLine.tintBottomLeft = 15925493;
		cautionLine.tintBottomRight = 15925493;
		cautionLine.tileScaleY = 0.4;
		this.add(cautionLine);

		// tileScroll_1
		const tileScroll_1 = new TileScroll(cautionLine);

		// ballLine
		const ballLine = scene.physics.add.image(0, 0, "_MISSING");
		ballLine.scaleX = 100;
		ballLine.scaleY = 0.1;
		ballLine.visible = false;
		ballLine.body.moves = false;
		ballLine.body.allowGravity = false;
		ballLine.body.allowDrag = false;
		ballLine.body.allowRotation = false;
		ballLine.body.collideWorldBounds = true;
		ballLine.body.onWorldBounds = true;
		ballLine.body.pushable = false;
		ballLine.body.setSize(1000, 50, false);
		this.add(ballLine);

		// LaunchPoint
		const launchPoint = scene.add.container(0, 0);
		launchPoint.blendMode = Phaser.BlendModes.SKIP_CHECK;
		this.add(launchPoint);

		// aimLine
		const aimLine = new AimLine(scene, 0, 0);
		launchPoint.add(aimLine);

		// ballAmountText
		const ballAmountText = new Text(scene, 0, 59);
		ballAmountText.text = "";
		ballAmountText.setStyle({  });
		launchPoint.add(ballAmountText);

		// ballPoint
		const ballPoint = scene.add.container(0, 0);
		ballPoint.blendMode = Phaser.BlendModes.SKIP_CHECK;
		ballPoint.setInteractive(new Phaser.Geom.Rectangle(-873, -675, 1800, 845), Phaser.Geom.Rectangle.Contains);
		launchPoint.add(ballPoint);

		// Visual
		const visual = scene.add.container(0, 0);
		visual.blendMode = Phaser.BlendModes.SKIP_CHECK;
		visual.scaleX = 0.5;
		visual.scaleY = 0.5;
		ballPoint.add(visual);

		// arcadeimage
		const arcadeimage = scene.add.image(0, 0, "Breaker_DodgeBall");
		arcadeimage.tintTopLeft = 16517189;
		arcadeimage.tintTopRight = 16517189;
		arcadeimage.tintBottomLeft = 10748155;
		arcadeimage.tintBottomRight = 10748155;
		visual.add(arcadeimage);

		// ellipse
		const ellipse = scene.add.ellipse(19, -13, 128, 128);
		ellipse.scaleX = 0.11286955681891375;
		ellipse.scaleY = 0.21747966893027604;
		ellipse.angle = -30;
		ellipse.isFilled = true;
		visual.add(ellipse);

		// tileScroll_1 (prefab fields)
		tileScroll_1.speedY = 0;
		tileScroll_1.tileRestartX = 1000;
		tileScroll_1.tileRestartX = 1000;

		this.ballLine = ballLine;
		this.aimLine = aimLine;
		this.ballAmountText = ballAmountText;
		this.ballPoint = ballPoint;
		this.launchPoint = launchPoint;

		/* START-USER-CTR-CODE */
		// Write your code here.
		this.ballPoint.on("pointerdown", (pointer) => this.startAim());
		this.ballPoint.on("pointerup", (pointer) => this.endAim());
		this.ballPoint.on("pointermove", (pointer) => this.aim(pointer));

		this.scene.events.on("boardSet", () => this.show());
		this.scene.events.on("onGameStart", () => this.setUp());
		this.scene.events.on("onGameOver", () => {this.onDisable();});

		this.ballGroup = scene.add.group(
		{
			classType: Ball
		});

		scene.physics.add.collider(ballLine, this.ballGroup, (line, ball) => this.ballReturn(line, ball));

		this.aimLine.visible = false;
		this.hide();

		/* END-USER-CTR-CODE */
	}

	/** @type {Phaser.Physics.Arcade.Image} */
	ballLine;
	/** @type {AimLine} */
	aimLine;
	/** @type {Text} */
	ballAmountText;
	/** @type {Phaser.GameObjects.Container} */
	ballPoint;
	/** @type {Phaser.GameObjects.Container} */
	launchPoint;
	/** @type {number} */
	ballSpeed = 1000;
	/** @type {string} */
	returnSound = "Collect";

	/* START-USER-CODE */

	// Write your code here.
	active = false;
	aiming = false;
	aimValue = 90;
	angle = 90;
	launchPosX = 0;
	launchPosY = 0;
	ballsReturn = 0;
	ballAmount = 0;
	ballsLoaded = 0;

	setUp()
	{
		this.ballAmount = 0;
	}

	onDisable()
	{
		this.ballPoint.off("pointerdown");
		this.ballPoint.off("pointerup");
		this.ballPoint.off("pointermove");

		this.scene.events.off("boardSet");
		this.scene.events.off("onGameStart");
		this.scene.events.off("onGameOver");
	}

	ballReturn(line, ball)
	{
		ball.body.stop();
		ball.body.enable = false;

		let lineWorldPos = line.getWorldTransformMatrix();
		ball.y = lineWorldPos.ty;

		if(this.ballsReturn === 0)
		{
			let newLaunchPos = ball.getWorldTransformMatrix();
			this.launchPosX = newLaunchPos.tx;
			this.launchPosY = newLaunchPos.ty;
			let localPos = this.getLocalPoint(this.launchPosX, this.launchPosY)
			ball.visible = false;
			ball.setActive(false);
			this.scene.add.tween
			({
				targets: this.launchPoint,
				x: localPos.x,
				y: localPos.y,
				duration: 300,
				ease: 'Back.easeOut'
			})			

		}
		else
		{
			this.scene.add.tween
			({
				targets: ball,
				x: this.launchPosX,
				y: this.launchPosY,
				duration: 300,
				ease: 'Back.easeOut',
				onComplete: () => {ball.visible = false; ball.setActive(false);}
			})
		}


		this.ballsReturn += 1;

		this.scene.sound.play(this.returnSound);

		if(this.ballsReturn == this.ballAmount)
		{
			this.scene.events.emit("PlayerLoopComplete")
		}




	}

	startAim()
	{
		if(!this.active) return;
		this.aimLine.visible = true;
		this.aiming = true;

			let lineWorldPos = this.launchPoint.getWorldTransformMatrix();
			let pointer = this.scene.input.activePointer;
			let mousePos = this.scene.cameras.main.getWorldPoint(pointer.x,pointer.y)
			this.angle = Phaser.Math.Angle.Between(lineWorldPos.tx, lineWorldPos.ty, mousePos.x, mousePos.y);

			this.aimValue = Phaser.Math.RadToDeg(this.angle) + 90;
			this.aimLine.angle = this.aimValue;
	}

	endAim()
	{
			if(!this.active) return;
			if(this.aiming == false) return;
			this.aimLine.visible  = false;
			this.aiming = false;

			this.fire();

	}

	fire()
	{
		if(!this.active) return;

		this.ballsReturn = 0;

		if(this.launchPosX == 0 || this.launchPosY == 0)
		{
			let newLaunchPos = this.launchPoint.getWorldTransformMatrix();
			this.launchPosX = newLaunchPos.tx;
			this.launchPosY = newLaunchPos.ty;
		}
		let posX = this.launchPosX;
		let posY = this.launchPosY;
		this.fireBall(posX,posY)
		for (let i = 1; i < this.ballAmount; i += 1)
		{
			this.scene.time.addEvent
			(
				{
					delay: 100 * i,
					callback: () => this.fireBall(posX,posY)
				}
			)
		}

		this.hide();
	}

	fireBall(posX, posY)
	{
		this.ballsLoaded--;
		this.ballAmountText.text = this.ballsLoaded;
		let ball = this.ballGroup.get(posX,posY);
		ball.body.enable = true;
		ball.setActive(true);
		ball.visible = true;
		ball.setDepth(-1);
		let angle = Phaser.Math.DegToRad(this.aimValue - 90);

		this.scene.physics.velocityFromRotation(angle, this.ballSpeed, ball.body.velocity);
	}

	aim(pointer)
	{
		if(!this.active) return;

		if(this.aiming)
		{
			let lineWorldPos = this.aimLine.getWorldTransformMatrix();
			let pointer = this.scene.input.activePointer;
			let mousePos = this.scene.cameras.main.getWorldPoint(pointer.x,pointer.y)
			this.angle = Phaser.Math.Angle.Between(lineWorldPos.tx, lineWorldPos.ty, mousePos.x, mousePos.y);
			this.aimValue = Phaser.Math.RadToDeg(this.angle) + 90;
			this.aimValue = Phaser.Math.Clamp(this.aimValue, -75, 75);


			this.aimLine.angle = this.aimValue;
		}

	}

	hide(){

		this.active = false;
		this.scene.add.tween
		({
			targets: this.ballPoint,
			scaleX: 0,
			scaleY: 0,
			duration: 500,
			ease: 'Back.easeIn'
		})
	}

	show()
	{
		this.ballAmount += 1;
		this.ballsLoaded = this.ballAmount;
		this.ballAmountText.text = this.ballsLoaded;
		this.scene.add.tween
		({
			targets: this.ballPoint,
			scaleX: 1,
			scaleY: 1,
			duration: 500,
			ease: 'Back.easeOut',
			onComplete: () => {this.active = true}
		})
	}

	lineCrossed(){
		this.scene.events.emit("onGameOver");
	}

	/* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here
