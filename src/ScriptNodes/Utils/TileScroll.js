
// You can write more code here

/* START OF COMPILED CODE */

import ScriptNode from "../../../phaserjs_editor_scripts_base/ScriptNode.js";
/* START-USER-IMPORTS */
/* END-USER-IMPORTS */

export default class TileScroll extends ScriptNode {

	constructor(parent) {
		super(parent);

		/* START-USER-CTR-CODE */
		// Write your code here.
		/* END-USER-CTR-CODE */
	}

	/** @type {number} */
	speedX = 1;
	/** @type {number} */
	speedY = 1;
	/** @type {number} */
	tileRestartX = 100;
	/** @type {number} */
	tileRestartX = 100;

	/* START-USER-CODE */

	// Write your code here.
	update(){
		this.gameObject.tilePositionX += this.speedX;
		this.gameObject.tilePositionY += this.speedY;

		if(this.gameObject.tilePositionX > this.tileRestartX){
			this.gameObject.tilePositionX = 0;
		}
				if(this.gameObject.tilePositionY > this.tileRestartY){
			this.gameObject.tilePositionY = 0;
		}
	}

	/* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here
