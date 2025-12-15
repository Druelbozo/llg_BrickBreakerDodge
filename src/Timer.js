
// You can write more code here

/* START OF COMPILED CODE */

import ScriptNode from "../phaserjs_editor_scripts_base/ScriptNode.js";
/* START-USER-IMPORTS */
/* END-USER-IMPORTS */

export default class Timer extends ScriptNode {

	constructor(parent) {
		super(parent);

		/* START-USER-CTR-CODE */
		// Write your code here.
		/* END-USER-CTR-CODE */
	}

	/** @type {number} */
	timerLength = 10;

	/* START-USER-CODE */
	timer;
	currentTime = 0;
	// Write your code here.
	execute()
	{
		this.currentTime = this.timerLength;
		this.timer = this.scene.time.addEvent
		({
			delay: 1000,
			callback: () => this.setTime(),
			repeat: this.timerLength - 1,
		});
	}

	setTime()
	{
		this.currentTime--;
		this.gameObject.text = this.formatTime(this.currentTime);

		if(this.currentTime == 0){
			 this.executeChildren();
		}
	}

    formatTime(seconds) {
        let minutes = Math.floor(seconds / 60);
        let secs = seconds % 60;
        return `${minutes}:${secs.toString().padStart(2, '0')}`; // Ensure two-digit seconds
    }	

	/* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here
