
// You can write more code here

/* START OF COMPILED CODE */

import SetToMousePosition from "./ScriptNodes/Acrade/SetToMousePosition.js";
/* START-USER-IMPORTS */
/* END-USER-IMPORTS */

export default class Padel extends Phaser.Physics.Arcade.Image {

	constructor(scene, x, y, texture, frame) {
		super(scene, x ?? 0, y ?? 0, texture || "Brick", frame);

		this.scaleX = 5;
		this.scaleY = 0.5;
		scene.physics.add.existing(this, false);
		this.body.moves = false;
		this.body.allowGravity = false;
		this.body.allowDrag = false;
		this.body.allowRotation = false;
		this.body.pushable = false;
		this.body.setSize(50, 50, false);

		// setToMousePosition
		new SetToMousePosition(this);

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
