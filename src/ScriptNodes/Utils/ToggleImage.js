
// You can write more code here

/* START OF COMPILED CODE */

import ScriptNode from "../../../phaserjs_editor_scripts_base/ScriptNode.js";
/* START-USER-IMPORTS */
/* END-USER-IMPORTS */

export default class ToggleImage extends ScriptNode {

	constructor(parent) {
		super(parent);

		/* START-USER-CTR-CODE */
		// Write your code here.
		/* END-USER-CTR-CODE */
	}

	/** @type {string} */
	onImage = "";
	/** @type {string} */
	offImage = "";
	/** @type {boolean} */
	toggle = false;
	/** @type {Phaser.GameObjects.GameObject} */
	imageObject;

	/* START-USER-CODE */

	// Write your code here.
	execute()
	{
		if(this.toggle)
		{
			this.imageObject.setTexture(this.offImage)
			this.toggle = false;
		}else
		{
			this.imageObject.setTexture(this.onImage)
			this.toggle = true;
		}
	}

	/* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here
