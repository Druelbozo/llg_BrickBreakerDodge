
// You can write more code here

/* START OF COMPILED CODE */

import ScriptNode from "../../../phaserjs_editor_scripts_base/ScriptNode.js";
/* START-USER-IMPORTS */
/* END-USER-IMPORTS */

export default class CameraFade extends ScriptNode {

	constructor(parent) {
		super(parent);

		/* START-USER-CTR-CODE */
		// Write your code here.
		/* END-USER-CTR-CODE */
	}

	/** @type {number} */
	duration = 1000;
	/** @type {"In"|"Out"} */
	fadeDirection = "In";
	/** @type {number} */
	r = 255;
	/** @type {number} */
	g = 255;
	/** @type {number} */
	b = 255;

	/* START-USER-CODE */

	// Write your code here.
	execute()
	{
		/** @type {Phaser.Scene} */
		const scene = this.scene;
		const cam = scene.cameras.main;
		if(this.fadeDirection == "In")
		{
			cam.once(Phaser.Cameras.Scene2D.Events.FADE_IN_COMPLETE,() => {this.executeChildren()})
			cam.fadeIn(this.duration, this.r,this.g,this.b)
		}
		if(this.fadeDirection == "Out")
		{
			cam.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE,() => {this.executeChildren()})
			cam.fadeOut(this.duration, this.r,this.g,this.b)
		}

	}

	/* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here
