
// You can write more code here

/* START OF COMPILED CODE */

import Text from "./ScriptNodes/Basics/Text.js";
/* START-USER-IMPORTS */
import { getThemeImageKey, applyBrickTextTheme } from './utils/themeUtils.js';
import ColorUtils from './utils/ui/ColorUtils.js';
/* END-USER-IMPORTS */

export default class Brick extends Phaser.GameObjects.Container {

	constructor(scene, x, y) {
		super(scene, x ?? 0, y ?? 0);

		this.blendMode = Phaser.BlendModes.SKIP_CHECK;
		this.setInteractive(new Phaser.Geom.Rectangle(0, 0, 50, 50), Phaser.Geom.Rectangle.Contains);
		scene.physics.add.existing(this, false);
		this.body.moves = false;
		this.body.allowGravity = false;
		this.body.allowDrag = false;
		this.body.allowRotation = false;
		this.body.pushable = false;
		this.body.setSize(50, 50, false);

		// VisualContainer
		const visualContainer = scene.add.container(0, 0);
		visualContainer.blendMode = Phaser.BlendModes.SKIP_CHECK;
		this.add(visualContainer);

		// nineslice
		const themeData = scene.themeData;
		const shadowKey = themeData ? getThemeImageKey(themeData, "brick-shadow") : "Btn_OtherButton_Square08";
		const nineslice = scene.add.nineslice(0, 2, shadowKey || "Btn_OtherButton_Square08", undefined, 100, 100, 17, 10, 10, 10);
		nineslice.scaleX = 0.5;
		nineslice.scaleY = 0.5;
		nineslice.setOrigin(0, 0);
		nineslice.tint = 0;
		visualContainer.add(nineslice);

		// ColorBlock
		const colorKey = themeData ? getThemeImageKey(themeData, "brick-color") : "Btn_OtherButton_Square09";
		const colorBlockOffset = themeData?.brickStyles?.colorBlockOffset || { x: 0, y: 0 };
		const colorBlockScale = themeData?.brickStyles?.colorBlockScale ?? 0.5;
		
		// White border layer (if colorBlockOffset or colorBlockScale are set)
		const hasOffset = colorBlockOffset.x !== 0 || colorBlockOffset.y !== 0;
		const hasCustomScale = colorBlockScale !== 0.5;
		if (hasOffset || hasCustomScale) {
			const borderNineslice = scene.add.nineslice(0, 0, shadowKey || "Btn_OtherButton_Square08", undefined, 100, 100, 17, 10, 10, 10);
			borderNineslice.scaleX = 0.5;
			borderNineslice.scaleY = 0.5;
			borderNineslice.setOrigin(0, 0);
			// No tint = white border
			visualContainer.add(borderNineslice);
		}
		const colorBlock = scene.add.nineslice(colorBlockOffset.x, colorBlockOffset.y, colorKey || "Btn_OtherButton_Square09", undefined, 100, 100, 17, 18, 17, 20);
		colorBlock.scaleX = colorBlockScale;
		colorBlock.scaleY = colorBlockScale;
		colorBlock.setOrigin(0, 0);
		colorBlock.tint = 3715071;
		visualContainer.add(colorBlock);

		// manBody
		const manBodyKey = themeData ? getThemeImageKey(themeData, "manBody") : "ManBody";
		// Only create manBody if imageKey is not empty
		if (manBodyKey) {
			const manBody = scene.add.image(0, -12, manBodyKey);
			manBody.scaleX = 0.5;
			manBody.scaleY = 0.5;
			manBody.setOrigin(0, 0);
			manBody.tintTopLeft = 16119028;
			manBody.tintBottomLeft = 15376383;
			manBody.tintBottomRight = 15376383;
			visualContainer.add(manBody);
			this.manBody = manBody;
		} else {
			this.manBody = null;
		}

		// healthText
		const healthText = new Text(scene, 25, 25);
		healthText.tintBottomLeft = 16777215;
		healthText.tintBottomRight = 16777215;
		healthText.text = "1";
		healthText.setStyle({ "fontSize": "35px", "strokeThickness": 3, "shadow.offsetX": 0, "shadow.offsetY": 4, "resolution": 2 });
		// Apply brick text theme if available
		if (themeData) {
			applyBrickTextTheme(healthText, themeData);
		}
		visualContainer.add(healthText);

		this.colorBlock = colorBlock;
		this.healthText = healthText;
		this.visualContainer = visualContainer;

		/* START-USER-CTR-CODE */
		// Write your code here.
		/* END-USER-CTR-CODE */
	}

	/** @type {Phaser.GameObjects.NineSlice} */
	colorBlock;
	/** @type {Phaser.GameObjects.Image} */
	manBody;
	/** @type {Text} */
	healthText;
	/** @type {Phaser.GameObjects.Container} */
	visualContainer;
	/** @type {"#78ecffff"|"#ffb978ff"|"#78ff9eff"|"#ff7878ff"|"#d478ffff"} */
	colors = "#78ecffff";
	/** @type {string} */
	property = "#d478ffff";
	/** @type {string} */
	hitSound = "Boop_01";
	/** @type {string} */
	breakSound = "Boop_01";

	/* START-USER-CODE */
	health = 1;
	// Write your code here.

	getBrickColors() {
		const themeData = this.scene.themeData;
		if (themeData && themeData.brickStyles && themeData.brickStyles.brickColors && Array.isArray(themeData.brickStyles.brickColors)) {
			// Convert hex strings to numbers
			return themeData.brickStyles.brickColors.map(hex => ColorUtils.hexToNumber(hex));
		}
		// Return empty array if theme data is missing
		return [];
	}

	getSkinColors() {
		const themeData = this.scene.themeData;
		if (themeData && themeData.brickStyles && themeData.brickStyles.skinColors && Array.isArray(themeData.brickStyles.skinColors)) {
			// Convert hex strings to numbers
			return themeData.brickStyles.skinColors.map(hex => ColorUtils.hexToNumber(hex));
		}
		// Return empty array if theme data is missing
		return [];
	}

	initalize(value)
	{
		if (this.manBody) {
			const skinColors = this.getSkinColors();
			if (skinColors.length > 0) {
				let rand = Phaser.Math.RND.between(0, skinColors.length - 1);
				this.manBody.tintTopLeft = skinColors[rand];
				this.manBody.tintTopRight = skinColors[rand];
			}
		}
		this.setHealth(value);

	}

	setHealth(value)
	{
		this.health = value;
		this.healthText.text = this.health;

		const colors = this.getBrickColors();
		if (colors.length > 0) {
			const colorIndex = ((this.health - 1) % colors.length) + 1;
			this.colorBlock.setTint(colors[colorIndex - 1]);
		}
	}

	damage(attacker)
	{
		if(attacker != null)
		{
			let brickPos = this.getWorldTransformMatrix();
			let attackerPos = attacker.getWorldTransformMatrix();
			let angle = Phaser.Math.Angle.Between(brickPos.tx, brickPos.ty, attackerPos.tx, attackerPos.ty);
			let dir = Phaser.Math.Vector2(0,0);
			let dirPower = this.scene.physics.velocityFromRotation(angle, 5, dir);

			this.visualContainer.x = -dirPower.x;
			this.visualContainer.y = -dirPower.y;

			this.scene.add.tween
			({
				targets: this.visualContainer,
				y: 0,				
				x: 0,
				duration: 100,
				ease: 'Power2'
			});

		}

		this.setHealth(this.health -1 );
		if(this.health <= 0)
		{
			this.scene.events.emit("onScore", 1,1)	
			this.scene.sound.play(this.breakSound);		
			this.disableBrick(true)
		}
		else
		{
			this.scene.events.emit("onScore", 1, 0)
			this.scene.sound.play(this.hitSound);
		}
	}

	destroyBrick()
	{
		this.disableBrick(true);
	}

	enableBrick()
	{
		this.body.enable = true;
		this.setActive(true);
		this.visible = true;
	}

	disableBrick()
	{

		this.body.enable = false;
		this.setActive(false);
		this.visible = false;
	}
	/* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here
