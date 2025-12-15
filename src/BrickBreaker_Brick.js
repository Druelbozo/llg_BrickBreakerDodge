
// You can write more code here

/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
/* END-USER-IMPORTS */

export default class BrickBreaker_Brick extends Phaser.GameObjects.NineSlice {

	constructor(scene, x, y, texture, frame, width, height, leftWidth, rightWidth, topHeight, bottomHeight) {
		super(scene, x ?? 0, y ?? 0, texture || "Brick", frame, width ?? 100, height ?? 100, leftWidth ?? 10, rightWidth ?? 10, topHeight ?? 10, bottomHeight ?? 10);

		this.setOrigin(0, 0);
		scene.physics.add.existing(this, false);
		this.body.moves = false;
		this.body.allowGravity = false;
		this.body.allowDrag = false;
		this.body.allowRotation = false;
		this.body.pushable = false;
		this.body.setSize(100, 100, false);

		/* START-USER-CTR-CODE */
		// Write your code here.
		/* END-USER-CTR-CODE */
	}

	/* START-USER-CODE */
	brickHealth = 1;
	// Write your code here.
	hit(damage)
	{
		this.brickHealth -= damage;
					console.log("!")
		if(this.brickHealth <= 0)
		{
			console.log("!")
					this.body.enable = false;
					this.setActive(false);
					this.visible = false;
		}
	}

	setBrickSize(x,y)
	{
		console.log(x,y);
		this.setSize(x,y);
		this.body.setSize(x,y);
	}
	/* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here
