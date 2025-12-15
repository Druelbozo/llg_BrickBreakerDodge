
// You can write more code here

/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
/* END-USER-IMPORTS */

export default class Text extends Phaser.GameObjects.Text {

	constructor(scene, x, y) {
		super(scene, x ?? 0, y ?? 26, "", {});

		this.setOrigin(0.5, 0.5);
		this.tintBottomLeft = 14831871;
		this.tintBottomRight = 35797;
		this.text = "New text";
		this.setStyle({ "fontFamily": "Jersey15-Regular", "fontSize": "50px", "stroke": "#000000ff", "strokeThickness": 5, "shadow.offsetY": 5, "shadow.stroke": true, "shadow.fill": true });
		this.setPadding({"bottom":10});

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
