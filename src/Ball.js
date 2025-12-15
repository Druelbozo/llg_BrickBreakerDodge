
// You can write more code here

/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
/* END-USER-IMPORTS */

export default class Ball extends Phaser.GameObjects.Container {

	constructor(scene, x, y) {
		super(scene, x ?? 0, y ?? 0);

		this.blendMode = Phaser.BlendModes.SKIP_CHECK;
		scene.physics.add.existing(this, false);
		this.body.friction.x = 0;
		this.body.bounce.x = 1;
		this.body.bounce.y = 1;
		this.body.angularVelocity = 720;
		this.body.allowGravity = false;
		this.body.allowDrag = false;
		this.body.collideWorldBounds = true;
		this.body.setOffset(-25, -25);
		this.body.setCircle(25);

		// Visual
		const visual = scene.add.container(0, 0);
		visual.blendMode = Phaser.BlendModes.SKIP_CHECK;
		visual.scaleX = 0.5;
		visual.scaleY = 0.5;
		this.add(visual);

		// arcadeimage_1
		const arcadeimage_1 = scene.add.image(0, 0, "Breaker_DodgeBall");
		arcadeimage_1.tintTopLeft = 16517189;
		arcadeimage_1.tintTopRight = 16715792;
		arcadeimage_1.tintBottomLeft = 10748155;
		arcadeimage_1.tintBottomRight = 10748155;
		visual.add(arcadeimage_1);

		// ellipse_1
		const ellipse_1 = scene.add.ellipse(19, -13, 128, 128);
		ellipse_1.scaleX = 0.11286955681891375;
		ellipse_1.scaleY = 0.21747966893027604;
		ellipse_1.angle = -30;
		ellipse_1.isFilled = true;
		visual.add(ellipse_1);

		/* START-USER-CTR-CODE */
		// Write your code here.
		/* END-USER-CTR-CODE */
	}

	/* START-USER-CODE */

	// Write your code here.

	/* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here
