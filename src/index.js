/**
 * Copyright 2017 Joe Pecore
 * 
 * Stamp Collector
 * 
 * Resources ISWSC World Wide Stamp Identifier
 * http://www.iswsc.org/iswsc_identifier.html
 * 
 * 
 * 
 */

// App ID for the skill
var APP_ID = 'amzn1.ask.skill.5def441f-b36d-4f44-a8d7-f3c1a4837e17'; // Stamp
// ID
// Alexa stamp skill

var https = require('https');
var http = require('http');



var urlColnet = "http://colnect.com";
var urlStampLlst = '/en/stamps/list/';

/**
 * The AlexaSkill Module that has the AlexaSkill prototype and helper functions
 */
var AlexaSkill = require('./AlexaSkill');

/**
 * StampSkill is a child of AlexaSkill. To read more about inheritance in
 * JavaScript, see the link below.
 * 
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Introduction_to_Object-Oriented_JavaScript#Inheritance
 */
var StampSkill = function() {
	AlexaSkill.call(this, APP_ID);
};

// Extend AlexaSkill
StampSkill.prototype = Object.create(AlexaSkill.prototype);
StampSkill.prototype.constructor = StampSkill;
StampSkill.prototype.eventHandlers.onSessionStarted = function(
		sessionStartedRequest, session) {
	console.log("StampSkill onSessionStarted requestId: "
			+ sessionStartedRequest.requestId + ", sessionId: "
			+ session.sessionId + " userId: " + session.user.userId

	);

};

/* global variables */

/* onLaunch */
StampSkill.prototype.eventHandlers.onLaunch = function(launchRequest, session,
		response) {
	console.log("StampSkill onLaunch requestId: " + launchRequest.requestId
			+ ", sessionId: " + session.sessionId);
	getWelcomeResponse(response);
};

/* onSessionEnded */
StampSkill.prototype.eventHandlers.onSessionEnded = function(
		sessionEndedRequest, session) {
	console.log("onSessionEnded requestId: " + sessionEndedRequest.requestId
			+ ", sessionId: " + session.sessionId);
	// any session cleanup logic would go here

};

/* intents */
StampSkill.prototype.intentHandlers = {

	"stampIntent" : function(intent, session, response) {
		console.log("stampIntent   requestId: " + ", sessionId: "
				+ session.sessionId);
		getWelcomeResponse(response);
	},

	"GetStampIDIntent" : function(intent, session, response) {
		console.log("GetStampIDIntent   requestId: "
				+ session.application.applicationId + ", sessionId: "
				+ session.sessionId + "consentToken: ");
		handleGetStampIDIntent(intent, session, response);
	},

	"getStampValue" : function(intent, session, response) {
		handleGetStampValueIntentRequest(intent, session, response);
	},
	"getStampTerm" : function(intent, session, response) {
		handleGetStampTermIntentRequest(intent, session, response);
	},

	"AMAZON.HelpIntent" : function(intent, session, response) {
		var speechText = "You can ask what what country a stamp is from by spelling some of the words on the stamp. What words are on the stamp?";
		var repromptText = "I did not understand you. Did you try spelling the words on the stamp? What words are on the stamp?";
		var speechOutput = {
			speech : speechText,
			type : AlexaSkill.speechOutputType.PLAIN_TEXT
		};
		var repromptOutput = {
			speech : repromptText,
			type : AlexaSkill.speechOutputType.PLAIN_TEXT
		};
		response.ask(speechOutput, repromptOutput);
	},

	"AMAZON.StopIntent" : function(intent, session, response) {
		var speechOutput = {
			speech : "Have a great day!",
			type : AlexaSkill.speechOutputType.PLAIN_TEXT
		};
		response.tell(speechOutput);
	},

	"AMAZON.CancelIntent" : function(intent, session, response) {
		var speechOutput = {
			speech : "Have a great day!",
			type : AlexaSkill.speechOutputType.PLAIN_TEXT
		};
		response.tell(speechOutput);
	}
};

/**
 * Function to handle the onLaunch skill behavior
 */

function getWelcomeResponse(response) {
	// If we wanted to initialize the session to have some attributes we could
	// add those here.

	var repromptText = "I did not understand. What did you say?";
	var speechText = "<p>Welcome to the Stamp ID skill. "
			+ "I can help you find out which country a stamp is from by the words on them."
			+ " What are some words on the stamp, please spell them out for me?</p>";

	var speechOutput = {
		speech : "<speak>" + speechText + "</speak>",
		type : AlexaSkill.speechOutputType.SSML
	};
	var repromptOutput = {
		speech : repromptText,
		type : AlexaSkill.speechOutputType.PLAIN_TEXT
	};

	response.ask(speechOutput, repromptOutput);

}

function handleGetStampIDIntent(intent, session, response) {
	var lettersSlot = intent.slots.letters;

	var sessionAttributes = {};
	var repromptText = "I did not hear you. what?";
	var speechText = "";
	var cardTitle = "Stamp ID";
	var cardContent = "";
	var month = "";

	console.log(" lettersSlot.value = " + lettersSlot.value);

	// replace all the whitespace of the spelt out word
	var words = lettersSlot.value.toUpperCase();
	words = words.replace(/ /g, '');
	words = words.replace(/\./g, '');

	console.log(" words = " + words);

	// load json file of stamp id / countries
	// var STAMP_ID = require('./stampids.json');
	var STAMP_ID = require('./iswsc.json');
	var key = 'ABETALEPORTOMAERKE'
	console.log('STAMP_ID.ABETALEPORTOMAERKE.countries = '
			+ STAMP_ID[key].countries);
	var fs = require('fs');
	// var ids = JSON.parse(fs.readFileSync('./stampids.json', 'utf8'));
	var iswsc = JSON.parse(fs.readFileSync('./iswsc.json', 'utf8'));

	console.log("Output Content : \n" + iswsc);

	var ids = iswsc[words];

	console.log(" ids = " + ids);

	if (ids) {
		speechText = speechText + "Possible matches: "

		if (ids.countries) {
			speechText = speechText + ids.countries;
		}
		// for (i = 0; i < ids.countries.length; i++) {
		// speechText = speechText + ids.countries[i];
		// speechText = speechText + ids.countries[;
		// }
	} else {
		speechText = "Sorry, I could not find it. "
	}

	var speechOutput = {
		speech : "<speak>" + speechText + "</speak>",
		type : AlexaSkill.speechOutputType.SSML
	};
	var repromptOutput = {
		speech : repromptText,
		type : AlexaSkill.speechOutputType.PLAIN_TEXT
	};

	session.attributes = sessionAttributes;

	cardContent = speechOutput + "  (link to Colnet Country page coming soon) "
	console.log(" StampID: handleGetStampIDIntent");
	response.tell(speechOutput, repromptOutput, cardTitle,cardContent);

}

function handleGetStampValueIntentRequest(intent, session, response) {
	console.log("in handleGetStampValueIntentRequest");
	var topicSlot = intent.slots.topic;
	var topic = topicSlot.value.replace(/ /gm, '+')  ;
	var valueSlot = intent.slots.value;
	var repromptText = "With Stamp year loookup, you can get the year a specif stamp was issued on . "
			+ "For example, you could say what year was 32 cent Bobby Jones issued on.";
	var sessionAttributes = {};
	var postfixContent = "";
	var cardContent = "";
	var cardTitle = "Stamp Year ";
	var stampURL = "";

	getStampValueTopic(
		valueSlot.value,
		topic,	   
		function(stringResult) {	
			
			console.log ('stringResult: ' + stringResult);
			stampULR = stringResult;
			getStampValueTopicPage (
				stringResult,
				function(stringResult)  {
					var speechText = "", i;
					sessionAttributes.text = stringResult;
					console.log("stringResult =  " + stringResult);
					session.attributes = sessionAttributes;
					if (stringResult.length === 0) {
						speechText = "Sorry. There is a problem connecting to Colnet at this time. Please try again later.";
						cardContent = speechText;
						response.tell(speechText);
					} else {
			
						cardTitle = intent.slots.value.value + " cent " +  intent.slots.topic.value ;
						cardContent = stringResult +  "\n " + stampULR;
						speechText = speechText + stringResult;
			
						var speechOutput = {
							speech : "<speak>" + speechText + "</speak>",
							type : AlexaSkill.speechOutputType.SSML
						};
						var repromptOutput = {
							speech : repromptText,
							type : AlexaSkill.speechOutputType.PLAIN_TEXT
						};
						response.tellWithCard(speechOutput, cardTitle, cardContent);
			
						// response.askWithCard(speechOutput, repromptOutput,
						// cardTitle, cardContent);
					}  
				}
			)			 
		} 
	)
};
 


function handleGetStampTermIntent(intent, session, response) {
	var termSlot = intent.slots.term;

	var sessionAttributes = {};
	var repromptText = "I did not hear you. what?";
	var speechText = "";
	var cardTitle = "Stamp Term";
	var cardContent = "";
	var month = "";

	console.log(" termSlot.value = " + termSlot.value);

	// replace all the whitespace of the spelt out word
	var term = termSlot.value;
	//words = words.replace(/ /g, '');
	//words = words.replace(/\./g, '');

	console.log(" term = " + term);

	// load json file of terms
	 
	var GLOSSARY = require('./glossery.json');
	var key = 'Margin'
	console.log('GLOSSARY.Letterpress.def = '
			+ GLOSSARY[key].def);
	

	var fs = require('fs');
	// var ids = JSON.parse(fs.readFileSync('./stampids.json', 'utf8'));
	var glossary = JSON.parse(fs.readFileSync('./glossery.json', 'utf8'));

	//console.log("Output Content : \n" + glossary);

	var terms = iswsc[term];

	console.log(" terms = " + terms);

	if (ids) {
		speechText = speechText + " : "

		if (terms.def) {
			speechText = speechText + terms.def;
		}
		// for (i = 0; i < ids.countries.length; i++) {
		// speechText = speechText + ids.countries[i];
		// speechText = speechText + ids.countries[;
		// }
	} else {
		speechText = "Sorry, I could not find that term. "
	}

	var speechOutput = {
		speech : "<speak>" + speechText + "</speak>",
		type : AlexaSkill.speechOutputType.SSML
	};
	var repromptOutput = {
		speech : repromptText,
		type : AlexaSkill.speechOutputType.PLAIN_TEXT
	};

	session.attributes = sessionAttributes;

	cardContent = speechOutput + "  (link to Colnet Country page coming soon) "
	console.log(" StampID: handleGetStampIDIntent");
	response.tell(speechOutput, repromptOutput, cardTitle,cardContent);

}
  
function getStampValueTopicPage(url, eventCallback) {
	console.log("in getStampValueTopicPage");
	console.log("url = [" + url + "]");
	var urlColnet = "colnect.com";
	var urlStampLlst = '/en/stamps/list/';

 //  var valueTopicPath =  urlStampLlst + 'face_value/' + value + '-' + value + '/item_name/' + topic;

	///console.log("valueTopicPath =  " + valueTopicPath);
	
	  
	https.get(url, function(res) {
		var body = '';

		res.on('data', function(chunk) {
			body += chunk;
		});
		//console.log("body =  " + body);
		res.on('end', function() {
			var stringResult = parseStampValueTopicPage(body,url);
			 
			eventCallback(stringResult);

		});
	}).on('error', function(e) {
		console.log("Got error: ", e);
	});
}
function parseStampValueTopicPage(inputText,url) {

	//inputText = inputText.replace(/<(?:.|\n)*?>/gm, '') // Remove HTML
	//console.log('inputText = ' + inputText);
	DateIndex = inputText.indexOf("Date:");
 
	var RetText = inputText.substring(DateIndex+31, DateIndex+111 ) ;
	console.log("RetText = " + RetText);
	RetText = RetText.substring(0, RetText.indexOf('</div>') );
			
			
	if (RetText.length > 0) {
		RetText = 'That stamp was issued on  ' + RetText ;
		//retArr.push(RetText);
		// now get the page  
		
		return RetText
	}

	RetText = 'Hmmm... there was some problem contacting my source colnet.';

//	retArr.push(RetText);

	return RetText;
}


function getStampValueTopic(value, topic, eventCallback) {
	

	console.log("in getStampValueTopic");
	console.log ('value and topic = ' + value + " " + topic);
	var urlColnet = "colnect.com";
	var urlStampLlst = '/en/stamps/list/';

	var valueTopicPath =  urlStampLlst + 'face_value/' + value + '-' + value + '/item_name/' + topic;

	//console.log("valueTopicPath =  " + valueTopicPath);
	
	 var aragoSearchPath = '/search?q='+ value + 'c+' + topic + '+single++site:arago.si.edu';
	 
		
	console.log('aragoSearchPath = ' + aragoSearchPath);
	var request_options = 
	{
	    host: 'www.google.com',
	    headers: { 'User-Agent': 'Mozilla/5.0'} ,
	    path: aragoSearchPath
	};
 
			
	https.get(request_options, function(res) {
		var body = '';

		res.on('data', function(chunk) {
			body += chunk;
		});
		//console.log("body =  " + body);
		res.on('end', function() {
			var stringResult = parseStampValueTopic(body);
			console.log('getStampValueTopic returning: ' + stringResult)
			eventCallback(stringResult);
		});
	}).on('error', function(e) {
		console.log("Got error: ", e);
	});
}

function parseStampValueTopic(inputText) {
	console.log('in parseStampValueTopic');
	//inputText = inputText.replace(/<(?:.|\n)*?>/gm, '') // Remove HTML
	// console.log('inputText' + inputText);
	LinkIndex = inputText.indexOf("://arago.si.edu/record_");
	
	var RetText = inputText.substring(LinkIndex, LinkIndex + 77) ;
	
	if (LinkIndex == -1) {
		return "Could not find a record";
	}
	var htmlIndex = RetText.indexOf(".html");
	
	RetText = RetText.substring(0,  htmlIndex +5);
	RetText = 'https' + RetText;
	console.log('RetText is ' + RetText);
			
	if (RetText.length > 0) {
		 
		//retArr.push(RetText);
		// now get the page  
		
		return RetText
	}

	RetText = 'Hmmm... there was some problem contacting my source colnet.';

//	retArr.push(RetText);

	return RetText;
}

function buildSpeechletResponseWithoutCard(output, repromptText,
		shouldEndSession) {
	return {
		outputSpeech : {
			type : "PlainText",
			text : output
		},
		reprompt : {
			outputSpeech : {
				type : "PlainText",
				text : repromptText
			}
		},
		shouldEndSession : shouldEndSession
	};
}

// Create the handler that responds to the Alexa Request.
exports.handler = function(event, context) {
	// Create an instance of the StampSkill.
	var skill = new StampSkill();
	skill.execute(event, context);
};