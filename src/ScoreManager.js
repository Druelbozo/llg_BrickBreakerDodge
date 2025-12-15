
// You can write more code here

/* START OF COMPILED CODE */

import Text from "./ScriptNodes/Basics/Text.js";
/* START-USER-IMPORTS */
/* END-USER-IMPORTS */

export default class ScoreManager extends Phaser.GameObjects.Container {

	constructor(scene, x, y) {
		super(scene, x ?? 350, y ?? 0);

		this.blendMode = Phaser.BlendModes.SKIP_CHECK;

		// scoreText
		const scoreText = new Text(scene, 0, 1);
		scoreText.setOrigin(0.5, 0);
		scoreText.text = "";
		scoreText.setStyle({ "fontSize": "84px", "strokeThickness": 7 });
		this.add(scoreText);

		this.scoreText = scoreText;

		/* START-USER-CTR-CODE */
		// Write your code here.
		this.scene.events.on("onScore", (score, breaks) => this.setScore(score, breaks))
		this.scene.events.on("PlayerLoopComplete", () => this.reset())
		this.scene.events.on("onGameOver", () => {this.onDisable();})
		/* END-USER-CTR-CODE */
	}

	/** @type {Text} */
	scoreText;

	/* START-USER-CODE */
	score = 0;
	scoreThisRound = 0;
	breaksThisRound = 0;
	breakthreshold = 0;
	// Write your code here.
	onDisable()
	{
		this.scene.events.off("onScore")
		this.scene.events.off("onGameOver")
		this.scene.events.off("PlayerLoopComplete")
	}

	reset()
	{
		this.scoreThisRound = 0;
		this.breaksThisRound = 0;
		this.breakthreshold = 0
	}

	setScore(scoreValue, breaks)
	{
		this.score += scoreValue;
		this.scoreThisRound += scoreValue;
		this.breaksThisRound += breaks;

		this.scoreText.text = this.score;
		this.scoreText.scaleX = 1.2;
		this.scoreText.scaleY = 1.2;

			this.scene.add.tween
			({
				targets: this.scoreText,
				scaleX: 1,
				scaleY: 1,
				duration: 350,
				ease: 'Power2',
			});

		if(this.score <= 0)
		{
			this.scoreText.text = "";
		}

		if(this.scoreThisRound % 100 === 0)
		{
			this.scene.events.emit("onDisplayPoints", this.scoreThisRound)
		}

		if(this.breaksThisRound % 5 === 0 && this.breaksThisRound != this.breakthreshold)
		{
			this.breakthreshold = this.breaksThisRound;
			this.scene.events.emit("onDisplayBricks", this.breaksThisRound)
		}


	}


	/* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here
