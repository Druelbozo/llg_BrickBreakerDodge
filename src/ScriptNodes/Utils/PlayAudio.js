
// You can write more code here

/* START OF COMPILED CODE */

import ScriptNode from "../../../phaserjs_editor_scripts_base/ScriptNode.js";
/* START-USER-IMPORTS */
/* END-USER-IMPORTS */

export default class PlayAudio extends ScriptNode {

	constructor(parent) {
		super(parent);

		/* START-USER-CTR-CODE */
		// Write your code here.
		/* END-USER-CTR-CODE */
	}

	/** @type {string} */
	audio = "Afro Beats Riddim Main";
	/** @type {boolean} */
	loop = false;

	/* START-USER-CODE */
	execute()
	{
		this.soundObject = this.scene.sound.add(this.audio);	
		this.soundObject.setLoop(this.loop);
		this.soundObject.setVolume(0.05);
		this.soundObject.play();		
	}

	destroy()
	{
		if(this.soundObject != undefined){this.soundObject.stop();}
	}

	// Write your code here.

	/* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here
