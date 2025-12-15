
// You can write more code here

/* START OF COMPILED CODE */

import ScriptNode from "../../../phaserjs_editor_scripts_base/ScriptNode.js";
/* START-USER-IMPORTS */
/* END-USER-IMPORTS */

export default class SetToMousePosition extends ScriptNode {

	constructor(parent) {
		super(parent);

		/* START-USER-CTR-CODE */
		// Write your code here.
		/* END-USER-CTR-CODE */
	}

	/* START-USER-CODE */

	// Write your code here.
	awake(){
		this.scene.input.on("pointermove", (pointer) =>{
					this.move(pointer);
		})
	}

	move(pointer)
	{
			let worldPoint = this.scene.cameras.main.getWorldPoint(pointer.x, pointer.y);
			this.gameObject.x = worldPoint.x;
	}

	/* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here
