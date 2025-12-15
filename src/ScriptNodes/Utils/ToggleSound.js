
// You can write more code here

/* START OF COMPILED CODE */

import ScriptNode from "../../../phaserjs_editor_scripts_base/ScriptNode.js";
/* START-USER-IMPORTS */
/* END-USER-IMPORTS */

export default class ToggleSound extends ScriptNode {

	constructor(parent) {
		super(parent);

		/* START-USER-CTR-CODE */
		// Write your code here.
		/* END-USER-CTR-CODE */
	}

	/** @type {boolean} */
	toggle = false;

	/* START-USER-CODE */

	// Write your code here.
	execute()
	{
		if(this.toggle)
		{
			this.scene.sound.setMute(false)
			this.toggle = false;
		}else
		{
			this.scene.sound.setMute(true)
			this.toggle = true;
		}
	}

	/* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here
