
// You can write more code here

/* START OF COMPILED CODE */

import Padel from "../Padel.js";
import BrickGroup from "../BrickGroup.js";
import Ball from "../Ball.js";
/* START-USER-IMPORTS */
/* END-USER-IMPORTS */

export default class BrickBreaker extends Phaser.Scene {

	constructor() {
		super("BrickBreaker");

		/* START-USER-CTR-CODE */
		// Write your code here.
		/* END-USER-CTR-CODE */
	}

	/** @returns {void} */
	editorCreate() {

		// padel
		const padel = new Padel(this, 347, 1092);
		this.add.existing(padel);
		padel.scaleX = 3;
		padel.scaleY = 0.5;

		// brickGroup
		const brickGroup = new BrickGroup(this);
		this.add.existing(brickGroup);

		// ball
		const ball = new Ball(this, 364, 1021);
		this.add.existing(ball);
		ball.scaleX = 0.35;
		ball.scaleY = 0.35;
		ball.body.velocity.x = -1000;
		ball.body.velocity.y = -1000;

		// collider
		this.physics.add.collider(ball, padel);

		// collider_1
		this.physics.add.collider(ball, brickGroup.group, this.hitBrick, undefined, this);

		// brickGroup (prefab fields)
		brickGroup.lines = 6;
		brickGroup.brickHeight = 1;

		this.events.emit("scene-awake");
	}

	/* START-USER-CODE */

	// Write your code here

	create() {

		this.editorCreate();


	}

				hitBrick(ball, brick)
			{
				brick.hit(1);
			}



	/* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here
