
// You can write more code here

/* START OF COMPILED CODE */

import OnEvent from "./ScriptNodes/Utils/OnEvent.js";
import OnEventEmit from "./ScriptNodes/Utils/OnEventEmit.js";
/* START-USER-IMPORTS */
/* END-USER-IMPORTS */

export default class StartButton extends Phaser.GameObjects.Text {

	constructor(scene, x, y) {
		super(scene, x ?? 683, y ?? 418, "", {});

		this.setInteractive(new Phaser.Geom.Rectangle(0, 0, 541, 165), Phaser.Geom.Rectangle.Contains);
		this.setOrigin(0.5, 0.5);
		this.text = "START";
		this.setStyle({ "align": "center", "color": "#f7c700ff", "fontFamily": "Jersey15-Regular", "fontSize": "180px", "stroke": "#000000ff", "strokeThickness": 13, "shadow.offsetX": 9, "shadow.offsetY": 10, "shadow.stroke": true, "shadow.fill": true });

		// onEvent
		const onEvent = new OnEvent(this);

		// onEventEmit
		const onEventEmit = new OnEventEmit(onEvent);

		// onEvent (prefab fields)
		onEvent.eventName = "pointerdown";
		onEvent.eventEmitter = "gameObject";

		// onEventEmit (prefab fields)
		onEventEmit.eventName = "onGameStart";
		onEventEmit.eventEmitter = "scene.events";

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
