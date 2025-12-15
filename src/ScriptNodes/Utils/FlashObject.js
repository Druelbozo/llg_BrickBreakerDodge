
// You can write more code here

/* START OF COMPILED CODE */

import NodeScriptWithTarget from "../Base/NodeScriptWithTarget.js";
import ScriptNode from "../../../phaserjs_editor_scripts_base/ScriptNode.js";
/* START-USER-IMPORTS */
/* END-USER-IMPORTS */

export default class FlashObject extends NodeScriptWithTarget {

	constructor(parent) {
		super(parent);

		/* START-USER-CTR-CODE */
		// Write your code here.
		/* END-USER-CTR-CODE */
	}

	/** @type {number} */
	numberOfFlashes = 6;
	/** @type {number} */
	timeBetweenFlashes = 1000;

	/* START-USER-CODE */
	currentFlash = 0;

	// Write your code here.
	execute()
	{
		this.currentFlash = 0;
		this.targetGameObject.visible = false;
		this.flash(this.targetGameObject);
	}

	flash(obj)
	{
		obj.visible = !obj.visible;
		if(this.currentFlash > this.numberOfFlashes){this.executeChildren(); return;}
		this.scene.time.addEvent
		({
			delay: this.timeBetweenFlashes,
			callback: () => {this.currentFlash += 1; this.flash(obj);}
		})
	}

	/* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here
