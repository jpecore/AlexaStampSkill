/**
 * Copyright 2017 Joe Pecore
 * 
 * Stamp Collector
 * 
 * Resources ISWSC World Wide Stamp Identifier
 * http://www.iswsc.org/iswsc_identifier.html
 * 
 * 
 * TODO: replace key with constant
 */

// App ID for the skill
var APP_ID = 'amzn1.ask.skill.5def441f-b36d-4f44-a8d7-f3c1a4837e17'; // Stamp
// ID
// Alexa stamp skill

var https = require('https');
var http = require('http');

var urlColnet = "http://colnect.com";
var urlStampLlst = '/en/stamps/list/';
var wikiUrl = "https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exlimit=1&format=json&explaintext=&exsectionformat=plain&redirects=&titles=Postage_stamps_and_postal_history_of_";

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

	"AMAZON.HelpIntent" : function(intent, session, response) {
		var speechText = "Stamp Collector can help you do many things." +
				"To get the defintion of a stamp term, say something like: What is Perforation?" +
				"To try and identify which country a stamp is from, spell some of the words like:   " +
				"What country has the letters c. t. o. c." +
				"Which command would you like to try? ";
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
	},
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

	"getStampDataIntent" : function(intent, session, response) {
		handleGetStampDataIntentRequest(intent, session, response);
	},
	"GetStampTermIntent" : function(intent, session, response) {
		handleGetStampTermIntentRequest(intent, session, response);
	},
	"GetStampCountryHistoryIntent" : function(intent, session, response) {
		handleGetStampCountryHistoryIntentRequest(intent, session, response);
	},
	"StoreUsernameIntent" : function(intent, session, response) {
		handleStoreUsernameIntentRequest(intent, session, response);
	},
	"RandomTermIntent" : function(intent, session, response) {
		handleRandomTermIntentRequest(intent, session, response);
	}

};

/**
 * Function to handle the onLaunch skill behavior
 */

function getWelcomeResponse(response) {
	// If we wanted to initialize the session to have some attributes we could
	// add those here.

	var repromptText = "I did not understand. What did you say?";
	var speechText = "<p>Welcome to the Stamp Collector skill. "
			+ "I can help you find a stamp term by saying something like: What is Perforation?"
			+ "I can also find out which country a stamp is from by the words that are on them by saying: What country has the letters c. t. o. t. on their stamps? "
			+ "How can I help you today?</p>";

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
		speechText = speechText
				+ "According to the I S W S C World Wide Stamp Identifier, possible matches for "
				+ lettersSlot.value + " are: "

		if (ids.countries) {
			speechText = speechText + ids.countries;
		}
		// for (i = 0; i < ids.countries.length; i++) {
		// speechText = speechText + ids.countries[i];
		// speechText = speechText + ids.countries[;
		// }
	} else {
		speechText = "Sorry, I could not find country with stamps that have those letters on it. "
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
	response.tell(speechOutput, repromptOutput, cardTitle, cardContent);

}

function handleGetStampDataIntentRequest(intent, session, response) {
	console.log("in handleGetStampDataIntentRequest");
	var topicSlot = intent.slots.topic;
	var topic;
	var valueSlot = intent.slots.value;
	var repromptText = "With Stamp year loookup, you can get the year a specif stamp was issued on . "
			+ "For example, you could say what year was 32 cent Bobby Jones issued on. What stamp would you like to look up?";
	var sessionAttributes = {};
	var postfixContent = "";
	var cardContent = "";
	var cardTitle = "Stamp Year ";
	var stampURL = "";

	if (topicSlot) {
		topic = topicSlot.value.replace(/ /gm, '+');
	}

	// var smallImageUrl =
	// 'https://upload.wikimedia.org/wikipedia/commons/1/16/Modry_mauritius.jpg',
	// largeImageUrl =
	// 'https://upload.wikimedia.org/wikipedia/commons/1/16/Modry_mauritius.jpg'

	getStampValueTopic(
			valueSlot.value,
			topic,
			function(jsonResult) {
				// let's just return the top match for now
				// TODO: handle multiple matches

				console.log('jsonResult: ' + jsonResult);
				var count = Object.keys(jsonResult).length;
				console.log('count = ' + count);

				if (count < 1) {

					response
							.tell("sorry, I could not find that stamp. Try again with a different topic.");
				} else {
					var firstMatch = jsonResult[Object.keys(jsonResult)[0]];
					console.log(' first item =' + firstMatch);
					var StampID = firstMatch[Object.keys(firstMatch)[0]]
					console.log(' StampID =' + StampID);
					// stampULR = stringResult;
					// the the stamp ID and get it's meatadata
					getStampData(
							StampID,
							function(stampData) {
								var speechText = "", i;
								sessionAttributes.text = stampData;
								console.log("stampData =  " + stampData);
								// session.attributes = sessionAttributes;
								if (stampData.length === 0) {
									speechText = "Sorry. There is a problem connecting to Colnect at this time. Please try again later.";
									cardContent = speechText;
									response.tell(speechText);
								} else {

									cardTitle = intent.slots.value.value
											+ " cent "
											+ intent.slots.topic.value;

									// stampULR;
									console.log("stampData[4] = "
											+ stampData[4].substring(0, 4));
									speechText = "The " + stampData[13] + " "
											+ stampData[12].substring(0, 1)
											+ " " + stampData[0]
											+ "  stamp  was issued in "
											+ stampData[4].substring(0, 4);

									if (stampData[6]) {
										speechText = speechText
												+ " with a print run of "
												+ stampData[6];
									}
									speechText = speechText + ".";
									speechText = speechText
											+ " Catalog Codees are "
											+ stampData[3];

									cardContent = speechText;
									var speechOutput = {
										speech : "<speak>" + speechText
												+ "</speak>",
										type : AlexaSkill.speechOutputType.SSML
									};
									var repromptOutput = {
										speech : repromptText,
										type : AlexaSkill.speechOutputType.PLAIN_TEXT
									};
									response.tellWithCard(speechOutput,
											cardTitle, repromptText,
											cardContent);
									// response.tellWithPictureCard(speechOutput,
									// cardTitle, repromptText, cardContent,
									// smallImageUrl, largeImageUrl);

									// response.askWithCard(speechOutput,
									// repromptOutput,
									// cardTitle, cardContent);
								}
							})
				}
			})

};

function handleGetStampTermIntentRequest(intent, session, response) {
	var termSlot = intent.slots.term;

	var sessionAttributes = {};
	var repromptText = "I did not hear you. what?";
	var speechText = "";
	var cardTitle = "Stamp Term";
	var cardContent = "";
	var month = "";
	var GLOSSARY = require('./glossery.json');
	var fs = require('fs');

	console.log(" termSlot.value = " + termSlot.value);

	// replace all the whitespace of the spelt out word
	var term = termSlot.value;
	// words = words.replace(/ /g, '');
	// words = words.replace(/\./g, '');

	// term = term.charAt(0).toUpperCase() + term.slice(1);
	if (term) {
		term = term.toLowerCase(); // glossary.json is all in lowercase.
		console.log(" term = " + term);
		// load json file of terms
		// var key = 'Margin'
		// console.log('GLOSSARY.Letterpress.def = '
		// + GLOSSARY[key].def);
		// var ids = JSON.parse(fs.readFileSync('./stampids.json', 'utf8'));
		var glossary = JSON.parse(fs.readFileSync('./glossery.json', 'utf8'));

		// console.log("Output Content : \n" + glossary);

		var terms = glossary[term];

		console.log(" terms = " + terms);

		if (terms) {
			if (terms.def) {
				speechText = speechText + "According to linns.com, " + term
						+ " is " + terms.def;
			}
			// for (i = 0; i < ids.countries.length; i++) {
			// speechText = speechText + ids.countries[i];
			// speechText = speechText + ids.countries[;
			// }
		} else {
			speechText = "Sorry, I could not find the term: " + term + ".";
		}
	} else {
		speechText = "Sorry, I did not hear a term. "
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
	console.log(" Stamp: handleGetStampIDIntent");
	response.tell(speechOutput, repromptOutput, cardTitle, cardContent);

}

function getStampData(stampID, eventCallback) {
	console.log("in getStampData");

	console.log("stampID = [" + stampID + "]");
	var urlColnect = "api.colnect.net";
	var urlStampID = '/en/api/V48jkda0/item/cat/stamps/producer/95074/id/'
			+ stampID

	var request_options = {
		host : urlColnect,
		headers : {
			'User-Agent' : 'Mozilla/5.0'
		},
		path : urlStampID
	};

	http.get(request_options, function(res) {
		var body = '';

		res.on('data', function(chunk) {
			body += chunk;
		});

		res.on('end', function() {
			// var stringResult = parseStampValueTopicPage(body, url);
			console.log("getStamp body = " + body);
			eventCallback(JSON.parse(body));

		});
	}).on('error', function(e) {
		console.log("Got error: ", e);
	});
}

function getStampValueTopic(value, topic, eventCallback) {

	console.log("in getStampValueTopic");
	console.log('value and topic = ' + value + " " + topic);

	var urlColnect = "api.colnect.net";
	var urlStampLlst = '/en/api/V48jkda0/list/cat/stamps/format/1/country/2669/currency/240/'; // US
	// cents

	http:
	// api.colnect.net/en/api/V48jkda0/list/cat/stamps/country/2669/currency/240/face_value/20/name/cog

	var ColnectValueTopicPath = urlStampLlst + 'face_value/' + value + '/name/'
			+ topic;

	// console.log("valueTopicPath = " + valueTopicPath);

	// var aragoSearchPath = '/search?q=' + value + 'c+' + topic\ +
	// '+single++site:arago.si.edu';

	console.log('ColnectValueTopicPath = ' + ColnectValueTopicPath);

	var request_options = {
		host : urlColnect,
		headers : {
			'User-Agent' : 'Mozilla/5.0'
		},
		path : ColnectValueTopicPath
	};

	http.get(request_options, function(res) {
		var body = '';

		res.on('data', function(chunk) {
			body += chunk;
			// console.log("body1 = " + body);
		});
		// console.log("body2 = " + body);
		res.on('end', function() {
			console.log("body3 = " + body);

			// var stringResult = parseStampValueTopic(JSON.parse(body));
			// TODO: handle no item found (length = 0) try calling series next.

			var jsonResult = JSON.parse(body);
			console.log('getStampValueTopic returning: ' + jsonResult)
			eventCallback(jsonResult);
		});
	}).on('error', function(e) {
		console.log("Got error: ", e);
	});
}

function handleGetStampCountryHistoryIntentRequest(intent, session, response) {
	var countrySlot = intent.slots.country;

	var sessionAttributes = {};
	var repromptText = "I did not hear you. what?";
	var speechText = "";
	var cardTitle = "Postal History";
	var cardContent = "";

	var GLOSSARY = require('./glossery.json');
	var fs = require('fs');

	console.log(" countrySlot.value = " + countrySlot.value);

	// replace all the whitespace of the spelt out word
	var country = countrySlot.value;
	// words = words.replace(/ /g, '');
	// words = words.replace(/\./g, '');

	// term = term.charAt(0).toUpperCase() + term.slice(1);
	if (country) {
		// term = term.toLowerCase(); // glossary.json is all in lowercase.
		console.log(" country = " + country);
		wikiPageUrl = wikiUrl + country;
		getJsonHistoryWikipedia(wikiPageUrl, function(historyTextArray) {
			var text = historyTextArray.pop();

			session.attributes.historyArray = historyTextArray;
			response.tell(text);
			// console.log("historyText = " + historyText);

		}); // end getJsonHistoryWikipedia
	}// end country
};

function getJsonHistoryWikipedia(wikiPageUrl, eventCallback) {

	console.log("wikiPageUrl = " + wikiPageUrl);
	https.get(wikiPageUrl, function(res) {
		var body = '';

		res.on('data', function(chunk) {
			body += chunk;
		});

		res.on('end', function() {
			var arrayResult = parseJsonHistory(body);
			eventCallback(arrayResult);

		});
	}).on('error', function(e) {
		console.log("Got error: ", e);
	});
}// 3

function parseJsonHistory(inputText) {

	var returnText = "";

	var retArr = [], retString = "", endIndex, startIndex = 0;
	var delimiter = "\\n\\n\\n";
	var delimiterSize = 6;
	var text = inputText.substring(inputText.indexOf("extract") + 10);
	var startIndex = 0;
	if (text.length == 0) {
		return "";
	}

	// startIndex = endIndex + delimiterSize;
	// inputText = inputText.replace(/<(?:.|\n)*?>/gm, '') // Remove HTML

	// endIndex = text.indexOf(delimiter, startIndex + delimiterSize);
	// var eventText = (endIndex == -1 ? text.substring(startIndex) :
	// text.substring(startIndex, endIndex));

	// var text = inputText.substring(inputText.indexOf("extract") + 10,
	// inputText.indexOf("\\n\\n"));

	while (true) {
		endIndex = text.indexOf(delimiter, startIndex + delimiterSize);
		var eventText = (endIndex == -1 ? text.substring(startIndex) : text
				.substring(startIndex, endIndex));

		// replace dashes returned in text from API
		eventText = eventText.replace(/\\n\\n\s*/g, '. ');
		eventText = eventText.replace(/\\n\s*/g, '. ');
		eventText = eventText.replace(/\\u2013\s*/g, '');
		eventText = eventText.replace(/\\u201d\s*/g, '');
		eventText = eventText.replace(/\\u201c\s*/g, '');
		eventText = eventText.replace(/\\u2018\s*/g, '');
		eventText = eventText.replace(/\\u201A\s*/g, '');
		eventText = eventText.replace(/\\u201B\s*/g, '');
		eventText = eventText.replace(/\\u2032\s*/g, '');
		eventText = eventText.replace(/\\u2035\s*/g, '');
		eventText = eventText.replace(/\\u005c\s*/g, '');
		eventText = eventText.replace(/[^\.\w\s]/gi, '')

		startIndex = endIndex + delimiterSize;
		retArr.push(eventText);
		// returnText = returnText + " " + eventText;
		console.log("eventText = " + eventText);
		if (endIndex == -1) {
			break;
		}
	}
	retArr.reverse();
	return retArr;
}// 5

function handleStoreUsernameIntentRequest(intent, session, response) {

	// set my colnect username to {username}
	// set username to to {username}

	console.log("in handleGetStampUsernameIntentRequest");
	var usernameSlot = intent.slots.username;
	var username;
	var repromptText = "What is your username? ";
	var sessionAttributes = {};

	var cardContent = "";
	var cardTitle = "username ";

	if (usernameSlot) {
		username = usernameSlot.value;
	}

	username = username.replace(/ /g, ''); // collaspe all whitespace

	getUsernameRatings(
			// Colnect collector
			username,
			function(jsonResult) {
				console.log('jsonResult: ' + jsonResult);
				var count = Object.keys(jsonResult).length;
				console.log('count = ' + count);

				// if username comes back with data then we have it
				if (count < 1) {

					response
							.tell("sorry, I could not find that user. Try setting the name again and spell slowly.");
				} else {
					// Save to session
					// Save to DB
					session.attributes.colnectid = username;
					response.tell("Thank you. Your username as been saved.");

				}
			})

}

function getUsernameRatings(username, eventCallback) {

	console.log("in getStampValueTopic");
	console.log("username =" + username);

	var urlColnect = "api.colnect.net";
	var urlCollectRatingsPath = '/en/api/V48jkda0/ratings_count/collector/'
			+ username;
	var jsonResult;

	// console.log("valueTopicPath = " + valueTopicPath);

	// var aragoSearchPath = '/search?q=' + value + 'c+' + topic\ +
	// '+single++site:arago.si.edu';

	console.log('urlCollectRatingsPath = ' + urlCollectRatingsPath);

	var request_options = {
		host : urlColnect,
		headers : {
			'User-Agent' : 'Mozilla/5.0'
		},
		path : urlCollectRatingsPath
	};

	http.get(request_options, function(res) {
		var body = '';

		res.on('data', function(chunk) {
			body += chunk;
			// console.log("body1 = " + body);
		});
		console.log("body2 = " + body);
		res.on('end', function() {
			console.log("body3 = " + body);

			// var stringResult = parseStampValueTopic(JSON.parse(body));
			// TODO: handle no item found (length = 0) try calling series next.
			var notMemeberStr = "not on Colnect";
			if (body.indexOf(notMemeberStr) > -1) {
				console.log("user not on Colnect. ");
				jsonResult = "";
			} else {
				jsonResult = JSON.parse(body);

			}
			console.log('getStampValueTopic returning: ' + jsonResult)
			eventCallback(jsonResult);
		});
	}).on('error', function(e) {
		console.log("Got error: ", e);
	});
}

function handleRandomTermIntentRequest(intent, session, response) {
	var sessionAttributes = {};
	var repromptText = "I did not hear you. what?";
	var speechText = "";
	var cardTitle = "Random Stamp Term";
	var cardContent = "";
	var month = "";
	var GLOSSARY = require('./glossery.json');
	var fs = require('fs');
	var glossary = JSON.parse(fs.readFileSync('./glossery.json', 'utf8'));

	var rndNum = Math.floor(Math.random() * Object.keys(glossary).length);
	
	console.log ("Object.keys(glossary).length  = " + Object.keys(glossary).length);

	console.log(" rndNum = " + rndNum);
	
	var terms = Object.keys(glossary)[rndNum];
	
	console.log(" terms = " + terms);
	
 
	

	speechText = speechText + "According to linns.com, " + terms + " is "
			+ glossary[terms].def;

	// for (i = 0; i < ids.countries.length; i++) {
	// speechText = speechText + ids.countries[i];
	// speechText = speechText + ids.countries[;
	// }
	var speechOutput = {
		speech : "<speak>" + speechText + "</speak>",
		type : AlexaSkill.speechOutputType.SSML
	};
	var repromptOutput = {
		speech : repromptText,
		type : AlexaSkill.speechOutputType.PLAIN_TEXT
	};

	session.attributes = sessionAttributes;

	cardContent = speechOutput + "\n  Link: http://www.linns.com/insights/glossary-of-philatelic-terms.html.html";
	console.log(" Stamp: handleGetStampIDIntent");
	response.tell(speechOutput, repromptOutput, cardTitle, cardContent);

} // end handleRandomTermIntentRequest

// NO LONGER USED
/*******************************************************************************
 * function parseStampValueTopic(inputText) { console.log('in
 * parseStampValueTopic'); // inputText = inputText.replace(/<(?:.|\n)*?>/gm,
 * '') // Remove HTML console.log('inputText' + inputText);
 * 
 * var count = Object.keys(inputText).length; console.log('json size = ' +
 * count);
 * 
 * if (count < 1) { RetText = "I did not find any matches. Try chaging the
 * topic." } else {
 * 
 * RetText = inputText; } // retArr.push(RetText);
 * 
 * return RetText; } // NO LONGER USED? function
 * parseStampValueTopicPage(inputText, url) { // inputText = inputText.replace(/<(?:.|\n)*?>/gm,
 * '') // Remove HTML // console.log('inputText = ' + inputText); DateIndex =
 * inputText.indexOf("Date:");
 * 
 * var RetText = inputText.substring(DateIndex + 31, DateIndex + 111);
 * console.log("RetText = " + RetText); RetText = RetText.substring(0,
 * RetText.indexOf('</div>'));
 * 
 * if (RetText.length > 0) { RetText = 'That stamp was issued on ' + RetText; //
 * retArr.push(RetText); // now get the page
 * 
 * return RetText }
 * 
 * RetText = 'Hmmm... there was some problem contacting my source colnet.'; //
 * retArr.push(RetText);
 * 
 * return RetText; }
 * 
 ******************************************************************************/

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

/*******************************************************************************
 * Amazon test event { "session": { "sessionId":
 * "SessionId.2899baf0-ea1e-4307-a3e8-b25198ffc0d1", "application": {
 * "applicationId": "amzn1.ask.skill.5def441f-b36d-4f44-a8d7-f3c1a4837e17" },
 * "attributes": {}, "user": { "userId":
 * "amzn1.ask.account.AHZY6MGVWZO6MKAUU7NWANJYKTCMNUPZLOM6645GY3N6Z42XJI4E2EVWEJVVIS4ZKPA3KE4X4AU5F45MKYGKP5GDVT6PG3E4Z4G5BT3FBIQUJA7FPHHD6TY4LYGCQYMF42ZBNWZ255U4SLFB4TXLIACVKFDTH7DRKAZQVQMCKJTPMSDYXE4ILWWFHUSBF6ZWPILDGELBLGGFZMA" },
 * "new": false }, "request": { "type": "IntentRequest", "requestId":
 * "EdwRequestId.09bbbac1-6ee3-4aef-8bea-41bfef5ae89b", "locale": "en-US",
 * "timestamp": "2017-07-03T13:30:34Z", "intent": { "name": "getStampValue",
 * "slots": { "value": { "name": "value", "value": "7.4" }, "topic": { "topic":
 * "topic", "value": "baby" } } } }, "version": "1.0" }
 * 
 ******************************************************************************/
