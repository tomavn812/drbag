//The canvas and the stage that we will be interacting with
var canvas;
var stage;
var curChapter; 			//The current chapter the game is in
var chapterArr; 			//Array of all the chapters
var chapterIndex;
var g_userName = "Guest";				// global variable to hold name that user had inputted
var chapterTracker;			//A mapping of how many times a chapter has been visited
var MAIN_SCREEN_INDEX = 9;
var CERT_CHAPTER_INDEX = 8;
var WAIT_TIME = 3000;			//Time in milliseconds to wait before switching chapters upon completion of a chapter

var loaderWidth;
var progressBar;
var bgHeight = 1048;
var bgWidth = 1862;

var loaderWidth;
var progressBar;

// goal is to have a unified font scheme with fallback font in case certain browser doesn't recognize a font
var g_fontFamily = "'Comic Sans MS', cursive, sans-serif";
var g_fontSize = "bold 35px";				  
var g_fontColor = "#0000FF";
var g_backgroundColor = "#F0FFFF";

var g_introStateClickedFlag = false; // helper flag to recognize doctor door is clicked


if (!Function.prototype.bind) {
    Function.prototype.bind = function (oThis) {
        if (typeof this !== "function") {
            // closest thing possible to the ECMAScript 5 internal IsCallable function
            throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
        }

        var aArgs = Array.prototype.slice.call(arguments, 1),
            fToBind = this,
            fNOP = function () { },
            fBound = function () {
                return fToBind.apply(this instanceof fNOP && oThis
                                       ? this
                                       : oThis,
                                     aArgs.concat(Array.prototype.slice.call(arguments)));
            };

        fNOP.prototype = this.prototype;
        fBound.prototype = new fNOP();

        return fBound;
    };
}

// Array Remove - By John Resig (MIT Licensed)
Array.prototype.remove = function (from, to) {
    var rest = this.slice((to || from) + 1 || this.length);
    this.length = from < 0 ? this.length + from : from;
    return this.push.apply(this, rest);
};

/******* CHAPTER FINITE STATE MACHINE  *******/
function Chapter(manifest, sound) {
	this.curState;
	this.nextFSM = false;
	this.chapterName;
	this.queue; //This is the preloading queue for the chapter
	this.manifest = manifest;
	this.sound = sound;
};

/* Change to the given state calling the exit method of the previous state and the enter method of the current state*/
Chapter.prototype.changeState = function(state) {
	if (this.curState) {
		this.curState.exit();
	}

	if (state) {
		this.curState = state;
		this.curState.enter();
	}
	else {
		this.nextFSM = true;
	}
};

/* Update this state machines current state */
Chapter.prototype.update = function() {
	if (this.nextFSM) {
		this.nextFSM = false;
		return true;
	}
	else {
		this.curState.update();
		return false;
	}
};

/* Set the current state */
Chapter.prototype.setCurState = function(curState) {
	this.curState = curState;
};


/* Set the starting state for this fsm */
Chapter.prototype.setStartState = function(startState) {
	this.startState = startState;
};

/* Gets this chapters start state */
Chapter.prototype.getStartState = function() {
	return this.startState;
};

/* Goes to the current state */
Chapter.prototype.start = function() {
	if (this.manifest != null) {
		this.queue = new createjs.LoadQueue(true);
		createjs.Sound.registerPlugin(createjs.HTMLAudioPlugin);
		this.queue.installPlugin(createjs.Sound);
		this.changeState(new PreloadState(this, this.queue, this.sound));
	}
	else {
		this.changeState(this.startState);
	}
};

/* Exit the chapter by exiting its current state so we can navigate between chapters */
Chapter.prototype.exit = function() {
    createjs.Sound.stop();
    stage.removeAllChildren();
    if (this.curState) {
        this.curState.exit();
    }
};

/* Gets the resource manifest for this chapter */
Chapter.prototype.getManifest = function() {
	return this.manifest;
};

/* Returns the queue of preloaded resources */
Chapter.prototype.getResources = function() {
	return this.queue;
};



/* Set the next finite state machine */
Chapter.prototype.setNextFSM = function(nextFSM) {
	this.nextFSM = nextFSM;
};

/* Get the next FSM */
Chapter.prototype.getNextFSM = function() {
	return this.nextFSM;	
};

/* Give the chapter a name */
Chapter.prototype.setChapterTitle = function(chapterName) {
	this.chapterName = chapterName;
};

/* Get this chapters title */
Chapter.prototype.getChapterTitle = function() {
	return this.chapterName;
};

/******* STATE *******/
function State(fsm) {
	this.fsm = fsm;
	this.name;
};

/* Just showing that all states should have these methods */
State.prototype.enter = function() {};
State.prototype.exit = function() {};
State.prototype.update = function() {};

/* Set the name of this state */
State.prototype.setName = function(name) {
	this.name = name;
};

/* Get the name of this state */
State.prototype.getName = function() {
	return this.name;
};

/******* CONTROLLER IMPLEMENTATION *******/

/* Construct the controller to manage the game */
function Controller(myCanvas) {
	chapterIndex = 0;
	canvas = myCanvas;
		
	// set the initial background color
	canvas.style.backgroundColor = g_backgroundColor;
	
	//Create the stage we will be working with
	stage = new createjs.Stage(canvas);	
	stage.enableMouseOver() //Allow for mouseover events
	
	var chapter1Manifest = [
		{src:"images/doctor_standing.png", id:"StandingDoctor"},
		{src:"images/doctor_door_2.jpg", id:"doctor_door"},
		{src:"images/office.jpg", id:"office"},
		{src:"sound/Mining by Moonlight.mp3", id:"introSound"}
	];
	var chapter1 = new Chapter(chapter1Manifest, "sound/Mining by Moonlight.mp3");
	chapter1.setStartState(new IntroState_1(chapter1));
	chapter1.start();
	curChapter = chapter1;

	var chapter2Manifest = [
		{src:"images/main_bckgrd.jpg", id:"main_bckgrd"},
		{src:"images/otoNormal.png", id:"oto"},
		{src:"images/tempoNoname.png", id:"tempoWithName"},
		{src:"images/woodyNormal.png", id:"woody"},
		{src:"images/stethNormal.png", id:"steth"},
		{src:"images/BP_no_title.png", id:"bp"},
		{src:"images/knee_knocker.png", id:"hammer"},
		{src:"images/bag.jpg", id:"bag"},
		{src:"images/certificateSmall.png", id:"cert"},
		{src:"sound/Mining by Moonlight.mp3", id:"bgSound"}

	];
	var chapter2 = new Chapter(chapter2Manifest, "sound/Mining by Moonlight.mp3");
	chapter2.setStartState(new MainScreenState(chapter2)); //Set the inital state this chapter should be in
	
	var chapter3Manifest = [
		{src:"images/doctor__s.png", id:"bg"},
		{ src: "images/kid_sitting.png", id: "kid_sitting" },
		{src:"images/tempoNoname.png", id:"tempoNoname"},
		{src:"images/sick_tempo.png", id:"sickTempo"},
		{src:"sound/sound/Ambler.mp3", id:"bgSound"}
	];

	var chapter3 = new Chapter(chapter3Manifest, "sound/Ambler.mp3");
	chapter3.setStartState(new QuestionState(chapter3, "Hey there! I'm Tempo,the Thermometer. Can you guess what I do?", ["Hold down the tongue so the doctor can see down your throat", "Measure your temperature", "Test your reflexes"], 1, "bg", "tempoNoname", 0, 300, 200, "kid_sitting", TempoState_2));

	var chapter4Manifest = [
		{src:"images/doctor__s.png", id:"bg"},
		{src:"images/knee_knocker.png", id:"knocker"},
		{src: "images/kid_sitting.png", id: "kid_sitting" },
		{src: "images/kid_leg_kick2.png", id: "kid_kicking" }
	];
	var chapter4 = new Chapter(chapter4Manifest, "");
	chapter4.setStartState(new QuestionState(chapter4, "Hi I'm Ms. Kneeknocker! I'm a reflex hammer. Can you guess what I do?", ["Take a measure of blood pressure", "Listen to the heart", "Test your reflexes"], 2, "bg", "knocker", 0, 300, 200, "kid_sitting", KneeKnockerState2));


	var chapter5Manifest = [
		{ src: "images/doctor__s.png", id: "bg" },
		{ src: "images/woodyNormal.png", id: "woody" },
		{ src: "images/kid_sitting.png", id: "kid_sitting" },
		{ src: "images/OpenMouth.png", id: "openMouth" }
	];
	var chapter5 = new Chapter(chapter5Manifest, "");
	chapter5.setStartState(new QuestionState(chapter5, "Hi, my name's Woody. I'm a tongue depressor. Can you guess what I do?", ["Hold down the tongue so the doctor can see down your throat", "Measure your temperature", "Test your reflexes"], 0, "bg", "woody", 0, 300, 200, "kid_sitting", WoodyState2));


	var chapter6Manifest = [
		{ src: "images/doctor__s.png", id: "bg" },
		{ src: "images/stethNormal.png", id: "steth" },
		{ src: "images/lungs.png", id: "lungs" },
		{ src: "images/kid_sitting.png", id: "kid_sitting" },
		{ src: "images/heart.png", id: "heart" }
	];
	var chapter6 = new Chapter(chapter6Manifest, "");
	chapter6.setStartState(new QuestionState(chapter6, "Hi! We're Lubba & Dubba, the Stethoscope Twins. Can you guess what we do?", ["Hold down the tongue", "Listen to the heart and lungs", "Test your reflexes"], 1, "bg", "steth", 0, 300, 200, "kid_sitting", StethState2));
	
	var chapter7Manifest = [
	{ src: "images/doctor__s.png", id: "bg" },
	{ src: "images/otoNormal.png", id: "oto" },
	{ src: "images/eye.jpg", id: "eye" },
	{ src: "images/ear.jpg", id: "ear" },
	{ src: "images/otoTransf1.jpg", id: "otoTransf1" },
	{ src: "images/otoTransf2.jpg", id: "otoTransf2" },
	{ src: "images/kid_sitting.png", id: "kid_sitting" },
	{ src: "images/otoTransf3.jpg", id: "otoTransf3" },
	{src:"sound/sound/Ambler.mp3", id:"bgSound"}
	];
	var chapter7 = new Chapter(chapter7Manifest, "sound/Ambler.mp3");

	chapter7.setStartState(new QuestionState(chapter7, "Hello there! I'm Otis. I'm an Otoscope and also an Ophthalmoscope. Can you guess what I do?", ["Take a measure of your blood pressure", "Listen to the heart and lungs", "Look into your eyes and ears"], 2, "bg", "oto", 0, 300, 200, "kid_sitting", OtoState2));
	
	var chapter8Manifest = [
		{ src: "images/doctor__s.png", id: "bg" },
		{ src: "images/BP_no_title.png", id: "bp" },
		{ src: "images/kid_sitting.png", id: "kid_sitting" },
		{ src: "images/BP_around_kid.png", id: "bp_around_kid" },
		{src:"sound/Ambler.mp3", id:"bgSound"}
	];
	
	var chapter8 = new Chapter(chapter8Manifest, "sound/Ambler.mp3");
	chapter8.setStartState(new QuestionState(chapter8, "Hey there! I'm B.P. the blood pressure cuff. Can you guess what I do?", ["Take your temperature", "Take a measure of your blood pressure", "Test your reflexes"], 1, "bg", "bp", 50, 300, 200, "kid_sitting", BPState_2));
	
	var chapter9Manifest = [
		{src:"images/doctor_standing.png", id:"StandingDoctor"},
		{src:"images/doctor__s.png", id:"doctor_office_bg"},
		{src:"images/certificate2.png", id:"certificate"},
		{src:"sound/Mining by Moonlight.mp3", id:"introSound"}
	];

	var chapter9 = new Chapter(chapter9Manifest, "sound/Mining by Moonlight.mp3");
	chapter9.setStartState(new CertificateState_1(chapter9));
	
	var chapter10Manifest = [
		{src:"images/main_bckgrd.jpg", id:"main_bckgrd"},
		{src:"images/otoNormal.png", id:"oto"},
		{src:"images/tempoNoname.png", id:"tempoWithName"},
		{src:"images/woodyNormal.png", id:"woody"},
		{src:"images/stethNormal.png", id:"steth"},
		{src:"images/BP_no_title.png", id:"bp"},
		{src:"images/knee_knocker.png", id:"hammer"},
		{src:"images/bag.jpg", id:"bag"},
		{src:"images/certificateSmall.png", id:"cert"},
		{src:"images/certificateHghlt.png", id:"cert2"},
		{src:"sound/Mining by Moonlight.mp3", id:"bgSound"}

	];
	var chapter10 = new Chapter(chapter10Manifest, "sound/Mining by Moonlight.mp3");
	chapter10.setStartState(new ChooseCharacterState(chapter10)); //Set the inital state this chapter should be in

	chapterArr = [chapter1, chapter2, chapter3, chapter4, chapter5, chapter6, chapter7, chapter8, chapter9, chapter10];
	chapterTracker = {};
	chapterTracker[0] = 1;
	for (x in chapterTracker)
		console.log(x);
	//Update the current chapter and the stage
	createjs.Ticker.setFPS(30);
	createjs.Ticker.addListener(function() {
		var shouldTransition = curChapter.update();
		stage.update();
		if (shouldTransition) {
			//chapterTracker[chapterIndex] = 1;
			if (Object.size(chapterTracker) > 2)
				chapterIndex = MAIN_SCREEN_INDEX;
			else
				chapterIndex++;
			if (chapterIndex < chapterArr.length) {
				goToFSM(chapterIndex);
			}
		}
	});
	
};


/* Transitions to the next chapter after the given time interval */
function transitionChapterAtTime(time, fsm) {
	setTimeout(function (fsm) {
		fsm.changeState(null);
	}, time, fsm);
}

/*Determine the number of properties in the associative array */
Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};


/** Go to the FSM at the given index */
var goToFSM = function(index) {
	curChapter.exit();
	if (index != MAIN_SCREEN_INDEX && index != CERT_CHAPTER_INDEX) 
		chapterTracker[index] = 1;
	curChapter = chapterArr[index];
	chapterIndex = index;
	curChapter.start();
};

/* Checks if all the chapters have been visited */
function allChaptersVisited()
{
	return ((chapterArr.length - 2) <= Object.size(chapterTracker));
}

/* Go to the next chapter. Cycles through */
Controller.prototype.next = function() {
	if (chapterIndex + 1 == CERT_CHAPTER_INDEX && !allChaptersVisited()) { //Don't go to the certificate chapter if the game is not completed
		goToFSM((chapterIndex + 2) % chapterArr.length);
	}
	else {
		goToFSM((chapterIndex + 1) % chapterArr.length);
	}	
};

/* Go to the previous chapter using arrow navigation */
Controller.prototype.previous = function() {
	if (chapterIndex - 1 == CERT_CHAPTER_INDEX && !allChaptersVisited()) //User hasn't completed the game so don't show the certificate chapter
		goToFSM(mod(chapterIndex - 2, chapterArr.length));
	else
		goToFSM(mod(chapterIndex - 1, chapterArr.length));

};

/* A mod function since JS doesnt work right for negative mod*/
function mod(n, m) {
	var remain = n % m;
	return Math.floor(remain >= 0 ? remain : remain + m);	
}

/* Animates the text just using easel. textObj is the createjs Text object, textToDisplay is the string you want to animate, and delay is the millisecond delay between tokens*/
function animateText(textObj, textToDisplay, delay) {
    var textBg = new createjs.Shape();
    textBg.graphics.beginFill("white").drawRoundRect(5, 5, canvas.width - 15, textObj.getMeasuredHeight() * 2 + 5, 10);
    stage.addChildAt(textBg, stage.getChildIndex(textObj) - 1);

    if (stage.contains(textObj)) {
        textObj.text = "";
        textObj.lineWidth = canvas.width - 20;
        textObj.x = 10;
        var textTokenArray = textToDisplay.split(" "); //Tokenize the string we want to display
        var startHeight = textObj.getMeasuredHeight();
        for (var i = 0; i < textTokenArray.length; i++) {
            setTimeout(function (token) {
                textObj.text += " " + token;
                if (textObj.getMeasuredHeight() > startHeight * 2 + 5) //Need to restart the line of text
                    textObj.text = token;
            }, i * delay, textTokenArray[i]);
        }
        return textTokenArray.length * delay;
    }
}


/******* SET UP FOR INHERITANCE *******/
function surrogateConstructor()  {}

/* Call this when you want to use inheritance @par the parent class @subclass the subclass*/
function extend (par, subclass) {
	surrogateConstructor.prototype = par.prototype;
	subclass.prototype = new surrogateConstructor();
	subclass.prototype.constructor = subclass;
}

function PreloadState(fsm, queue, audio) {
	State.call(this, fsm);
	this.queue = queue;
	this.background;
	this.progressContainer;
	this.bgBar;
	this.loadingText;
	this.audio = audio;
}

extend(State, PreloadState);

PreloadState.prototype = {
	enter: function() {
		var barHeight = 30;
		loaderWidth = canvas.width/2;
		var padding = 3;
		var barColor = createjs.Graphics.getRGB(0, 0, 255);
		this.background = new createjs.Shape();
		this.background.graphics.beginFill("#000000").drawRect(0, 0, canvas.width, canvas.height);
		stage.addChild(this.background); //Set the background to black for load screen
		this.loadingText = new createjs.Text("Loading...", "20px Arial", barColor);
		this.loadingText.textAlign = "center";
		this.loadingText.x = canvas.width/2;
		this.loadingText.y = (canvas.height/2) - (barHeight + 25);
		this.progressContainer = new createjs.Container();
		progressBar = new createjs.Shape();
		progressBar.graphics.beginFill(barColor).drawRect(0, 0, 1, barHeight).endFill();
		this.bgBar = new createjs.Shape();
		this.bgBar.graphics.setStrokeStyle(1).beginStroke(barColor).drawRect(-padding/2, -padding/2, loaderWidth+padding, barHeight+padding);
		this.progressContainer.x = (canvas.width - loaderWidth)/2;
		this.progressContainer.y = (canvas.height - barHeight)/2;
		this.progressContainer.addChild(progressBar, this.bgBar);
		stage.addChild(this.loadingText);
		stage.addChild(this.progressContainer);
		this.queue.addEventListener("progress", this.handleProgress);
		this.queue.addEventListener("complete", this.handleComplete.bind(this));
		this.queue.loadManifest(this.fsm.getManifest());

	},
	update: function() {

	},
	exit: function() {
		stage.removeAllChildren();
	},
	handleProgress: function(event) { //Update the progress bar
		progressBar.scaleX = (event.loaded)*(loaderWidth);		
	},
	handleComplete: function(event) { //Transition to the chapters state once all the resources are loaded
		if (this.audio && this.audio != "")
			var myInstance = createjs.Sound.play(this.audio, createjs.Sound.INTERRUPT_ANY, 0, 0, -1, 0.5, 0);
		curChapter.changeState(curChapter.getStartState());
	}
}



function setBackGroundColor(color) {
	canvas.style.backgroundColor = color;
}

/******* Intro States *******/

/* State has doctor transition onto screen*/
function IntroState_1(fsm, nextState) {
	State.call(this, fsm, nextState);
	this.doctor_img;	// image of doctor
	this.officeBg_img;
}

extend(State, IntroState_1); //Have this state inherit from the State class. This MUST be called for every state

IntroState_1.prototype = {
	enter: function() {
		this.doctor_img = new createjs.Bitmap(this.fsm.getResources().getResult("StandingDoctor"));
		this.officeBg_img = new createjs.Bitmap(this.fsm.getResources().getResult("office"));
		
		// image dimension
		var width = 223;
		var height = 501;
		
		// set up registration position for image
		this.doctor_img.regX = width / 2;
		this.doctor_img.regY = height / 2;
		
		// give doctor a position on canvas
		this.doctor_img.x = canvas.width / 2;
		this.doctor_img.y = canvas.height;
		
		// scale office background
		this.officeBg_img.scaleX = canvas.width / this.officeBg_img.image.width;
        this.officeBg_img.scaleY = canvas.height / this.officeBg_img.image.height;
		
		stage.addChild(this.officeBg_img, this.doctor_img);	// add doctor to canvas
	},
	update: function() {
		var maxHeightPosition = canvas.height / 2 + 30;
		
		this.doctor_img.y -= 10;						// have doctor appear from bottom to middle of screen
		if (this.doctor_img.y < maxHeightPosition){		// once doctor is at middle of screen, move to next state to do something else
			this.fsm.changeState(new IntroState_2(this.fsm));
		}
	},
	exit: function() {
		// will keep the children from this stage for next state
	}
}

/* State has doctor speaking */
function IntroState_2(fsm, nextState) {
	State.call(this, fsm, nextState);
	this.text;
	this.timeSpeakDelay = 200;
	this.timer = 0;
}

extend(State, IntroState_2); //Again, set up inheritance for this state

IntroState_2.prototype = {
	enter: function() {
					
		// Doctor start talking		
		var firstMessage = "Hey there! What's your name?";
		this.text = new createjs.Text("", g_fontSize + g_fontFamily, g_fontColor);
		stage.addChild(this.text);
        animateText(this.text, firstMessage, this.timeSpeakDelay);	
		this.text.x = canvas.width * 0.3;		
		// this.text.y = canvas.height * 0.05;
	},
	update: function() {
		// pause the screen before moving to next scene
		this.timer++;
		if (this.timer > 60){
			this.fsm.changeState(new IntroState_3(this.fsm));
		}
	},
	exit: function() {
		// keep the doctor image but remove the doctor's speech
		stage.removeChild(this.text);
	}
}

/* State has user type in their name */
function IntroState_3(fsm, nextState) {
	State.call(this, fsm, nextState);
	this.text;
	this.textInput_DOM;
	this.button_DOM;
	this.text_input;
	this.main_div;
	this.button_input;
	this.trackAction;
	this.timeSpeakDelay = 200;
}

extend(State, IntroState_3); //Again, set up inheritance for this state

IntroState_3.prototype = {
	enter: function() {
		
		// creating text instruction for user to type their name in	
		var message = "Please Type in Your Name Below";
		this.text = new createjs.Text("", g_fontSize + g_fontFamily, g_fontColor);
		
		stage.addChild(this.text);
		animateText(this.text, message, this.timeSpeakDelay);
		this.text.x = canvas.width * 0.3;
		// this.text.y = canvas.height * .05;
		
		// gettting DOM objects of HTML elements to add 'input' DOM objects to
		var html = '<form class="form-inline" id="nameForm"><input class="input-large" style="font:bold 20px sans-serif;" id="name" type="text" maxlength="18" autofocus><button type="submit" class="btn" >That&#39s My Name!</button></form>';
		var fsmRef = this.fsm;
		$(html).insertBefore($("#game_canvas"));
		$("#nameForm").submit(function(e) {
			g_userName = $("#name").val();
			e.preventDefault();
			fsmRef.changeState(new IntroState_Final(fsmRef));
		});

		var domForm = new createjs.DOMElement("nameForm");
		
		domForm.x = this.text.x + (this.text.getMeasuredWidth());
		domForm.y = this.text.y + (this.text.getMeasuredHeight() +10);	
		
		stage.addChild(domForm);	// actually put objects onto canvas
		
		
	},
	update: function() {

	},
	exit: function() {
		// remove all canvas and DOM elements
		stage.removeAllChildren();
		$("#nameForm").remove();
	}
}

/* State has doctor click on door and enter office*/
function IntroState_Final(fsm, nextState) {
	State.call(this, fsm, nextState);
	this.timeSpeakDelay = 200;
	
	this.docText_1;
	this.docText_2;
	this.docText_3;
	this.textArr;
	this.textIndex = 0;
	this.textTicker = 0;
	this.messageArr;
	this.doctorDoor_img;
	
	this.doorTimer = 0;
}

extend(State, IntroState_Final); //Have this state inherit from the State class. This MUST be called for every state

IntroState_Final.prototype = {
	enter: function() {
		// console.log("debug stuff here");

		// if user got to this state and g_userName is still undefined, give default name
		// if user had just clicked or pressed enter without actually typing in a name previously, give default name
		if (typeof g_userName === 'undefined' || g_userName == ""){
			g_userName = "Guest";
		}
		
		// adding doctor office door to canvas
		this.doctorDoor_img = new createjs.Bitmap(this.fsm.getResources().getResult("doctor_door"));
		// image is 512 pixel x 480
		var width = 261;
		var height = 408;
		
		// set up registration position for image
		this.doctorDoor_img.regX = width / 2;
		this.doctorDoor_img.regY = height / 2;
		
		// give door a position on canvas
		this.doctorDoor_img.x = canvas.width / 2;
		this.doctorDoor_img.y = canvas.height / 2;
		this.doctorDoor_img.cursor = "pointer"; //Show a pointer as the cursor for this image object
		
		stage.addChild(this.doctorDoor_img);

		// if doctor door is clicked, enlarge door and set clicked flag
		this.doctorDoor_img.onClick = function(e) {
			console.log("clicked"); 
			createjs.Tween.get(e.target).to({scaleX: 5, scaleY: 5}, 1000);
			g_introStateClickedFlag = true;			
		}
		
		var message_1 = "Hello " + g_userName + "! Welcome to the Game of...";
		var message_2 = "What's in a Doctor's Bag?";
		var message_3 = "So " + g_userName + ", are you afraid of the doctor? Well, don't be! Doctors are here to help you feel better when you're sick. We have some friends we use to help you feel better; come into my office and I can introduce you to them. Please click on the door to enter my office.";
		
		messageArr = [message_1, message_2, message_3]; 	// array holding doctor's message
		
		this.docText_1 = new createjs.Text("", g_fontSize + g_fontFamily , g_fontColor);
		
		this.docText_2 = new createjs.Text("", "bold 70px"	+ g_fontFamily, "#FF0000");
		// this.docText_2.x = canvas.width * 0.4;
		// this.docText_2.y = canvas.height * .05;
		
		this.docText_3 = new createjs.Text("", g_fontSize + g_fontFamily , g_fontColor);
		this.textArr = [this.docText_1, this.docText_2, this.docText_3];
		
		stage.addChild(this.textArr[this.textIndex]);
		animateText(this.textArr[this.textIndex], messageArr[this.textIndex], this.timeSpeakDelay);
	},
	update: function() {
		// pause the screen before moving to next scene
		this.textTicker++; 						// Timer for how long current message is displayed
		
		/* Start displaying messages */
		if (this.textTicker > 70 && this.textIndex < 2){

				stage.removeChild(this.textArr[this.textIndex]); //Remove message
					
				this.textIndex++; 				// Increment to next message
				this.textTicker = 0; 			// Reset ticker
					
				stage.addChild(this.textArr[this.textIndex]);
				animateText(this.textArr[this.textIndex], messageArr[this.textIndex], this.timeSpeakDelay);

		}
		
		/* if user clicks on the door */
		if(g_introStateClickedFlag == true){	
			this.doorTimer++;
			if(this.doorTimer > 50)				// after a certain amount of time
				this.fsm.changeState(null);		// transition to next chapter
		}		
	},
	exit: function() {
		
	}
}

/* Call this when you want to use inheritance @par the parent class @subclass the subclass*/
function extend (par, subclass) {
	surrogateConstructor.prototype = par.prototype;
	subclass.prototype = new surrogateConstructor();
	subclass.prototype.constructor = subclass;
}

function MainScreenState(fsm, nextState) {
	State.call(this, fsm, nextState);
	this.bckgrdImg;
	this.bagImg;
	this.otoImg;
	this.tempoImg;
	this.woodyImg;
	this.stethImg;
	this.bpImg;
	this.hammerImg;
	this.certifImg;
	this.docText_1;
	this.docText_2;
	this.docText_3;
	this.docText_4;
	this.docText_5;
	this.docText_6;
	this.docText_7;
	this.docText_8
	this.textTicker;
	this.textArr;
	this.textIndex;
	this.nextImgIndx;
	this.initYpos;
}

extend(State, MainScreenState); //Have this state inherit from the State class. This MUST be called for every state

MainScreenState.prototype = {
	enter: function() {
		setBackGroundColor("#FFFFFF");
		/*//Character positions
		var otoImgX = 580;
	    var otoImgY = 30;	
			
		var tempoImgX = 820;
		var tempoImgY = 80;
		
		var woodyImgX = 1100;
		var woodyImgY = 50;
		
		var stethImgX = 350;
		var stethImgY = 300;
		
		var bpImgX = 700;
		var bpImgY = 350;
		
		var hammerImgX = 1000;
		var hammerImgY = 300;*/

		this.nextImgIndx = 0;
		this.initYpos = 610;
		
		//Background
		this.bckgrdImg = new createjs.Bitmap(this.fsm.getResources().getResult("main_bckgrd"));
		stage.addChild(this.bckgrdImg);
		
		this.certifImg = new createjs.Bitmap(this.fsm.getResources().getResult("cert"));	
		this.certifImg.cursor = "pointer"; //Show a pointer as the cursor for this image object
		this.certifImg.x = 300;
		this.certifImg.y = 60;
	    this.certifImg.alpha = 0.2; //make the certificate light to indicate that it cannot be clicked
	    stage.addChild(this.certifImg);

	    //Otis
		this.otoImg = new createjs.Bitmap(this.fsm.getResources().getResult("oto"));
		this.otoImg.cursor = "pointer";
		this.otoImg.y = this.initYpos;
		this.otoImg.scaleX = 0.47;
	    this.otoImg.scaleY = 0.42;
	    stage.addChild(this.otoImg);
		
		//Tempo
		this.tempoImg = new createjs.Bitmap(this.fsm.getResources().getResult("tempoWithName"));
		this.tempoImg.cursor = "pointer";
		this.tempoImg.y = this.initYpos;
		this.tempoImg.scaleX = 0.18;
	    this.tempoImg.scaleY = 0.47;
	    stage.addChild(this.tempoImg);
		
		//Woody
		this.woodyImg = new createjs.Bitmap(this.fsm.getResources().getResult("woody"));
		/*this.woodyImg.x = woodyImgX;*/
		this.woodyImg.cursor = "pointer";
		this.woodyImg.y = this.initYpos;
		this.woodyImg.scaleX = 0.01;
	    this.woodyImg.scaleY = 0.44;
	    stage.addChild(this.woodyImg);
	
		//Lubba & Dubba
		this.stethImg = new createjs.Bitmap(this.fsm.getResources().getResult("steth"));
		/*this.stethImg.x = stethImgX;*/
		this.stethImg.cursor = "pointer";
		this.stethImg.y = this.initYpos;
		this.stethImg.scaleX = 0.65;
		this.stethImg.scaleY = 0.67;
	    stage.addChild(this.stethImg);
		
		//B.P.
		this.bpImg = new createjs.Bitmap(this.fsm.getResources().getResult("bp"));
		/*this.bpImg.x = bpImgX;*/
		this.bpImg.cursor = "pointer";
		this.bpImg.y = this.initYpos;
		this.bpImg.scaleX = 0.25;
		this.bpImg.scaleY = 0.74;
	    stage.addChild(this.bpImg);
	
		//Ms. Knee Knocker
		this.hammerImg = new createjs.Bitmap(this.fsm.getResources().getResult("hammer"));
		/*this.hammerImg.x = hammerImgX;*/
		this.hammerImg.cursor = "pointer";
		this.hammerImg.y = this.initYpos;
		this.hammerImg.scaleX = 0.01;
		this.hammerImg.scaleY = 0.67;
	    stage.addChild(this.hammerImg);
		
	    //Doctor's Bag
		this.bagImg = new createjs.Bitmap(this.fsm.getResources().getResult("bag"));
		this.bagImg.y = 400;
		stage.addChild(this.bagImg);
		
		//Doctor text
		this.docText_1 = new createjs.Text("We have \"Tempo the Thermometer,\"", "italic 18px 'Comic Sans MS', cursive, sans-serif", "#0000FF");
		this.docText_2 = new createjs.Text("\"Ms. Knee Knocker the Reflex Hammer,\"", "italic 18px 'Comic Sans MS', cursive, sans-serif", "#0000FF");
		this.docText_3 = new createjs.Text("\"Lubba & Dubba, the Stethoscope Twins,\"", "italic 18px 'Comic Sans MS', cursive, sans-serif", "#0000FF");
		this.docText_4 = new createjs.Text("\"Woody the Tongue Depressor,\"", "italic 18px 'Comic Sans MS', cursive, sans-serif", "#0000FF");
		this.docText_5 = new createjs.Text("\"B.P. the Blood Pressure Cuff,\"", "italic 18px 'Comic Sans MS', cursive, sans-serif", "#0000FF");
		this.docText_6 = new createjs.Text("and \"Otis the Otoscope.\"", "italic 18px 'Comic Sans MS', cursive, sans-serif", "#0000FF");
		this.docText_7 = new createjs.Text("It seems like these guys want to play with you!", "italic 18px 'Comic Sans MS', cursive, sans-serif", "#0000FF");
		this.docText_8 = new createjs.Text("Choose any character you like!", "bold italic 18px 'Comic Sans MS', cursive, sans-serif", "#0000FF");
		
		this.textTicker = 0;
		this.textArr = [this.docText_1, this.docText_2, this.docText_3, this.docText_4, this.docText_5, this.docText_6, this.docText_7, this.docText_8];
		this.textIndex = 0;
		
		//Initial position of doctor's words
		this.textArr[this.textIndex].x = 100;
		this.textArr[this.textIndex].y = 230;
		
		stage.addChild(this.textArr[this.textIndex]);

		this.otoImg.onClick = function(e) {
			goToFSM(6); //Transition to Otis game
		}
	    this.tempoImg.onClick = function(e) {
			goToFSM(2); //Transition to Tempo game
		}
 		this.woodyImg.onClick = function(e) {
			goToFSM(4); //Transition to Woody game
		}		
		this.stethImg.onClick = function(e) {
			goToFSM(5); //Transition to Lubba & Dubba game
		}	
		this.bpImg.onClick = function(e) {
			goToFSM(7); //Transition to BP game
		}	
		this.hammerImg.onClick = function(e) {
			goToFSM(3); //Transition to Knocker game
		}
		
		this.certifImg.onClick = function(e) {
		 	var message = new createjs.Text("Play with the all the characters to earn this certificate!", "12px 'Comic Sans MS', cursive, sans-serif", "#FF0000");
			message.x = 220;
			message.y = 20;
			stage.addChild(message);
				
			createjs.Tween.get(message).wait(2000).to({x: -500}, 1000, createjs.Ease.elasticIn);
		}

	},
	update: function() {
		if (this.textArr[this.textIndex].x < 215){ //Current group of words moving from doctor's mouth
			this.textArr[this.textIndex].x += 5; 
		}
		
		this.textTicker++; //Timer for how long current group of words is displayed
		
		if (this.textTicker > 70 && this.textIndex < 7){
		
			stage.removeChild(this.textArr[this.textIndex]); //Remove words
					
			this.textIndex++; //Increment to next group of words
			this.textTicker = 0; //Reset ticker
					
			//Reset text position for new group of words
			this.textArr[this.textIndex].x = 100; 
			this.textArr[this.textIndex].y = 230;
					
			stage.addChild(this.textArr[this.textIndex]);

			this.nextImgIndx++; // Next character to move to its spot
		}
		
		//Tempo moving to his spot
		if (this.nextImgIndx == 0){
			if (this.tempoImg.x < 820){
				 this.tempoImg.x += 20;
				 this.tempoImg.scaleX += 0.02;
				 
				 this.tempoImg.y -= 15;
				 this.tempoImg.scaleY += 0.01;
			}
			//console.log("tempo y is:" + this.tempoImg.y);
		}
		
	    //Ms. Knee Knocker moving to her spot
		if (this.nextImgIndx == 1){
			if (this.hammerImg.x < 1150){
				 this.hammerImg.x += 20;
				 this.hammerImg.scaleX += 0.019;
				 
				 this.hammerImg.y -= 5.2;
				 this.hammerImg.scaleY += 0.007;
			}
			//console.log("knee y is:" + this.hammerImg.y);
		}
		
		//Lubba & Dubba moving to their spot
		if (this.nextImgIndx == 2){
			if (this.stethImg.x < 415){
				 this.stethImg.x += 17.5;
				 this.stethImg.scaleX += 0.019;
				 
				 this.stethImg.y -= 11.5;
				 this.stethImg.scaleY += 0.016;
			}
			//console.log("steth y is:" + this.stethImg.y);
		}
		
		//Woody moving to his spot
		if (this.nextImgIndx == 3){
			if(this.woodyImg.x < 1100){
				 this.woodyImg.x += 20;
				 this.woodyImg.scaleX += 0.018;
				 
				 this.woodyImg.y -= 10.2;
				 this.woodyImg.scaleY += 0.011;
			}
			//console.log("woody y is:" + this.woodyImg.y);
		}
		
		//B.P. moving to his spot
		if (this.nextImgIndx == 4){
			if(this.bpImg.x < 750){
				 this.bpImg.x += 20;
				 this.bpImg.scaleX += 0.023;
				 
				 this.bpImg.y -= 7.5;
				 this.bpImg.scaleY += 0.007;
			}
			//console.log("bp y is:" + this.bpImg.y);
		}
		
		//Otis moving to his spot
		if (this.nextImgIndx == 5){
			if (this.otoImg.x < 580){
				 this.otoImg.x += 20;
				 this.otoImg.scaleX += 0.02;
				 
				 this.otoImg.y -= 20;
			   	 this.otoImg.scaleY += 0.02;
			}
			//console.log("oto y is:" + this.otoImg.y);
		}

	},
	exit: function() {
		stage.removeAllChildren();
	}
}

/******* TEMPO STATES *******/

/* Example state that has a square go across the screen and transitions when it reaches the end of the screen */
function TempoState_2(fsm, character, kid) {
	State.call(this, fsm);
    this.character = character;
    this.explainText;
    this.timeSpeakDelay = 200;
    this.kid = kid;
}

extend(State, TempoState_2); //Have this state inherit from the State class. This MUST be called for every state

TempoState_2.prototype = {
	enter: function() {
	
		 var firstMessage = "Let me show you what I do. Let's go to the kid and try to help him feel better! Can you click on me and drag to the mouth of the boy?";
		this.explainText = new createjs.Text("", g_fontSize + g_fontFamily, g_fontColor);
		stage.addChild(this.explainText);
		animateText(this.explainText, firstMessage, this.timeSpeakDelay);
		
		this.character.cursor = "pointer";	
		
						
		/* Allow character to be draggable */
		this.character.onPress = function(e) {
			var offset = {x:e.target.x-e.stageX, y:e.target.y-e.stageY};
			e.onMouseMove = function(ev) {
				e.target.x = ev.stageX + offset.x;
				e.target.y = ev.stageY + offset.y;
			}
		}
    },
    update: function () {
		// if user drag the character onto arm of boy, transistion to next state
		if(this.character.x > (canvas.width / 2 - 90) && (this.character.y > canvas.height/2 -150)){
					stage.removeChild(this.kid);
					this.fsm.changeState(new TempoState_3(this.fsm)); 				
		}
    },
    exit: function () {
        stage.removeChild(this.character, this.explainText, this.kidSitting_img);
    }
}

/* This state explains what Tempo does in detail after user has successfully dragged character to the mouth of the boy*/

function TempoState_3(fsm) {
    State.call(this, fsm);
    this.explainText;
    this.timeSpeakDelay = 200;
    this.sickTempo_img;
}

extend(State, TempoState_3);

TempoState_3.prototype = {
	enter: function() {
		
		this.sickTempo_img =  new createjs.Bitmap(this.fsm.getResources().getResult("sickTempo"));
		
		this.sickTempo_img.y =  canvas.height - ((canvas.height / bgHeight) * 400) - 225;
		this.sickTempo_img.x = getRelativeX(this.sickTempo_img, 800) - 55;

		
		stage.addChild(this.sickTempo_img);
		
		var secondMessage = "Good job! I go underneath the tongue and remain there for a minute or two to measure your body's internal temperature. Your temperature is 98.6 degrees. This means you're healthy! If your temperature goes above that, then it means you have a fever, and the doctor will advise you on what medicines to take or how much rest you need in order to get better. Let's go back to my friends and see what the rest of them do.";
		this.explainText = new createjs.Text("", g_fontSize + g_fontFamily, g_fontColor);
		stage.addChild(this.explainText);
		var timeTakes = animateText(this.explainText, secondMessage, this.timeSpeakDelay);
		transitionChapterAtTime(timeTakes + WAIT_TIME, this.fsm);
				
	},
    update: function () {

    },
	exit: function () {
        stage.removeAllChildren();
    }
}


/* @fsm -- The fsm for this state. 
   @question -- The question to ask the player
   @answers -- An array of strings that are the possible answers the player can select
   @correctIndex -- The index in @answers that contains the correct option
   @bdId -- The preload Id for the background image. Assumes that we are using the doctors room bg
   @characterId -- The preload Id of the character to add to the stage
   @charX -- The x cooridinate to place the character assuming the background is of its default size
   @charY -- The y cooridnate of the character
   @timeSpeakDelay -- The delay in ms to display each word of the question
   @nextState -- The state to transtion to after this one completes
*/
function QuestionState(fsm, question, answers, correctIndex, bgId, characterId, charX, charY, timeSpeakDelay, kidId, nextState) {
    State.call(this, fsm);
    this.question = question;
    this.answers = answers;
    this.correctIndex = correctIndex;
    this.bgId = bgId;
    this.characterId = characterId;
    this.charX = charX;
    this.charY = charY;
    this.kidId = kidId;
    this.kid;
    this.timeSpeakDelay = timeSpeakDelay;
    this.characterObj;
    this.textObj;
    this.container;
    this.optionsArr = new Array();
    this.nextState = nextState;
    this.cancelTimer;
    this.actualCorrectIndex;
    this.endTimer;
}

extend(State, QuestionState);

QuestionState.prototype = {
    enter: function () {
        //Instantiate the character and set its desired location
        this.characterObj = new createjs.Bitmap(this.fsm.getResources().getResult(this.characterId));
        this.characterObj.y = getRelativeY(this.characterObj, this.charY);
        this.characterObj.x = getRelativeX(this.characterObj, this.charX);

	//Place the sitting kid on the doctors table
	this.kid = new createjs.Bitmap(this.fsm.getResources().getResult(this.kidId));	
	var y =  canvas.height - ((canvas.height / bgHeight) * 400) - 225;
	this.kid.y =  y;
	this.kid.x = getRelativeX(this.characterObj, 800);

        //Set up the questions
        this.container = new createjs.Container() //Holds the response options
        var asciiVal = 65;
        var padding = 20;
        var combinedHeight = 0;
        var widest = 0;
        var newArr = this.answers.concat();
        var i = 0;
        while (newArr.length > 0) { //Order the answers randomly
            var randNum = Math.floor((Math.random() * newArr.length));
            var option = new createjs.Text(String.fromCharCode(asciiVal) + ".) " + newArr[randNum], g_fontSize + g_fontFamily, "red");
            option.cursor = "pointer";
            this.container.addChild(option);
            if (i != 0) {
                option.y = this.optionsArr[i - 1].y + this.optionsArr[i - 1].getMeasuredHeight() + padding;
            }
            if (option.getMeasuredWidth() > widest)
                widest = option.getMeasuredWidth();
            if (newArr[randNum] == this.answers[this.correctIndex])
                this.actualCorrectIndex = 65 + i;
            option.addEventListener("click", this.answerFeedback.bind(this));
            this.optionsArr[i] = option;
            combinedHeight += option.getMeasuredHeight();
            asciiVal++;
            newArr.remove(randNum);
            i++;
        }
        this.container.x = (canvas.width - widest) / 2;
        this.container.y = (canvas.height - (combinedHeight + this.answers.length * padding)) / 2;

	var border = new createjs.Shape();
	border.graphics.beginFill("black").drawRoundRect(-5, -5, widest + 20, combinedHeight + this.optionsArr.length * padding + 20, 10);
	
	var questionBackground = new createjs.Shape();
	questionBackground.graphics.beginFill("white").drawRoundRect(0, 0, widest + 10, combinedHeight + this.optionsArr.length * padding + 10, 10);
	this.container.addChildAt(questionBackground, 0);
	this.container.addChildAt(border, 0);


        //Set up the background
        var background = new createjs.Bitmap(this.fsm.getResources().getResult(this.bgId));
        background.scaleX = canvas.width / bgWidth;
        background.scaleY = canvas.height / bgHeight;

        //Add background and the character to the canvas
        stage.addChild(background);
	stage.addChild(this.kid);
        stage.addChild(this.characterObj);

        //Set up the queston text object
        this.textObj = new createjs.Text("", g_fontSize + g_fontFamily, g_fontColor);
        stage.addChild(this.textObj);
	
        var timeTakes = animateText(this.textObj, this.question, this.timeSpeakDelay);

        //Lets add the options once the question has been asked
        this.cancelTimer = setTimeout(function (contain) {
            stage.addChild(contain);
        }, timeTakes, this.container);
    },
    update: function () {

    },
    exit: function () {
        if (this.nextState != null) {
            stage.removeChild(this.container);
            stage.removeChild(this.textObj);
        }
        else {
            stage.removeAllChildren();
        }
        clearTimeout(this.cancelTimer);
        clearTimeout(this.endTimer);
    },
    answerFeedback: function (e) {
        var message;
        for (var i = 0; i < this.optionsArr.length; i++) { //Remove the event listener so the options cant be clicked again
            this.optionsArr[i].removeAllEventListeners("click");
        }
        if (e.target.text.substring(4) == this.answers[this.correctIndex]) {
            message = "That's right! " + "I " + this.answers[this.correctIndex].toLowerCase();
        }
        else {
            message = "Good try, but not quite. The correct answer is " + String.fromCharCode(this.actualCorrectIndex) + " - I " + this.answers[this.correctIndex].toLowerCase();
        }
        var timeNeeded = animateText(this.textObj, message, this.timeSpeakDelay);
        var nextState = this.nextState;
        var curFsm = this.fsm;
        var charObj = this.characterObj;
	var kidObj = this.kid;
        this.endTimer = setTimeout(function () { //Transition to the next state once feedback is shown
            var result = nextState;
            if (result != null)
                curFsm.changeState(new result(curFsm, charObj, kidObj));
            else
                curFsm.changeState(null);
        }, timeNeeded + 1000);

    }
}

/* Gets the relative y value for the passed in character image and the normal y value. HEIGHT IS FROM THE BOTTOM */
function getRelativeY(character, y) {
    return canvas.height - ((canvas.height / bgHeight) * y) - character.image.height;
}

/* Gets the relative x value. The x value passed in is the normal pixels from the left. X IS FROM THE LEFT */
function getRelativeX(character, x) {
    return ((canvas.width / bgWidth) * x);
}

/* The 2nd state for the stethoscope chapter*/
function StethState2(fsm, character) {
    State.call(this, fsm);
    this.character = character;
    this.explainText;
    this.timeSpeakDelay = 200;
}

StethState2.prototype = {
    enter: function () {
        var newX = getRelativeX(this.character, 845);
        var newY = getRelativeY(this.character, 20);
        var message = "Come and see what we do.";
        this.explainText = new createjs.Text("", g_fontSize + g_fontFamily, g_fontColor);
        stage.addChild(this.explainText);
        var messageTime = animateText(this.explainText, message, this.timeSpeakDelay);
        createjs.Tween.get(this.character).wait(messageTime).to({ x: newX, y: newY }, 2000, createjs.Ease.circOut).call(this.secondMessage.bind(this));
    },
    update: function () {

    },
    exit: function () {
        createjs.Tween.removeTweens(this.character);
        stage.removeAllChildren();
    },
    secondMessage: function () {
        var newMessage = "Using the ear that's attached to us we listen to your heart and lungs. Let us show you what we do.";
        var messageTime = animateText(this.explainText, newMessage, this.timeSpeakDelay);
        var numWordsBeforeEarMotion = 7;
        var firstDelay = numWordsBeforeEarMotion * this.timeSpeakDelay;
        var curFsm = this.fsm;
        createjs.Tween.get(this.character).wait(firstDelay).to({ skewY: 10 }, 100).to({ skewY: 0 }, 100).to({ skewY: 10 }, 100).to({ skewY: 0 }, 100).wait(messageTime - firstDelay).to({ y: this.character.y - 130 }, 500, createjs.Ease.linear).call(function () { curFsm.changeState(new StethState3(curFsm)); });
    }
}

/* The 3rd state for the stethoscope. Shows the heart and lungs */
function StethState3(fsm) {
    State.call(this, fsm);
    this.heart;
    this.nextBeat = 0;
    this.waitTime = 1400;
    this.scaleFactor = 0.35;
    this.timeSpeakDelay = 200;

}

extend(State, StethState3);

StethState3.prototype = {
    enter: function () {
	console.log("IN STETH STATE 3");
        var container = new createjs.Container();
        var lungs = new createjs.Bitmap(this.fsm.getResources().getResult("lungs"));
        var text = new createjs.Text("", g_fontSize + g_fontFamily, "#FF0000");
        this.heart = new createjs.Bitmap(this.fsm.getResources().getResult("heart"));
        this.heart.scaleX = this.scaleFactor;
        this.heart.scaleY = this.scaleFactor;
        this.heart.x = (lungs.image.width - this.heart.image.width * this.scaleFactor) / 2;
        this.heart.y = (lungs.image.height - this.heart.image.height * this.scaleFactor) / 2;

        container.x = (canvas.width - lungs.image.width) / 2;
        container.y = (canvas.height - lungs.image.height) / 2;
        container.addChild(lungs, this.heart);
       	setBackGroundColor("#FFFFFF");
        var message = "We listen to make sure that the heart is working like it should be; if it is, then the heart gives off a \"lub-dub\" sound. When the doctor puts us on your, he does this to see what your lungs sound like. If everything sounds normal, then you have nothing to be worried about! If the doctor hears something out of the ordinary, then he or she will tell you what to do so you can feel better. Now, we should probably get back to the doctor. There's still more friends of ours that you should meet.";
        //stage.addChild(text);
        //var messageTime = animateText(text, message, this.timeSpeakDelay);
        stage.addChild(container);
		stage.addChild(text);
		var messageTime = animateText(text, message, this.timeSpeakDelay);
	transitionChapterAtTime(messageTime + WAIT_TIME, this.fsm);
    },
    update: function () {
        var timeElapsed = createjs.Ticker.getTime();
        if (timeElapsed > this.nextBeat) { //Lets make the heart look like its beating
            createjs.Tween.get(this.heart).to({ rotation: -10, scaleX: this.scaleFactor - 0.05, scaleY: this.scaleFactor - 0.05 }, 200).wait(200).to({ rotation: 10, scaleX: this.scaleFactor - 0.05, scaleY: this.scaleFactor - 0.05 }, 200).to({ rotation: 0, scaleX: this.scaleFactor, scaleY: this.scaleFactor }, 200);
            this.nextBeat = timeElapsed + this.waitTime;
        }
    },
    exit: function () {
        stage.removeAllChildren();
        createjs.Tween.removeTweens(this.heart);
    }
}


/* The second state for woody */
function WoodyState2(fsm, character) {
    State.call(this, fsm);
    this.character = character;
    this.explainText;
    this.timeSpeakDelay = 200;
}

extend(State, WoodyState2);

WoodyState2.prototype = {
    enter: function () {
        var newX = getRelativeX(this.character, 875);
        var newY = getRelativeY(this.character, 20);
        var message = "Here, let me show you what I do. The doctor told me you're feeling sick; I'm going to help you get better.";
        this.explainText = new createjs.Text("", g_fontSize + g_fontFamily, g_fontColor);
        stage.addChild(this.explainText);
        console.log("here");
        var messageTime = animateText(this.explainText, message, this.timeSpeakDelay);
        var curFsm = this.fsm;
        createjs.Tween.get(this.character).wait(messageTime).to({ x: newX, y: newY }, 2000, createjs.Ease.circOut).to({ y: this.character.y - 75, skewX: 50, skewY: 50 }, 500, createjs.Ease.linear).wait(500).call(function () { curFsm.changeState(new WoodyState3(curFsm)); }); //TODO calc these values once get images
    },
    update: function () {

    },
    exit: function () {
        createjs.Tween.removeTweens(this.character);
        stage.removeAllChildren();
    }
}

/* The 3rd state for woody. Shows the mouth with woody in it */
function WoodyState3(fsm) {
    State.call(this, fsm);
    this.timeSpeakDelay = 200;
}

extend(State, WoodyState3);

WoodyState3.prototype = {
    enter: function () {
        var bg = new createjs.Bitmap(this.fsm.getResources().getResult("openMouth"));
        var text = new createjs.Text("", g_fontSize + g_fontFamily, g_fontColor);
        var message = "Now, we can see down the throat and look for a sore throat or any bacteria or inflammations that may be in your throat. If the doctor notices anything that shouldn't be there, then he runs some more tests. He wants you to be healthy, so he does all that he can to make you feel better. Let's see what the other tools do.";
        bg.scaleX = canvas.width / bg.image.width;
        bg.scaleY = canvas.height / bg.image.height;
        setBackGroundColor("#FDFDE6"); //Test color
        stage.addChild(bg);
        stage.addChild(text);
        var messageTime = animateText(text, message, this.timeSpeakDelay);
	transitionChapterAtTime(messageTime + WAIT_TIME, this.fsm);


    },
    update: function () {

    },
    exit: function () {
        stage.removeAllChildren();
    }
}


/* This state moves Ms. Knee knocker to the kid and knocks on the kids knee */
function KneeKnockerState2(fsm, character, kidSitting) {
    State.call(this, fsm);
    this.character = character;
    this.explainText;
    this.timeSpeakDelay = 200;
    this.kidSitting = kidSitting;
}

extend(State, KneeKnockerState2);

KneeKnockerState2.prototype = {
    enter: function () {
        var normalFirstX = 900;
        var firstJumplocX = ((canvas.width / bgWidth) * normalFirstX) - this.character.image.width;
        var firstJumpY = canvas.height - this.character.image.height - 20;
        var firstMessage = "Let me explain in detail what I do.";
        this.explainText = new createjs.Text("", g_fontSize + g_fontFamily, g_fontColor);
        stage.addChild(this.explainText);
        var timeFirstMessage = animateText(this.explainText, firstMessage, this.timeSpeakDelay);
        createjs.Tween.get(this.character).wait(timeFirstMessage).to({ x: firstJumplocX, y: firstJumpY }, 2000, createjs.Ease.circOut).call(this.onComplete.bind(this));


    },
    update: function () {

    },
    exit: function () {
        createjs.Tween.removeTweens(this.character);
        stage.removeAllChildren();
    },
    onComplete: function () {
        var secondText = "I test to make sure your nerves are working properly. Your nerves are your body's \"feelers\" - they make sure that you can feel things on the surface of your skin and react to them as well. Here, let me show you.";
        var secondDelay = animateText(this.explainText, secondText, this.timeSpeakDelay);
	var kidLegTarget = this.kidSitting.y + (this.kidSitting.image.height - 150);
	console.log(kidLegTarget);
	var heightToJump = (this.character.y + 20) - kidLegTarget;
	console.log(heightToJump);

        this.character.regY = this.character.image.height;
        this.character.y = this.character.y + this.character.image.height;
        createjs.Tween.get(this.character).wait(secondDelay).to({ y: this.character.y - heightToJump }, 300, createjs.Ease.linear).to({ rotation: -30 }, 300).to({ rotation: 15 }, 300).to({ rotation: 0 }, 200).to({ y: this.character.y }, 200).call(this.finalTween.bind(this));

    },
    finalTween: function () {
	var kidKicking = new createjs.Bitmap(this.fsm.getResources().getResult("kid_kicking"));
	kidKicking.y =  canvas.height - ((canvas.height / bgHeight) * 400) - 210;
	kidKicking.x = getRelativeX(this.characterObj, 800) - 110;
	stage.addChild(kidKicking);
	stage.removeChild(this.kidSitting);
        var finalText = "Did you see that? You kicked in the air! That means that your nerves are working well. They felt me knock on the knee and told you to kick to make the knocking go away! If you hadn't done that, we would have known that something was wrong with your reflexes. We're all done here; let's see what my friends are up to.";
        var delay = animateText(this.explainText, finalText, this.timeSpeakDelay);
        //Transition to next chapter
	transitionChapterAtTime(delay + WAIT_TIME, this.fsm); 

    }
}

/* The second state for Otis */
function OtoState2(fsm, character) {
    State.call(this, fsm);
    this.character = character;
    this.explainText;
    this.timeSpeakDelay = 200;
}

extend(State, OtoState2);

OtoState2.prototype = {
    enter: function () {
        var newX = getRelativeX(this.character, 800);
        var newY = getRelativeY(this.character, 20);
        var message = "Let's go to Bob and I can show you my job.";
        this.explainText = new createjs.Text("", g_fontSize + g_fontFamily, g_fontColor);
        stage.addChild(this.explainText);
        console.log("here");
        var messageTime = animateText(this.explainText, message, this.timeSpeakDelay);
        var curFsm = this.fsm;
        createjs.Tween.get(this.character).wait(messageTime).to({ x: newX, y: newY }, 2000, createjs.Ease.circOut).to({ y: this.character.y - 75, skewX: 50, skewY: 50 }, 500, createjs.Ease.linear).wait(500).call(function () { curFsm.changeState(new OtoState3(curFsm)); }); //TODO calc these values once get images
    },
    update: function () {

    },
    exit: function () {
        createjs.Tween.removeTweens(this.character);
        stage.removeAllChildren();
    }
}

/* The 3rd state for Otis. Shows Otis looking into ear */
function OtoState3(fsm) {
    State.call(this, fsm);
    this.timeSpeakDelay = 200;
	this.timer = 0;
}

extend(State, OtoState3);

OtoState3.prototype = {
    enter: function () {
        var bg = new createjs.Bitmap(this.fsm.getResources().getResult("ear"));
        var text = new createjs.Text("", g_fontSize + g_fontFamily, g_fontColor);
        var message = "I look into your ear to make sure there's no extra stuff in your ear canal. It's important that the canal be clean and healthy so you can hear.";
        bg.scaleX = canvas.width / bg.image.width;
        bg.scaleY = canvas.height / bg.image.height;
        //setBackGroundColor("#FDFDE6"); //Test color
        stage.addChild(bg);
        stage.addChild(text);
        var messageTime = animateText(text, message, this.timeSpeakDelay);
	setTimeout(function(fsm) {
		fsm.changeState(new OtoState4(fsm));
	}, messageTime + 700, this.fsm);
    },
    update: function () {
		//this.timer++;
		//if (this.timer > 200){
		//	this.fsm.changeState(new OtoState4(this.fsm));
		//}
    },
    exit: function () {
        stage.removeAllChildren();
    }
}

/* The 4th state for Otis. Shows Otis transforming into an Opthalmoscope, then looking into an eye */
function OtoState4(fsm) {
    State.call(this, fsm);
    this.timeSpeakDelay = 200;
	this.explainText;
	this.firstOto;
	this.secondOto;
	this.thirdOto;
}

extend(State, OtoState4);

OtoState4.prototype = {
    enter: function () {
        this.firstOto = new createjs.Bitmap(this.fsm.getResources().getResult("otoTransf1"));
		this.firstOto.x  = (canvas.width / 2) - 70;
		this.firstOto.y = (canvas.height / 2) - 100;
        this.explainText = new createjs.Text("", g_fontSize + g_fontFamily, g_fontColor);
        var message = "You see, when I have this face on, I'm an Otoscope!";
        //bg.scaleX = canvas.width / bg.image.width;
        //bg.scaleY = canvas.height / bg.image.height;
        //setBackGroundColor("#FDFDE6"); //Test color
		setBackGroundColor("#FFFFFF"); //Test color
        stage.addChild(this.firstOto);
        stage.addChild(this.explainText);
        var firstMessageTime = animateText(this.explainText, message, this.timeSpeakDelay);
		//this.firstOto.alpha = 1;
		createjs.Tween.get(this.firstOto).wait(firstMessageTime).to({x: 400, alpha: 0.8}, 200).to({x: 300, alpha: 0.6}, 200).to({x: 200, alpha: 0.4}, 200).to({x: 100, alpha: 0.2}, 200).to({x: 0, alpha: 0}, 200).call(this.firstTrans.bind(this));
    },
    update: function () {

    },
    exit: function () {
		if(this.firstOto)
		createjs.Tween.removeTweens(this.firstOto);
		if(this.secondOto)
		createjs.Tween.removeTweens(this.secondOto);
		if(this.thirdOto)
		createjs.Tween.removeTweens(this.thirdOto);
        stage.removeAllChildren();
    },
    firstTrans: function () {
		 this.secondOto = new createjs.Bitmap(this.fsm.getResources().getResult("otoTransf2"));
		 this.secondOto.x  = 0;
		 this.secondOto.y = (canvas.height / 2) - 100;
		 var message = "But when I take this face off...";
		 var numWordsBeforeAppear = 3;
         var delay = numWordsBeforeAppear * this.timeSpeakDelay;
		 stage.addChild(this.secondOto);
		 animateText(this.explainText, message, this.timeSpeakDelay);
		 this.secondOto.alpha = 0;
		 createjs.Tween.get(this.secondOto)
		 .wait(delay)
		 .to({x: 100, alpha: 0.2}, 200)
		 .to({x: 200, alpha: 0.4}, 200)
		 .to({x: 300, alpha: 0.6}, 200)
		 .to({x: 400, alpha: 0.8}, 200)
		 .to({x: (canvas.width / 2) - 70, alpha: 1}, 200)
		 .to({x: 700, alpha: 0.8}, 200)
		 .to({x: 800, alpha: 0.6}, 200)
		 .to({x: 900, alpha: 0.4}, 200)
		 .to({x: 1000, alpha: 0.2}, 200)
		 .to({x: 1100, alpha: 0}, 200)
		 .call(this.secondTrans.bind(this)); //move out of the screen to the right
    },
	secondTrans: function () {
		 this.thirdOto = new createjs.Bitmap(this.fsm.getResources().getResult("otoTransf3"));
		 this.thirdOto.x  = 1100;
		 this.thirdOto.y = (canvas.height / 2) - 100;
		 var message = "...and put this face on, I'm an Ophthalmoscope!";
		 var numWordsBeforeAppear = 2;
         var delay = numWordsBeforeAppear * this.timeSpeakDelay;
		 stage.addChild(this.thirdOto);
		 animateText(this.explainText, message, this.timeSpeakDelay);
		 this.thirdOto.alpha = 0;
		 createjs.Tween.get(this.thirdOto).wait(delay).to({x: 1000, alpha: 0.2}, 200).to({x: 900, alpha: 0.4}, 200).to({x: 800, alpha: 0.6}, 200).to({x: 700, alpha: 0.8}, 200).to({x: (canvas.width / 2) - 70, alpha: 1}, 200).wait(2000).call(this.finalFunc.bind(this));
	},
	finalFunc: function () {
		 var bg = new createjs.Bitmap(this.fsm.getResources().getResult("eye"));
         var message = "I look into your eyes, but this time I don't stick my head in. It doesn't hurt at all! The only thing I do is shine a light into your eye and look into it like that. I can see all your blood vessels and nerves this way, so I can see if something is wrong with them in the eye. For example, by looking into the blood vessels in your eye, I can tell whether or not you have something called diabetes, which is very bad for your health. This is when there is too much sugar in your blood. If the doctor finds something strange using me, then he might run some more tests. We do this so that you can feel happy, strong, and better again. That's it for all that I do. Let's go back to the table so that the doctor can finish up.";
         bg.scaleX = canvas.width / bg.image.width;
         bg.scaleY = canvas.height / bg.image.height;
         setBackGroundColor("#FDFDE6"); //Test color
         stage.addChild(bg);
         stage.addChild(this.explainText);
         var messageTime = animateText(this.explainText, message, this.timeSpeakDelay);
	 transitionChapterAtTime(messageTime + WAIT_TIME, this.fsm);
    }
}

/* 2nd state for BP the Blood Pressure Cuff */
function BPState_2(fsm, character, kid) {
    State.call(this, fsm);
    this.character = character;
    this.explainText;
    this.timeSpeakDelay = 200;
    this.kidSitting_img;
    this.kid = kid;
}

extend(State, BPState_2);

BPState_2.prototype = {
    enter: function () {
        var firstMessage = g_userName + ", let me explain what I do. I wrap myself around your arm and hug you! Can you click on me and drag me so that I wrap myself around the left arm of the boy?";
		this.explainText = new createjs.Text("", g_fontSize + g_fontFamily, g_fontColor);
		stage.addChild(this.explainText);
		animateText(this.explainText, firstMessage, this.timeSpeakDelay);
		this.character.cursor = "pointer";	
				
		/* Allow character to be draggable */
		this.character.onPress = function(e) {
			var offset = {x:e.target.x-e.stageX, y:e.target.y-e.stageY};
			e.onMouseMove = function(ev) {
				e.target.x = ev.stageX + offset.x;
				e.target.y = ev.stageY + offset.y;
			}
		}
    },
    update: function () {
		// if user drag the character onto arm of boy, transistion to next state
		if(this.character.x + 20 > (canvas.width / 2 - 40) && (this.character.y > canvas.height/2 + 10)){
					stage.removeChild(this.kid);
					this.fsm.changeState(new BPState_3(this.fsm)); 				
		}
    },
    exit: function () {
        stage.removeChild(this.character, this.explainText);
    }
}

/* This state explains what BP does in detail after user has successfully dragged character onto arm of boy*/
function BPState_3(fsm) {
    State.call(this, fsm);
    this.explainText;
    this.timeSpeakDelay = 200;
	this.bpAroundKid_img;
}

extend(State, BPState_3);

BPState_3.prototype = {
    enter: function () {
        this.bpAroundKid_img =  new createjs.Bitmap(this.fsm.getResources().getResult("bp_around_kid"));
		var bpKid_Width = 220;
		var bpKid_Height = 202;
		
		this.bpAroundKid_img.regX = bpKid_Width / 2;
		this.bpAroundKid_img.regY = bpKid_Height / 2;
		
		this.bpAroundKid_img.x = canvas.width / 2 - 80;
		this.bpAroundKid_img.y = canvas.height/2 + 20;
		stage.addChild(this.bpAroundKid_img);
		
		var secondMessage = "Good job " + g_userName + "! As I'm hugging you, the round gauge on me displays some numbers. From these numbers, the doctor can tell how much power it takes your heart to pump blood through your body. I just hug you for a couple of minutes, and then I unwrap myself from your arm. If the doctor says that the number is too high or too low, then it might be a sign that you're stressed, or not feeling good a lot of the time. The doctor will tell you what to do in order to feel better again. Great news! Your blood pressure is normal. Let's go back to the table, and see what the others are up to.";
		this.explainText = new createjs.Text("", g_fontSize + g_fontFamily, g_fontColor);
		stage.addChild(this.explainText);
		var messageTime = animateText(this.explainText, secondMessage, this.timeSpeakDelay);
		transitionChapterAtTime(messageTime + WAIT_TIME, this.fsm);
		
    },
    update: function () {

    },
    exit: function () {
        stage.removeAllChildren();
    }
}

/* State has doctor transition onto screen*/
function CertificateState_1(fsm, nextState) {
	State.call(this, fsm, nextState);
	this.doctor_img;	// image of doctor
}

extend(State, CertificateState_1); //Have this state inherit from the State class. This MUST be called for every state

CertificateState_1.prototype = {
	enter: function() {
	
		// if user got to this state and g_userName is still undefined, give default name
		if (typeof g_userName === 'undefined' || g_userName === ""){
			g_userName = "Guest";
		}
		
		this.doctor_img = new createjs.Bitmap(this.fsm.getResources().getResult("StandingDoctor"));
		
		// image dimension
		var width = 223;
		var height = 501;
		
		// set up registration position for image
		this.doctor_img.regX = width / 2;
		this.doctor_img.regY = height / 2;
		
		// give doctor a position on canvas
		this.doctor_img.x = canvas.width / 2;
		this.doctor_img.y = canvas.height + 20;
		
		/* Attempt at making image scalable to any screen size*/
		// this.doctor_img.scaleX = canvas.width / (canvas.width / 1.5);
		// this.doctor_img.scaleY = canvas.height / (canvas.width / 1.5);
		
		//Set up the background
        var background = new createjs.Bitmap(this.fsm.getResources().getResult("doctor_office_bg"));
        background.scaleX = canvas.width / bgWidth;
        background.scaleY = canvas.height / bgHeight;

        //Add background and the character to the canvas
        stage.addChild(background, this.doctor_img);
	},
	update: function() {
		var maxHeightPosition = canvas.height / 2 + 120;
		
		this.doctor_img.y -= 10;						// have doctor appear from bottom to middle of screen
		if (this.doctor_img.y < maxHeightPosition){		// once doctor is at middle of screen, move to next state to do something else
			this.fsm.changeState(new CertificateState_2(this.fsm));
		}
	},
	exit: function() {
		// will keep the children from this stage for next state
	}
}

/* State has doctor congratulating user on finishing game*/
function CertificateState_2(fsm, nextState) {
	State.call(this, fsm, nextState);
	
	this.timeSpeakDelay = 200;
	this.docText_1;
	this.docText_2;
	this.docText_3;
	this.textArr;
	this.textIndex = 0;
	this.textTicker = 0;
	this.timer = 0;
	this.messageArr;
	
}

extend(State, CertificateState_2); //Have this state inherit from the State class. This MUST be called for every state

CertificateState_2.prototype = {
	enter: function() {
		// console.log("debug stuff here");
		
		var message_1 = "Congratulations " + g_userName + "! You Have Successfully Completed the Game of...";
		var message_2 = "What's in a Doctor's Bag?";
		var message_3 = "Click the \"Print\" button to print out your very own certificate!";
		
		messageArr = [message_1, message_2, message_3]; 	// array holding doctor's message
		
		this.docText_1 = new createjs.Text("", g_fontSize + g_fontFamily , g_fontColor);
		this.docText_2 = new createjs.Text("", "bold 70px"	+ g_fontFamily, "#FF0000");
		this.docText_3 = new createjs.Text("", g_fontSize + g_fontFamily , g_fontColor);
		
		this.textArr = [this.docText_1, this.docText_2, this.docText_3];
		
		stage.addChild(this.textArr[this.textIndex]);
		animateText(this.textArr[this.textIndex], messageArr[this.textIndex], this.timeSpeakDelay);
	},
	update: function() {
		this.textTicker++; 						// Timer for how long current message is displayed
		this.timer++;
		/* Start displaying messages */
		if (this.textTicker > 70 && this.textIndex < 2){

				stage.removeChild(this.textArr[this.textIndex]); //Remove message
					
				this.textIndex++; 				// Increment to next message
				this.textTicker = 0; 			// Reset ticker
					
				stage.addChild(this.textArr[this.textIndex]);
				animateText(this.textArr[this.textIndex], messageArr[this.textIndex], this.timeSpeakDelay);

		}
		
		if(this.timer > 250){	
				this.fsm.changeState(new CertificateState_3(this.fsm));		// transition to next chapter
		}		
	},
	exit: function() {
		stage.removeAllChildren();
	}
}

/* State showing certificate with user name on it */
function CertificateState_3(fsm, nextState) {
	State.call(this, fsm, nextState);
	
	this.certificate_img;
	this.certImg_ref;
	this.userName_txt;
	this.buttonContainer;
	
}

extend(State, CertificateState_3); //Have this state inherit from the State class. This MUST be called for every state

CertificateState_3.prototype = {
	enter: function() {
		// setting up certificate image
		this.certificate_img = new createjs.Bitmap(this.fsm.getResources().getResult("certificate"));
		this.certImg_ref = this.certificate_img.image;
		// make certificate as large as canvas
		this.certificate_img.scaleX = canvas.width / this.certImg_ref.width;
        this.certificate_img.scaleY = canvas.height / this.certImg_ref.height;
		
		// adding user name to certificate
		this.userName_txt = new createjs.Text(g_userName, "bold 60px " + g_fontFamily, "#FF0000");
		// this.userName_txt.regX = this.certificate_img.scaleX * this.certImg_ref.width / 2;
		// this.userName_txt.regY = this.userName_txt.getMeasuredHeight / 2;
		this.userName_txt.x = this.certificate_img.scaleX * this.certImg_ref.width / 2 - 25;
		this.userName_txt.y = this.certificate_img.scaleY * this.certImg_ref.height / 4 - 40;
		
		stage.addChild(this.certificate_img, this.userName_txt);
		createjs.Tween.get(this.certificate_img).to({ alpha: 0 }, 1000).to({ alpha: 1}, 1000).call(this.showButton.bind(this));
		
		},
	update: function() {
		
	},
	exit: function() {
		stage.removeAllChildren();
	},
	showButton: function() { //Shows the button to print after the tween
		this.buttonContainer = new createjs.Container();
		var printText = new createjs.Text("Print", g_fontSize + g_fontFamily, "white");
		var printBackground = new createjs.Shape();
		printBackground.y = 5;
		printBackground.x = -5;
		printBackground.graphics.beginFill("black").drawRoundRect(0, 0, printText.getMeasuredWidth() + 10, printText.getMeasuredHeight(), 10);
		this.buttonContainer.x = 10;
		this.buttonContainer.y = 10;	
		this.buttonContainer.addChild(printBackground, printText);
		this.buttonContainer.addEventListener("click", this.printCertificate.bind(this));
		this.buttonContainer.cursor = "pointer";
		stage.addChild(this.buttonContainer);

	},
	printCertificate: function () {
		stage.removeChild(this.buttonContainer); //Remove the button so it is not printed
		setTimeout(function(container){
			var img = canvas.toDataURL("image/png");
			popup = window.open();
			popup.document.write("<img src='" + img + "' style='width:95%; height:auto'>"); 
			popup.print();
			stage.addChild(container); //Add the button back to the canvas

		},30, this.buttonContainer);
		}
}

function ChooseCharacterState(fsm, nextState) {
	State.call(this, fsm, nextState);
	this.bckgrdImg;
	this.bagImg;
	this.otoImg;
	this.tempoImg;
	this.woodyImg;
	this.stethImg;
	this.bpImg;
	this.hammerImg;
	this.certifImg;
	this.docText;
}

extend(State, ChooseCharacterState); //Have this state inherit from the State class. This MUST be called for every state

ChooseCharacterState.prototype = {
	enter: function() {
		setBackGroundColor("#FFFFFF");

		//Background
		this.bckgrdImg = new createjs.Bitmap(this.fsm.getResources().getResult("main_bckgrd"));
		stage.addChild(this.bckgrdImg);
		
		this.certifImg = new createjs.Bitmap(this.fsm.getResources().getResult("cert"));	
		this.certifImg.cursor = "pointer"; //Show a pointer as the cursor for this image object
		this.certifImg.x = 300;
		this.certifImg.y = 80;
		
		if (!allChaptersVisited()) {
				this.certifImg.alpha = 0.2; //make the certificate light to indicate that it cannot be clicked
				stage.addChild(this.certifImg);
		}
		else {
				this.certifImg = new createjs.Bitmap(this.fsm.getResources().getResult("cert2"));
				this.certifImg.cursor = "pointer";
				this.certifImg.x = 280;
				this.certifImg.y = 60;
			    stage.addChild(this.certifImg); //highlighted certificate (emphasizing to user that they can get the certificate they earned)
	    }

	    //Otis
		this.otoImg = new createjs.Bitmap(this.fsm.getResources().getResult("oto"));
		this.otoImg.cursor = "pointer"; //Show a pointer as the cursor for this image object
	    this.otoImg.x = 580;
		this.otoImg.y = 30;
		
		//if already played with, dim character
		if(chapterTracker[6] == 1)
			this.otoImg.alpha = 0.1;	
			
	    stage.addChild(this.otoImg);
		
		//Tempo
		this.tempoImg = new createjs.Bitmap(this.fsm.getResources().getResult("tempoWithName"));
		this.tempoImg.cursor = "pointer";
		this.tempoImg.x = 820;
		this.tempoImg.y = -5;
		
		if(chapterTracker[2] == 1)
			this.tempoImg.alpha = 0.1;
			
	    stage.addChild(this.tempoImg);
		
		//Woody
		this.woodyImg = new createjs.Bitmap(this.fsm.getResources().getResult("woody"));
		this.woodyImg.cursor = "pointer";
	    this.woodyImg.x = 1100;
		this.woodyImg.y = 49;
		
		if(chapterTracker[4] == 1)
			this.woodyImg.alpha = 0.1;
			
	    stage.addChild(this.woodyImg);
	
		//Lubba & Dubba
		this.stethImg = new createjs.Bitmap(this.fsm.getResources().getResult("steth"));
		this.stethImg.cursor = "pointer";
 		this.stethImg.x = 415;
		this.stethImg.y = 334;
		
		if(chapterTracker[5] == 1)
			this.stethImg.alpha = 0.1;
			
	    stage.addChild(this.stethImg);
		
		//B.P.
		this.bpImg = new createjs.Bitmap(this.fsm.getResources().getResult("bp"));
		this.bpImg.cursor = "pointer";
		this.bpImg.x = 750;
		this.bpImg.y = 325;
		
		if(chapterTracker[7] == 1)
			this.bpImg.alpha = 0.1;
			
	    stage.addChild(this.bpImg);
	
		//Ms. Knee Knocker
		this.hammerImg = new createjs.Bitmap(this.fsm.getResources().getResult("hammer"));
		this.hammerImg.cursor = "pointer";
		this.hammerImg.x = 1150;
		this.hammerImg.y = 308;
		
		if(chapterTracker[3] == 1)
			this.hammerImg.alpha = 0.1;
			
	    stage.addChild(this.hammerImg);
		
	    //Doctor's Bag
		this.bagImg = new createjs.Bitmap(this.fsm.getResources().getResult("bag"));
		this.bagImg.y = 400;
		stage.addChild(this.bagImg);
		
		this.docText = new createjs.Text("Welcome back! Choose another character for more fun learning!", "bold italic 18px 'Comic Sans MS', cursive, sans-serif", "#0000FF");

		//Initial position of doctor's words
		this.docText.x = 100;
		this.docText.y = 230;
		
		if (!allChaptersVisited()) {
				stage.addChild(this.docText);
		}
		else {
				this.docText = new createjs.Text("Welcome back! You've learned quite a bit about what's in a doctor's bag!  I think you deserve an award!", "bold italic 18px 'Comic Sans MS', cursive, sans-serif", "#0000FF");
				this.docText.x = 100;
				this.docText.y = 260;
				stage.addChild(this.docText);
		}

		this.otoImg.onClick = function(e) {
			goToFSM(6); //Transition to Otis game
		}
	    this.tempoImg.onClick = function(e) {
			goToFSM(2); //Transition to Tempo game
		}
 		this.woodyImg.onClick = function(e) {
			goToFSM(4); //Transition to Woody game
		}		
		this.stethImg.onClick = function(e) {
			goToFSM(5); //Transition to Lubba & Dubba game
		}	
		this.bpImg.onClick = function(e) {
			goToFSM(7); //Transition to BP game
		}	
		this.hammerImg.onClick = function(e) {
			goToFSM(3); //Transition to Knocker game
		}
		
		this.certifImg.onClick = function(e) {
			//IF GAMES NOT ALL PLAYED
		 	var message = new createjs.Text("Play with all the characters to earn this certificate!", "12px 'Comic Sans MS', cursive, sans-serif", "#FF0000");
			message.x = 220;
			message.y = 40;
			if (!allChaptersVisited())
				stage.addChild(message);
			else
				goToFSM(CERT_CHAPTER_INDEX);
				
			createjs.Tween.get(message).wait(2000).to({x: -500}, 1000, createjs.Ease.elasticIn);
		}

	},
	update: function() {
		if (this.docText.x < 250){ //Current group of words moving from doctor's mouth
			this.docText.x += 5; 
		}
		
		//flashing and throbbing certificate to alert user
		if (allChaptersVisited()) {
				if (this.certifImg.alpha < 1)
				{
				 	this.certifImg.alpha += 0.1; 
				 	this.certifImg.scaleX += 0.01;
					this.certifImg.scaleY += 0.01;
				}
				else {
			     	this.certifImg.alpha = 0.1; 
				 	this.certifImg.scaleX = 1;
				 	this.certifImg.scaleY = 1;
	   			}
		}

	},
	exit: function() {
		stage.removeAllChildren();
	}
}
