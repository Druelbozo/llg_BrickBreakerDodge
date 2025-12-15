
// You can write more code here

/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
import Brick from "./Brick.js";
/* END-USER-IMPORTS */

export default class BrickSpawner extends Phaser.GameObjects.Container {

	constructor(scene, x, y) {
		super(scene, x ?? 0, y ?? 0);

		this.blendMode = Phaser.BlendModes.SKIP_CHECK;

		/* START-USER-CTR-CODE */
		// Write your code here.

		this.group = scene.physics.add.group(
		{
			classType: Brick,

		});
				console.log(this.group);
		this.group.setDepth(-1);
		this.scene.events.on("PlayerLoopComplete", () => {this.spawn()})
		this.scene.events.on("onGameStart", () => {this.initalize()})
		this.scene.events.on("onGameOver", () => {this.onDisable();})
		//this.scene.events.on('shutdown', () => { this.onDisable() });

		/* END-USER-CTR-CODE */
	}

	/* START-USER-CODE */
	/** @type {Phaser.GameObjects.group}  */
	group = this.group;
	brickHealth = 1;
	active = false;
	// Write your code here.

	initalize()
	{
		console.log(this.group);
		this.active = true;
		this.brickHealth = 1;
		this.spawn();
	}

	onDisable()
	{
		this.scene.events.off("PlayerLoopComplete")
		this.scene.events.off("onGameStart")
		this.scene.events.off("onGameOver")
	}

	spawn(){

		if(!this.active) {return;}
		/** @type {Phaser.scene}  */
		const _scene = this.scene;
			let blocksSkipped = 0;

			for (let i = 0; i < 7; i += 1)
			{
				let rand = Phaser.Math.RND.between(0,1);
				if(rand == 1 && blocksSkipped != 6){blocksSkipped += 1; continue;}

				const x = i * 100;
				const y = this.y - 100;
				let brick = this.group.get(x,y);
				brick.scaleX = 2;
				brick.scaleY = 2;
				//brick.setDepth(-brick.y);
				brick.enableBrick();
				brick.initalize(this.brickHealth);
			}

			_scene.add.tween
			({
				targets: this.group.getChildren(),
				y: '+=100',
				duration: 500,
				ease: 'Power2',
				onComplete: () =>
				{
				 this.scene.events.emit("boardSet");
				}
			});

			this.group.getChildren().forEach(child => {
   			 	child.setDepth(child.y - 1000);
			});

			let increase = this.brickHealth * 1.05 + 1;
			this.brickHealth = Phaser.Math.RoundTo(increase, 0)
	}

	/* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here
