
// You can write more code here

/* START OF COMPILED CODE */

import ScriptNode from "../../../phaserjs_editor_scripts_base/ScriptNode.js";
/* START-USER-IMPORTS */
/* END-USER-IMPORTS */

export default class Pause extends ScriptNode {

	constructor(parent) {
		super(parent);

		/* START-USER-CTR-CODE */
		// Write your code here.
		/* END-USER-CTR-CODE */
	}

	/** @type {boolean} */
	pause = true;

	/* START-USER-CODE */

	// Write your code here.
	execute()
	{
		/** @type {Phaser.scene} */
		const _scene = this.scene;
		_scene.time.paused = this.pause;

		if(this.pause)
		{
			_scene.physics.pause();
		}
		else
		{
			_scene.physics.resume();
		}
	}

	/* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here
