
// You can write more code here

/* START OF COMPILED CODE */

import NodeScriptWithTarget from "../Base/NodeScriptWithTarget.js";
import ScriptNode from "../../../phaserjs_editor_scripts_base/ScriptNode.js";
/* START-USER-IMPORTS */
/* END-USER-IMPORTS */

export default class ScaleTween extends NodeScriptWithTarget {

	constructor(parent) {
		super(parent);

		/* START-USER-CTR-CODE */
		// Write your code here.
		/* END-USER-CTR-CODE */
	}

	/** @type {number} */
	fromX = 0;
	/** @type {number} */
	fromY = 0;
	/** @type {number} */
	x = 0;
	/** @type {number} */
	y = 0;
	/** @type {number} */
	duration = 1000;
	/** @type {"Linear"|"Quad.easeIn"|"Quad.easeOut"|"Quad.easeInOut"|"Cubic.easeIn"|"Cubic.easeOut"|"Cubic.easeInOut"|"Quart.easeIn"|"Quart.easeOut"|"Quart.easeInOut"|"Quint.easeIn"|"Quint.easeOut"|"Quint.easeInOut"|"Elastic.easeIn"|"Elastic.easeOut"|"Elastic.easeInOut"|"Bounce.easeIn"|"Bounce.easeOut"|"Bounce.easeInOut"|"Back.easeIn"|"Back.easeOut"|"Back.easeInOut"|"Sine.easeIn"|"Sine.easeOut"|"Sine.easeInOut"} */
	ease = "";

	/* START-USER-CODE */
	tween;
	// Write your code here.
	execute(...args)
	{
		if(this.tween != undefined){this.tween.destroy();}
		const obj = this.targetGameObject;

		obj.scaleX = this.fromX;
		obj.scaleY = this.fromY;

		this.scene.add.tween
		({
			targets: obj,
			scaleX: this.x,
			scaleY: this.y,
			duration: this.duration,
			ease: this.ease,
			onComplete: () => {this.executeChildren(args)}
		})
	}
	/* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here
