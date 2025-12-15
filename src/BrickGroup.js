
// You can write more code here

/* START OF COMPILED CODE */

import OnAwake from "./ScriptNodes/Utils/OnAwake.js";
import PrintMessage from "./ScriptNodes/Utils/PrintMessage.js";
import ParentMethod from "./ScriptNodes/ParentMethod.js";
/* START-USER-IMPORTS */
import BrickBreaker_Brick from "./BrickBreaker_Brick.js";
/* END-USER-IMPORTS */

export default class BrickGroup extends Phaser.GameObjects.Layer {

	constructor(scene) {
		super(scene);

		this.blendMode = Phaser.BlendModes.SKIP_CHECK;

		// onAwake
		const onAwake = new OnAwake(this);

		// printMessage
		new PrintMessage(onAwake);

		// parentMethod
		new ParentMethod(onAwake);

		/* START-USER-CTR-CODE */
		// Write your code here.
		this.group = scene.add.group(
		{
			classType: BrickBreaker_Brick
		});
		/* END-USER-CTR-CODE */
	}

	/** @type {number} */
	bricksPerLine = 10;
	/** @type {number} */
	lines = 3;
	/** @type {number} */
	brickHeight = 1;

	/* START-USER-CODE */
	/** @type {Phaser.GameObject.Group} */
	group;




	spawnBoard(){
				const spacing = (this.systems.canvas.width / this.bricksPerLine);
				const width = spacing * 0.01 * 2;

		for(let i = 0; i < this.lines; i += 1)
		{
			const y = 50 * (i * this.brickHeight);
			for (let i = 0; i < this.bricksPerLine; i += 1)
			{
				const x = i * spacing;
				let brick = this.group.get(x,y);
				brick.setBrickSize(width * 50, this.brickHeight * 50);
			}
		}


		
	}
	// Write your code here.

	/* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here
