
// You can write more code here

/* START OF COMPILED CODE */

import TileScroll from "./ScriptNodes/Utils/TileScroll.js";
/* START-USER-IMPORTS */
/* END-USER-IMPORTS */

export default class AimLine extends Phaser.GameObjects.TileSprite {

	constructor(scene, x, y, width, height, texture, frame) {
		super(scene, x ?? 0, y ?? 0, width ?? 64, height ?? 64, texture || "Breaker_Circle", frame);

		this.scaleY = 4.5;
		this.setOrigin(0.5, 1);
		this.alphaTopLeft = 0;
		this.alphaTopRight = 0;
		this.tintTopLeft = 16727251;
		this.tintTopRight = 16734690;
		this.tintBottomLeft = 2930431;
		this.tintBottomRight = 52477;
		this.tilePositionX = -7;
		this.tileScaleY = 0.23;

		// tileScroll
		const tileScroll = new TileScroll(this);

		// tileScroll (prefab fields)
		tileScroll.speedX = 0;

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
