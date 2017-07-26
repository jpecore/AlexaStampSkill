/**
 * Stamp Collector Alexa skill
 * 
 * Copyright 2017 Joe Pecore
 * 
 * https://github.com/jpecore/AlexaStampSkill
 * 
 */
// App ID for the skill
var APP_ID = 'amzn1.ask.skill.5def441f-b36d-4f44-a8d7-f3c1a4837e17'; // Stamp
//
// REQUIRES
var AlexaSkill = require('./AlexaSkill');
var Alexa = require("alexa-sdk");

 



var https = require('https');
var http = require('http');

var CONFIG = require("./config.json");
var ColnectCOUNTRIES = require("./countries.json");
var ColnectCURRENCIES = require("./currencies.json");
var GLOSSARY = require('./glossery.json');
var ISWSC = require('./iswsc.json');
/* config variables */
var COLNECT_API_KEY = CONFIG.Colnect.APIkey.key;
// URLs
var URL_COLNECT_API = "api.colnect.net";
var FACEVALUE_PATH = "/en/api/" + COLNECT_API_KEY + "/face_values/cat/stamps/country/"; // +
var WIKI_HISTORY_URL = "https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exlimit=1&format=json&explaintext=&exsectionformat=plain&redirects=&titles=Postage_stamps_and_postal_history_of_";
var NEWS_FEEDS = 'http://www.stampnews.com/feed';
var NONE_STAMP = 'https://s3.amazonaws.com/pecore/none-stamps.jpg';
// CONSTANTS
var US_COLNET_COUNTRYID = 2669; // USA
var UK_COLNET_COUNTRYID = 2611 // Great Britain
// Persistance
var storage = require("./storage");
 // var dynasty = require("dynasty")({});
 // var stampSkillTable = dynasty.table('stampSkill');
// var dynamoDBTableName = 'stampSkill';
// inherits AlexaSkill
var StampSkill = function() {
    AlexaSkill.call(this, APP_ID);
};
// Extend AlexaSkill
StampSkill.prototype = Object.create(AlexaSkill.prototype);
StampSkill.prototype.constructor = StampSkill;
StampSkill.prototype.eventHandlers.onSessionStarted = function(sessionStartedRequest, session) {
     console.log("StampSkill onSessionStarted requestId: " +
    sessionStartedRequest.requestId + ", sessionId: "
     + session.sessionId + " userId: " + session.user.userId);
    
  //   storage.getUsername(session, (u) => { 	 
//	 session.attributes.username = u; 
//	 console.log(" session.attributes.username = " + session.attributes.username);
 //    }); 
    
};
/* onLaunch */
StampSkill.prototype.eventHandlers.onLaunch = function(launchRequest, session, response) {
    console.log("StampSkill onLaunch");
  //  conosole..og("requestId: " + launchRequest.requestId + ", sessionId: " + session.sessionId);
    // console.log ("ColnectCURRENCIES[1] = " + ColnectCURRENCIES[1] );
    getWelcomeResponse(session,response);
};
/* onSessionEnded */
StampSkill.prototype.eventHandlers.onSessionEnded = function(sessionEndedRequest, session) {
    //console.log("onSessionEnded requestId: " + sessionEndedRequest.requestId + ", sessionId: " + session.sessionId);
    console.log("onSessionEnded requestId: " + sessionEndedRequest.requestId) ;
     // any session cleanup logic would go here
};
/* intents */
StampSkill.prototype.intentHandlers = {
    "AMAZON.HelpIntent" : function(intent, session, response) {
	var speechText = "<p>Stamp Collector can help you do many things.</p>"
		+ "<p>To get the defintion of a stamp term, say something like: What is Perforation?</p>"
		+ "<p>To try and identify which country a stamp is from, spell some of the words like:  </p> "
		+ "<p>What country has the letters c. t. o. c." + "Which command would you like to try?</p> "
		+ "<p>See the Alexa App card for some moe examples.</p> ";
	var repromptText = "I did not understand you. Did you try spelling the words on the stamp? What words are on the stamp?";
	var cardTitle = "Help examples"
	var cardContent = "Example find stamp command. \n"
		+ "* Provide the face value, with no denomination, the name of the stamp and the country:\n"
		+ "Find stamp with face value four  and name Arizona  from United States \n"
		+ "* If you leave off the country, it will default to the U.S.:\n"
		+ "Find stamp with face value four  and name Arizona  \n" + "* You can use the shortcut:\n"
		+ "Find face value four  name Arizona  \n";
	var speechOutput = {
	    speech : speechText,
	    type : AlexaSkill.speechOutputType.SSML
	};
	var repromptOutput = {
	    speech : repromptText,
	    type : AlexaSkill.speechOutputType.PLAIN_TEXT
	};
	// response.ask(speechOutput, repromptOutput);
	response.askWithCard(speechOutput, repromptText, cardTitle, cardContent);
    },
    "AMAZON.StopIntent" : function(intent, session, response) {
	var speechText = "Hope to see you again soon. Happy collecting!"
	if (Math.random() > .75) {
	    speechText = "<p>See the free colnect.com to help manage your stamp collection.</p>" + speechText;
	}
	var speechOutput = {
	    speech : speechText,
	    type : AlexaSkill.speechOutputType.SSML
	};
	response.tell(speechOutput);
    },
    "AMAZON.CancelIntent" : function(intent, session, response) {
	var speechOutput = {
	    speech : "Cancelled. Happy collecting!",
	    type : AlexaSkill.speechOutputType.PLAIN_TEXT
	};
	response.tell(speechOutput);
    },
    "stampIntent" : function(intent, session, response) {
//	console.log("stampIntent   requestId: " + ", sessionId: " + session.sessionId);
	console.log("stampIntent");
	getWelcomeResponse(session,response);
    },
    "GetStampIDIntent" : function(intent, session, response) {
	//console.log("GetStampIDIntent   requestId: " + session.application.applicationId + ", sessionId: "
	//	+ session.sessionId + "consentToken: ");
	handleGetStampIDIntent(intent, session, response);
    },
    "StampFindIntent" : function(intent, session, response) {
	handleStampFindIntentRequest(intent, session, response);
    },
    "GetStampTermIntent" : function(intent, session, response) {
	handleGetStampTermIntentRequest(intent, session, response);
    },
    "GetStampCountryHistoryIntent" : function(intent, session, response) {
	handleGetStampCountryHistoryIntentRequest(intent, session, response);
    },
    "RandomTermIntent" : function(intent, session, response) {
	handleRandomTermIntentRequest(intent, session, response);
    },
    "NextStampIntent" : function(intent, session, response) {
	handleNextStampIntentRequest(intent, session, response);
    },
    "PrevStampIntent" : function(intent, session, response) {
	handlePrevStampIntentRequest(intent, session, response);
    },
    // Not yet used or will never be used when published.
    "PrintSomethingIntent" : function(intent, session, response) {
	handlePrintSomethingIntentRequest(intent, session, response);
    },
    "CountriesNeededIntent" : function(intent, session, response) {
	handleCountriesNeededIntentRequest(intent, session, response);
    },
    "haveCountryIntent" : function(intent, session, response) {
	handleHaveCountryIntentRequest(intent, session, response);
    },
    "saveUsernameIntent" : function(intent, session, response) {
	handleSaveUsernameIntentRequest(intent, session, response);
    },
    "GetUsernameIntent" : function(intent, session, response) {
	handleGetUsernameIntentRequest(intent, session, response);
    },
    "News" : function(intent, session, response) {
	handleNewsIntentRequest(intent, session, response);
    }
};
//
//
function getWelcomeResponse(session,response) {
    // the "Open Stamp Collector" request
    // Initialize the session to have some attributes here.
    

	 
    var repromptText = "I did not understand. What did you say?";
    var speechText = "<p>Welcome to the Stamp Collector skill, "
	    + "which can assit in defining terms, identifying stamps and finding stamp information." + ""
	    + "Say Help for more information.</p>" + "<p>How can I assist you today?</p>";
    var speechOutput = {
	speech : "<speak>" + speechText + "</speak>",
	type : AlexaSkill.speechOutputType.SSML
    };
    var repromptOutput = {
	speech : repromptText,
	type : AlexaSkill.speechOutputType.PLAIN_TEXT
    };
    response.ask(speechOutput, repromptOutput);
} // end getWelcomeResponse
//
//
//
function handleGetStampIDIntent(intent, session, response) {
    session.attributes.currentCommand = 'ID';
    var lettersSlot = intent.slots.letters;
    var repromptText = "I did not hear you. what?";
    var speechText = "";
    var cardTitle = "Stamp Identification";
    var cardContent = "";
    var words = "";
    console.log(" lettersSlot.value = " + lettersSlot.value);
    // replace all the whitespace of the spelt out word
    if (lettersSlot.value) {
	words = lettersSlot.value.toUpperCase();
    }
    ;
    // clean up
    words = words.replace(/ /g, '');
    words = words.replace(/\./g, '');
    var ids = ISWSC[words];
    // console.log(" ids = " + ids);
    if (ids) {
	speechText = speechText + "<p>According to the I S W S C Stamp Identifier, possible matches are: </p>";
	if (ids.countries) {
	    speechText = speechText + "<p>" + ids.countries + "</p>";
	}
	speechText = speechText + "<p>Try another command, or say help or stop.</p>";
    } else {
	speechText = "<p>Sorry, I could not find country with stamps that have those letters on it.</p> "
		+ "<p>Try again with different letters,  or say help or stop.</p>"
    }
    speechText = speechText + "<p>How else can I assist you?</p>";
    // TODO: link to Colnet Country
    // cardContent = speechOutput + "" (link to Colnet Country page coming soon)
    var speechOutput = {
	speech : "<speak>" + speechText + "</speak>",
	type : AlexaSkill.speechOutputType.SSML
    };
    var repromptOutput = {
	speech : repromptText,
	type : AlexaSkill.speechOutputType.PLAIN_TEXT
    };
    response.ask(speechOutput, repromptOutput);
    // response.tell(speechOutput, repromptOutput, cardTitle, cardContent);
} // end handleGetStampIDIntent
//
//
//
function stampDataFormatted(StampID, eventCallback) {
    var speechText, cardTitle, cardText;
    getStampData(
	    StampID,
	    function(stampData) {
		var speechText = "", i;
		// sessionAttributes.text = stampData;
		// console.log("stampData = " + stampData);
		// console.log("stampData[4] = " + stampData[4].substring(0,
		// 4));
		// SPEECH TEXT
		speechText = "The " + stampData[13] + " " + stampData[12].substring(0, 1) + " " + stampData[0]
			+ "  stamp was issued in " + stampData[4].substring(0, 4);
		speechText += " from " + stampData[2] + " ";
		if (stampData[6]) {
		    speechText = speechText + " with a print run of " + numberWithCommas(stampData[6]) + ".";
		}
		if (stampData[26]) {
		    speechText = speechText + "The colnect description says: " + stampData[26] + ".";
		}
		// CARD LAYOUT
		// Colnect fields
		// 0 ["Name","Country","Series","Catalog Codes","Issued on"
		// 5 "Expiry date","Print run","Variant","FrontPicture",
		// 9 "BackPicture","Score","Accuracy","Currency","FaceValue",
		// 14 "Format", "Emission","Perforation","Printing","Gum",
		// 19 "Paper" "Watermark","Width", "Height","Colors",
		// 24 "Name En","Tags" "Description"]
		//
		// none-image https://s3.amazonaws.com/pecore/none-stamps.jpg
		if (stampData[1]) {
		    cardText = cardText + "Country: " + stampData[1] + "\n";
		}
		if (stampData[12]) {
		    cardText = "Series: " + stampData[2] + "\n";
		}
		if (stampData[3]) {
		    cardText = cardText + "Catalog Codes: " + stampData[3] + "\n";
		}
		// TODO handle THEME codes
		/*
		 * if (stampData[25]) { cardText = cardText + "Themes: " +
		 * stampData[25] + "\n"; }
		 */
		if (stampData[4]) {
		    cardText = cardText + "Issued on: " + stampData[4] + "\n";
		}
		if (stampData[14]) {
		    cardText = cardText + "Format: " + stampData[14] + "\n";
		}
		if (stampData[15]) {
		    cardText = cardText + "Emission: " + stampData[15] + "\n";
		}
		if (stampData[17]) {
		    cardText = cardText + "Printing: " + stampData[17] + "\n";
		}
		// Handle COLORS (codes)
		if (stampData[16]) {
		    cardText = cardText + "Perforation: " + removeHTML(stampData[16]) + "\n";
		}
		if (stampData[21]) {
		    cardText = cardText + "Size: " + stampData[21] + "x" + stampData[22] + "\n";
		}
		if (stampData[13]) {
		    cardText = cardText + "Face value: " + stampData[13];
		    if (stampData[12]) {
			// console.log(' stampData[12] ' + stampData[12])
			cardText = cardText + " " + stampData[12].substring(0, stampData[12].indexOf(' -'));
			/*
			 * var arrFound = ColnectCOUNTRIES.filter(function(item) {
			 * return item[0] == stampData[12]; });
			 * console.log('arrFound' + arrFound);
			 * 
			 * if (arrFound) { console.log('arrFound[0][1]' +
			 * arrFound[0][1]); cardText = cardText + " " +
			 * arrFound[0][1] }
			 */
			cardText = cardText + "\n";
		    }
		}
		if (stampData[6]) {
		    cardText = cardText + "Print run: " + numberWithCommas(stampData[6]) + "\n";
		}
		if (stampData[20]) {
		    cardText = cardText + "Watermak: " + stampData[20] + "\n";
		}
		if (stampData[10]) {
		    cardText = cardText + "Score: " + Math.round(stampData[10]) + "% Accuracy: " + stampData[11] + "\n";
		}
		if (stampData[26]) {
		    cardText = cardText + "Description: " + stampData[26] + "\n";
		}
		cardText = cardText
			+ "Info provided by Colnect.com. For infomation on fields, see http://colnect.com/en/collectors/wiki/title=Stamp \n";
		speechText = speechText + " See the Alexa app card for more information. ";
		cardTitle = stampData[0] + "(" + stampData[4].substr(0, 4) + ", " + stampData[1] + ")";
		eventCallback(speechText, cardTitle, cardText);
	    }); // end getStampData call
}; // end stampData
function requiredField(Slot, speechOutputIfMissing, repromptText, response) {
    if (Slot) {
	if (Slot.value) {
	 //   console.log('Slot.value = ' + Slot.value)
	    return Slot.value;
	}
    }
    return null;
}; // end requiredField
function handleStampFindIntentRequest(intent, session, response) {
    session.attributes.currentCommand = 'Find';
    console.log("in handleStampFindIntentRequest");
    var topicSlot = intent.slots.topic;
    var topic = "";
    var valueSlot = intent.slots.faceValue;
    var countrySlot = intent.slots.country;
    var repromptText = "What would you like to do?";
    var cardContent = "";
    var cardTitle = "Stamp Year ";
    var CountryCode = US_COLNET_COUNTRYID;
    var faceValue;
    var speechOutputForMissingFields = {
	speech : "<speak> You need to provide the face value and the name or topic of the stamp. "
		+ "For example Find stamp with face value three and name Detroit. How can I assit you? </speak>",
	type : AlexaSkill.speechOutputType.SSML
    };
    var speechOutputForUnknownCoutry = {
	speech : "<speak>I could not find that country in Colnet.com. How can I assit you? </speak>",
	type : AlexaSkill.speechOutputType.SSML
    };
    var repromptOutput = {
	speech : repromptText,
	type : AlexaSkill.speechOutputType.PLAIN_TEXT
    };
    //
    faceValue = requiredField(valueSlot);
    if (faceValue) {
	// we have one
    } else {
	response.ask(speechOutputForMissingFields, repromptText);
	return;
    }
    ;
    topic = requiredField(topicSlot);
    // make URL acccessable
    if (topic) {
	topic = topic.replace(/ /gm, '+');
    } else {
	response.ask(speechOutputForMissingFields, repromptText);
	return;
    }
    ;
    console.log('topic = ' + topic);
    if (countrySlot) {
	if (countrySlot.value) {
	    if (isUSA(countrySlot)) {
		// let default to usa
	    } else if (isUK(countrySlot)) {
		CountryCode = UK_COLNET_COUNTRYID;
		console.log('CountryCode = ' + CountryCode);
	    } else {
		var arrFound = ColnectCOUNTRIES.filter(function(item) {
		    return item[1] == countrySlot.value;
		});
		if (arrFound) {
		    if (arrFound[0]) {
			CountryCode = arrFound[0][0];
		    } else {
			response.ask(speechOutputForUnknownCoutry, repromptText);
			return;
		    }
		} else {
		    response.ask(speechOutputForUnknownCoutry, repromptText);
		    return;
		}
	    }
	}
    }
    // console.log('CountryCode = ' + CountryCode);
    // var smallImageUrl =
    // 'https://upload.wikimedia.org/wikipedia/commons/1/16/Modry_mauritius.jpg',
    // largeImageUrl =
    // 'https://upload.wikimedia.org/wikipedia/commons/1/16/Modry_mauritius.jpg'
    getStampValueTopic(
	    valueSlot.value,
	    topic,
	    CountryCode,
	    function(jsonResult) {
		// console.log('jsonResult: ' + jsonResult);
		var smallImageURL = 'https://s3.amazonaws.com/pecore/none-stamps.jpg';
		var count = Object.keys(jsonResult).length;
		// console.log('getStampValueTopic count = ' + count);
		session.attributes.stampsFound = jsonResult;
		session.attributes.stampIndex = 0;
		switch (Object.keys(jsonResult).length) {
		case 0: // no stamp found
		    speechText = "sorry, I could not find that stamp. Try again with a different topic.";
		    var speechOutput = {
			speech : "<speak>" + speechText + "</speak>",
			type : AlexaSkill.speechOutputType.SSML
		    };
		    var repromptOutput = {
			speech : repromptText,
			type : AlexaSkill.speechOutputType.PLAIN_TEXT
		    };
		    response.ask(speechOutput, repromptText);
		    break;
		case 1: // only 1 found
		    var firstMatch = jsonResult[Object.keys(jsonResult)[0]];
		    var StampID = firstMatch[Object.keys(firstMatch)[0]]
		    // console.log(' StampID =' + StampID);
		 
		    stampDataFormatted(StampID, function(speechText, cardTitle, cardContent) {
			// cardContent = speechText;
			// cardTitle = stampData[0];
			var speechOutput = {
			    speech : "<speak>" + speechText + "</speak>",
			    type : AlexaSkill.speechOutputType.SSML
			};
			var repromptOutput = {
			    speech : repromptText,
			    type : AlexaSkill.speechOutputType.PLAIN_TEXT
			};
			
			//console.log("creating card with picture");
			response.askWithPictureCard(speechOutput, repromptText, cardTitle, cardContent, smallImageURL, smallImageURL);

	              // response.askWithCard(speechOutput, repromptText,
			// cardTitle, cardContent);
		    })
		    break;
		default: // more then one found
		    var firstMatch = jsonResult[Object.keys(jsonResult)[0]];
		    var StampID = firstMatch[Object.keys(firstMatch)[0]]
		    var speechText;
		    // console.log(' StampID =' + StampID);
		    stampDataFormatted(
			    StampID,
			    function(speechText, cardTitle, cardContent) {
				speechText = "Colnect.com found " + jsonResult.length + " stamps. The first one is "
					+ speechText;
				speechText = speechText
					+ "\n"
					+ " To hear another say  Next. To end say Stop. To find a different stamp use Find stamp. What would you like to do next?";
				var speechOutput = {
				    speech : "<speak>" + speechText + "</speak>",
				    type : AlexaSkill.speechOutputType.SSML
				};
				var repromptOutput = {
				    speech : repromptText,
				    type : AlexaSkill.speechOutputType.PLAIN_TEXT
				};
				response.askWithPictureCard(speechOutput, repromptText, cardTitle, cardContent, smallImageURL, smallImageURL);

				// response.askWithCard(speechOutput,
				// repromptText, cardTitle, cardContent);
			    })
		    break;
		}
	    })
}// end handleStampFindIntentRequest
function isUSA(countrySlot) {
    return countrySlot.value == "US" || countrySlot.value == "USA" || countrySlot.value == "us"
	    || countrySlot.value == "u s" || countrySlot.value == "United States"
	    || countrySlot.value == "United States of America";
}; // end isUSA
function isUK(countrySlot) {
    return countrySlot.value == "UK" || countrySlot.value == "United Kingdom" || countrySlot.value == "GB"
	    || countrySlot.value == "Great Britain";
}; // end isUK
//
function handleGetStampTermIntentRequest(intent, session, response) {
    session.attributes.currentCommand = 'Term';
    
    console.log(" session.attributes.username = " + session.attributes.username);
  	 
	 var termSlot = intent.slots.term;
	    var repromptText = "I did not hear you. what?";
	    var speechText = "";
	    var cardTitle = "Stamp Term";
	    var cardContent = "";
	    // var fs = require('fs');
	    console.log(" termSlot.value = " + termSlot.value);
	    // replace all the whitespace of the spelt out word
	    var term = termSlot.value;
	    if (term) {
		term = term.toLowerCase(); // glossary.json is all in lowercase.
		var terms = GLOSSARY[term];
		// console.log(" terms = " + terms);
		if (terms) {
		    if (terms.def) {
			speechText = speechText + "According to linns.com, " + term + " is " + terms.def;
		    }
		} else {
		    speechText = "Sorry, I could not find the term: " + term + ".";
		}
	    } else {
		speechText = "Sorry, I did not hear a term. "
	    }
	    speechText = speechText + "<p>How can I assit you again?</p>";
	    var speechOutput = {
		speech : "<speak>" + speechText + "</speak>",
		type : AlexaSkill.speechOutputType.SSML
	    };
	    var repromptOutput = {
		speech : repromptText,
		type : AlexaSkill.speechOutputType.PLAIN_TEXT
	    };
	    // TODO create card with link to term
	    response.ask(speechOutput, repromptOutput);
 
    
    
   
}; // end handleGetStampTermIntentRequest
function getStampData(stampID, eventCallback) {
    console.log("in getStampData");
    // console.log("stampID = [" + stampID + "]");
    var urlStampID = '/en/api/' + COLNECT_API_KEY + '/item/cat/stamps/id/' + stampID
  console.log('urlStampID = ' + urlStampID)
    var request_options = {
	host : URL_COLNECT_API,
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
	    // console.log("getStamp body = " + body);
	    eventCallback(JSON.parse(body));
	});
    }).on('error', function(e) {
	console.log("Got error: ", e);
    });
}; // end getStampData
function getStampValueTopic(value, topic, CountryCode, eventCallback) {
    console.log("in getStampValueTopic");
    // console.log('value and topic = ' + value + " " + topic);
    var urlStampLlst = '/en/api/' + COLNECT_API_KEY + '/list/cat/stamps/format/1/country/' + CountryCode;
    // console.log("urlStampLlst = " + urlStampLlst);
    // cents
    // http:
    // // api.colnect.net/en/api/
    // /list/cat/stamps/country/2669/currency/240/face_value/20/name/cog
    
    /// !!!!!
    // Get the ID for face_value based on country !!!!
    // !!!!
    var faceValuesCountryURL = FACEVALUE_PATH + CountryCode;
   // console.log("faceValuesCountryURL = " + faceValuesCountryURL);
    var faceValuesjson;
    var request_options = {
	host : URL_COLNECT_API,
	headers : {
	    'User-Agent' : 'Mozilla/5.0'
	},
	path : faceValuesCountryURL
    };
    http.get(request_options, function(res) {
	var body = '';
	res.on('data', function(chunk) {
	    body += chunk;
	});
	// console.log("body2 = " + body);
	res.on('end', function() {
	    // console.log("body faceFalue = " + body);
	    // var stringResult =
	    // parseStampValueTopic(JSON.parse(body));
	    // TODO: handle no item found
	    // (length = 0) try calling series
	    // next.
	    var faceValuesjson = "";
	    if (body.indexOf("404 Not Found") > -1) {
		 eventCallback("");
	    } else {
		faceValuesjson = JSON.parse(body);
	    }
	    // console.log("faceValuesjson = " + faceValuesjson);
	    var face_value_id;
	    var arrFound = faceValuesjson.filter(function(item) {
		return item[1] == value;
	    });
	    // console.log('arrFound' + arrFound);
	    if (arrFound) {
		if (arrFound[0]) {
		    // console.log('arrFou nd[0][1]' + arrFound[0][0]);
		    face_value_id = arrFound[0][0];
		}
	    }
	    // find stamp with face_value and
	    // topic
	    
	    if (typeof  face_value_id   == "undefined") {		
		 eventCallback(""); 
		 return;
	    }
	    	    
	    var ColnectValueTopicPath = urlStampLlst + '/face_value/' + face_value_id + '/name/' + topic;
	    console.log('ColnectValueTopicPath = ' + ColnectValueTopicPath)
	    var request_options = {
		host : URL_COLNECT_API,
		headers : {
		    'User-Agent' : 'Mozilla/5.0'
		},
		path : ColnectValueTopicPath
	    };
	    http.get(request_options, function(res) {
		var body = '';
		res.on('data', function(chunk) {
		    body += chunk;
		});
		res.on('end', function() {
		    // console.log("body3 = " + body);
		    var jsonResult = "";
		    if (body.indexOf("404 Not Found") > -1) {
			jsonResult = "";
		    } else {
			jsonResult = JSON.parse(body);
		    }
		    eventCallback(jsonResult);
		    // console.log ('returning this json from getStampValueTopic
		    // ' + jsonResult)
		});
	    }).on('error', function(e) {
		console.log("Got error: ", e);
	    });
	});
    }).on('error', function(e) {
	console.log("Got error: ", e);
    });
}; // end getStampValueTopic
function handleGetStampCountryHistoryIntentRequest(intent, session, response) {
    session.attributes.currentCommand = 'CountryHistory';
    var countrySlot = intent.slots.country;
    var repromptText = "I did not hear you. what?";
    var speechText = "";
    var cardTitle = "Postal History";
    var cardContent = "";
    // var GLOSSARY = require('./glossery.json');
    // var fs = require('fs');
    // console.log(" countrySlot.value = " + countrySlot.value);
    // replace all the whitespace of the spelt out word
    var country = countrySlot.value;
    // words = words.replace(/ /g, '');
    // words = words.replace(/\./g, '');
    // term = term.charAt(0).toUpperCase() + term.slice(1);
    if (country) {
	// term = term.toLowerCase(); // glossary.json is all in lowercase.
	// console.log(" country = " + country);
	wikiPageUrl = WIKI_HISTORY_URL + country;
	getJsonHistoryWikipedia(wikiPageUrl, function(historyTextArray) {
	    var text = historyTextArray.pop();
	    session.attributes.historyArray = historyTextArray;
	    // TODO: use ask
	    // TODO handle paging / more
	    response.ask(text);
	    // console.log("historyText = " + historyText);
	}); // end getJsonHistoryWikipedia
    } // end country
    // TOTO: need better instructions.
    response.ask("Please provide a country. What country do you want?");
}; // end handleGetStampCountryHistoryIntentRequest
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
}// end getJsonHistoryWikipedia
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
    while (true) {
	endIndex = text.indexOf(delimiter, startIndex + delimiterSize);
	var eventText = (endIndex == -1 ? text.substring(startIndex) : text.substring(startIndex, endIndex));
	// replace dashes returned in text from API
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
	// console.log("eventText = " + eventText);
	if (endIndex == -1) {
	    break;
	}
    }
    retArr.reverse();
    return retArr;
}; // end parseJsonHistory


function handleSaveUsernameIntentRequest(intent, session, response) {
    console.log("in handleSaveUsernameIntentRequest");
    session.attributes.currentCommand = 'SaveUsername';
    // var username = session.attributes.username;
    var usernameSlot = intent.slots.username;
    var repromptText = "I did not hear you. what?";
    var userName = usernameSlot.value;
    var speechOutput = '';
   /*
     * stampSkillTable().insert({ 'userId' : session.user.userId, 'username' :
     * userName }); // end stampSkillTable
     * 
     */
 
   
 
     console.log (speechOutput);
     storage.saveUsername(userName, session, (u) => { 
	  speechOutput = 'Ok ' + u + ' is saved as your colnect username. '; 
	  var speechOutput = {
			speech : "<speak>" + speechOutput + "</speak>",
			type : AlexaSkill.speechOutputType.SSML
		    };
	     var repromptOutput = {
			speech : repromptText,
			type : AlexaSkill.speechOutputType.PLAIN_TEXT
		    }; 
	  response.ask(speechOutput, repromptText);
   });
      
    
 // response.tell(speechOutput);
}; // end handleSaveUsernameIntentRequest
//
function handleGetUsernameIntentRequest(intent, session, response) {
    // set my colnect username to {username}
    // set username to to {username}
    console.log("in handleGetStampUsernameIntentRequest");
   // usernameSlot = intent.slots.username;
    var username;
    var repromptText = "What is your username? ";
    var cardContent = "";
    var cardTitle = "username ";
    if (usernameSlot) {
	username = usernameSlot.value;
    }
 username = username.replace(/ /g, ''); // collaspe all whitespace
    getUsernameRatings(
    // Colnect collector
    username, function(jsonResult) {
	// console.log('jsonResult: ' + jsonResult);
	var count = Object.keys(jsonResult).length;
	// console.log('count = ' + count);
	// if username comes back with data then we have it
	if (count < 1) {
	    response.tell("sorry, I could not find that user. Try setting the name again and spell slowly.");
	} else {
	    // Save to session
	    // Save to DB
	    session.attributes.colnectid = username;
	    // TODO: change to ask
	    response.tell("Thank you. Your username as been saved.");
	}
    })
}; // end handleStoreUsernameIntentRequest
function getUsernameRatings(username, eventCallback) {
    console.log("in getUsernameRatings");
    console.log("username =" + username);
    var urlCollectRatingsPath = '/en/api/' + COLNECT_API_KEY + '/ratings_count/collector/' + username;
    var jsonResult;
    // console.log("valueTopicPath = " + valueTopicPath);
    // var aragoSearchPath = '/search?q=' + value + 'c+' + topic\ +
    // '+single++site:arago.si.edu';
    // console.log('urlCollectRatingsPath = ' + urlCollectRatingsPath);
    var request_options = {
	host : URL_COLNECT_API,
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
	// console.log("body2 = " + body);
	res.on('end', function() {
	    // console.log("body3 = " + body);
	    // var stringResult = parseStampValueTopic(JSON.parse(body));
	    // TODO: handle no item found (length = 0) try calling series next.
	    var notMemeberStr = "not on Colnect";
	    if (body.indexOf(notMemeberStr) > -1) {
		// console.log("user not on Colnect. ");
		jsonResult = "";
	    } else {
		jsonResult = JSON.parse(body);
	    }
	    // console.log('getStampValueTopic returning: ' + jsonResult)
	    eventCallback(jsonResult);
	});
    }).on('error', function(e) {
	console.log("Got error: ", e);
    });
}; // end getUsernameRatings
function getCAPI(urlPath, eventCallback) {
    console.log("in getCAPI");
    var jsonResult = "";
    console.log('urlPath = ' + urlPath);
    var request_options = {
	host : URL_COLNECT_API,
	headers : {
	    'User-Agent' : 'Mozilla/5.0'
	},
	path : urlPath
    };
    http.get(request_options, function(res) {
	var body = '';
	res.on('data', function(chunk) {
	    body += chunk;
	    // console.log("body1 = " + body);
	});
	// console.log("body2 = " + body);
	res.on('end', function() {
	    // console.log("body3 = " + body);
	    jsonResult = JSON.parse(body);
	    if (jsonResult) {
		jsonResult = JSON.parse(body);
	    }
	    // console.log('jsonResult = ' + jsonResult)
	    eventCallback(jsonResult);
	});
    }).on('error', function(e) {
	console.log("Got error: ", e);
    });
}; // end getCAPI
function handleCountriesNeededIntentRequest(intent, session, response) {
    session.attributes.currentCommand = 'CountriesNeeded';
    console.log("in handleCountriesNeededIntentRequest");
    // var usernameSlot = intent.slots.username;
    var username;
    var repromptText = "What is your username? ";
    var cardContent = "";
    var SpeechContent = "User needs the following counties: ";
    var cardTitle = "username ";
    getCAPI("/en/api/" + COLNECT_API_KEY + "/countries/cat/stamps/collection/jpecore", function(userCountries) {
	// console.log('userCountries: ' + userCountries);
	getCAPI("/en/api/" + COLNECT_API_KEY + "/countries/cat/stamps", function(allCountries) {
	    // console.log('allCountries: ' + allCountries);
	    var countUserCounties = Object.keys(userCountries).length;
	    // console.log('countUserCounties = ' + countUserCounties);
	    var countallCountries = Object.keys(allCountries).length;
	    // console.log('countallCountries = ' + countallCountries);
	    // if username comes back with data then we have it
	    if (countUserCounties < 1) {
		response.tell("sorry, I could not find that user or the user has no collection. "
			+ "Try setting the name again and spell slowly.");
	    } else {
		// loop through allcounties
		var found = 0;
		var allCountriesKeys = Object.keys(allCountries);
		for ( var i = 0, length = allCountriesKeys.length; i < length; i++) {
		    var country = allCountries[allCountriesKeys[i]];
		    var countryID = country[0];
		    // console.log("countryID = " + countryID) ;
		    // and look for that country in the user's
		    // collection
		    var userCountry;
		    var userCountriesKeys = Object.keys(userCountries);
		    for ( var j = 0, length2 = userCountriesKeys.length; j < length2; j++) {
			userCountry = userCountries[userCountriesKeys[j]];
			var userCountryID = userCountry[0];
			if (countryID == userCountryID) {
			    found = 1;
			    break; // they have it;
			}
		    }
		    if (found == 0) {
			SpeechContent = SpeechContent + ", " + country[1]; // + '
			// ' +
			// 'http://colnect.com/en/stamps/list/country/'
			// + country[0];
			// console.log("User needs = "
			// + country[1]);
		    }
		    found = 0;
		}
		// console.log(SpeechContent);
		// TODO change all tell to ask
		response.tell(SpeechContent);
	    }
	})
    })
}; // end handleCountriesNeededIntentRequest
function handlePrintStampThemesIntentRequest(intent, session, response) {
    session.attributes.currentCommand = 'PrintGlossaryTerms';
    console.log('in handlePrintGlossaryTermsIntentRequest');
    var repromptText = "I did not hear you. what?";
    var speechText = "";
    var cardTitle = "handlePrintGlossaryTermsIntentRequest";
    var cardContent = "";
    // console.log('GLOSSARY.length ' + Object.keys(GLOSSARY).length);
    for ( var i = 0; i < 150; i++) {
	speechText = speechText + '/n' + Object.keys(GLOSSARY)[i];
	console.log(Object.keys(GLOSSARY)[i]);
    }
    for ( var i = 150; i < Object.keys(GLOSSARY).length; i++) {
	speechText = speechText + '/n' + Object.keys(GLOSSARY)[i];
	console.log(Object.keys(GLOSSARY)[i]);
    }
    speechText = speechText + "<p>How else can I assit you?</p>"
    var speechOutput = {
	speech : "<speak>" + speechText + "</speak>",
	type : AlexaSkill.speechOutputType.SSML
    };
    var repromptOutput = {
	speech : repromptText,
	type : AlexaSkill.speechOutputType.PLAIN_TEXT
    };
    cardContent = speechOutput + "\n  Link: http://www.linns.com/insights/glossary-of-philatelic-terms.html.html";
    response.askWithCard(speechOutput, repromptOutput, cardTitle, cardContent);
} // end handleRandomTermIntentRequest
function handleRandomTermIntentRequest(intent, session, response) {
    session.attributes.currentCommand = 'RandomTerm';
    var repromptText = "I did not hear you. what?";
    var speechText = "";
    var cardTitle = "Random Stamp Term";
    var cardContent = "";
    var month = "";
    var rndNum = Math.floor(Math.random() * Object.keys(GLOSSARY).length);
    var terms = Object.keys(GLOSSARY)[rndNum];
    speechText = speechText + "From linns.com, " + terms + " is " + GLOSSARY[terms].def;
    speechText = speechText + "<p>How else can I assit you?</p>"
    var speechOutput = {
	speech : "<speak>" + speechText + "</speak>",
	type : AlexaSkill.speechOutputType.SSML
    };
    var repromptOutput = {
	speech : repromptText,
	type : AlexaSkill.speechOutputType.PLAIN_TEXT
    };
    cardContent = speechOutput + "\n  Link: http://www.linns.com/insights/glossary-of-philatelic-terms.html.html";
    response.askWithCard(speechOutput, repromptOutput, cardTitle, cardContent);
} // end handleRandomTermIntentRequest

function handleNextStampIntentRequest(intent, session, response) {
    // TODO make sure in Find command.
    var repromptText = "I did not hear you. what?";
    var speechText, cardTitle, cardText, repromptText;
    var Stamps = session.attributes.stampsFound;
    var nextStamp = Stamps[session.attributes.stampIndex];
    // console.log("session.attributes.stampIndex: " +
    // session.attributes.stampIndex);
    // console.log("Stamps.length: " + Stamps.length);
    if (session.attributes.stampIndex + 1 <= Stamps.length - 1) {
	session.attributes.stampIndex = session.attributes.stampIndex + 1;
	var nextStampId = nextStamp[0];
	stampDataFormatted(nextStampId, function(speechText, cardTitle, cardContent) {
	    // console.log(" Stamps.length = " + Stamps.length);
	    // console.log(" session.attributes.stampIndex = " +
	    // session.attributes.stampIndex);
	    if (session.attributes.stampIndex < Stamps.length - 1) {
		// don't add on last stamp;
		speechText = speechText + "\n"
			+ " To hear more say  Next, to end say Stop, to find more say Find stamp. "
			+ "What would you like to do next?";
	    }
	});
    } else {
	speechText = "<p>No more stamps found</p><p>How else can I assist you?";
    }
    var speechOutput = {
	speech : "<speak>" + speechText + "</speak>",
	type : AlexaSkill.speechOutputType.SSML
    };
    var repromptOutput = {
	speech : repromptText,
	type : AlexaSkill.speechOutputType.PLAIN_TEXT
    };
    response.askWithCard(speechText, repromptText, cardTitle, cardContent);
}; // end handleNextStampIntentRequest
function handlePrevStampIntentRequest(intent, session, response) {
    // TODO make sure in Find command.
    var repromptText = "I did not hear you. what?";
    var speechText, cardTitle, cardText, repromptText;
    var Stamps = session.attributes.stampsFound;
    var nextStamp = Stamps[session.attributes.stampIndex];
    // console.log("session.attributes.stampIndex: " +
    // session.attributes.stampIndex);
    // console.log("Stamps.length: " + Stamps.length);
    if (session.attributes.stampIndex - 1 >= 0) {
	session.attributes.stampIndex = session.attributes.stampIndex - 1;
	var nextStampId = nextStamp[0];
	stampDataFormatted(nextStampId, function(speechText, cardTitle, cardContent) {
	    // console.log(" Stamps.length = " + Stamps.length);
	    // console.log(" session.attributes.stampIndex = " +
	    // session.attributes.stampIndex);
	    if (session.attributes.stampIndex < Stamps.length - 1) {
		// don't add on last stamp;
		speechText = speechText + "\n"
			+ " To hear more say  Next, to end say Stop, to find more say Find stamp. "
			+ "What would you like to do next?";
	    }
	});
    } else {
	speechText = "<p>No more stamps found</p><p>How else can I assist you?";
    }
    var speechOutput = {
	speech : "<speak>" + speechText + "</speak>",
	type : AlexaSkill.speechOutputType.SSML
    };
    var repromptOutput = {
	speech : repromptText,
	type : AlexaSkill.speechOutputType.PLAIN_TEXT
    };
    response.askWithCard(speechText, repromptText, cardTitle, cardContent);
}; // end handlePrevStampIntentRequest
function handleHaveCountryIntentRequest(intent, session, response) {
    session.attributes.currentCommand = 'HaveCountry';
    console.log("in handleHaveCountryIntentRequest");
    var username = session.attributes.username;
    var speechOutput;
    var err, data, u;
    // console.log("session.user.userId " + session.user.userId);
    // var usernameSlot = intent.slots.username;
    // console.log("1 username = " + username);
    // console.log(" CONFIG.Colnect.APIkey.key = " + CONFIG.Colnect.APIkey.key);
    // if session not found, then check database
    if (typeof username == 'undefined') {
	// Get a promise back from the query command
	// console.log("make db call using userId to find unsername for userId=
	// " + session.user.userId);
	// stampSkillTable().find(session.user.userId).then(function(username) {
	// console.log(username);
	// });
	/***********************************************************************
	 * storage.getUsername(session, (username) => { console.log("1 username: " +
	 * username); var speechOutput = 'username: ' +username;
	 * response.tell(speechOutput); });
	 * 
	 * 
	 * console.log("2 data: " + data); console.log ("2 username = " +
	 * username);
	 **********************************************************************/
    }
    // console.log("3 username = " + username);
    var repromptText = "What is your username? ";
    var sessionAttributes = {};
    var countrySlot = intent.slots.country;
    var cardContent = "";
    var SpeechContent = "";
    var cardTitle = "Have country?";
    // console.log("username = " + username);
    if (countrySlot && username) {
	getCAPI("/en/api/" + COLNECT_API_KEY + "/countries/cat/stamps/collection/" + username, function(userCountries) {
	    // console.log('userCountries: ' + userCountries);
	    getCAPI("/en/api/" + COLNECT_API_KEY + "/countries/cat/stamps", function(allCountries) {
		// console.log('allCountries: ' + allCountries);
		var countUserCounties = Object.keys(userCountries).length;
		// console.log('countUserCounties = ' +
		// countUserCounties);
		var countallCountries = Object.keys(allCountries).length;
		// console.log('countallCountries = ' +
		// countallCountries);
		// if username comes back with data then we have
		// it
		if (countUserCounties < 1) {
		    response.tell("sorry, I could not find that user or the user has no collection. "
			    + "Try setting the name again and spell slowly.");
		} else {
		    // loop through allcounties to make sure
		    // it's a
		    // valid country.
		    var foundCtry = 0;
		    var foundUserCtry = 0
		    var allCountriesKeys = Object.keys(allCountries);
		    for ( var i = 0, length = allCountriesKeys.length; i < length; i++) {
			var country = allCountries[allCountriesKeys[i]];
			var countryID = country[0];
			var countryName = country[1];
			// console.log("countryName = " +
			// countryName[1]) ;
			// and look for that country in the
			// user's
			// collection
			if (countryName.toUpperCase() === countrySlot.value.toUpperCase()) {
			    foundCtry = 1;
			    var userCountry;
			    var userCountriesKeys = Object.keys(userCountries);
			    for ( var j = 0, length2 = userCountriesKeys.length; j < length2; j++) {
				userCountry = userCountries[userCountriesKeys[j]];
				var userCountryID = userCountry[0];
				if (countryID == userCountryID) {
				    SpeechContent = SpeechContent + " No, you have a stamp from " + userCountry[1];
				    foundUserCtry = 1;
				    break; // they have it;
				}
			    }
			    if (foundUserCtry == 0) {
				SpeechContent = SpeechContent + " Yes, you need a stamp from " + userCountry[1];
			    }
			}
		    }
		    if (foundCtry == 0) {
			SpeechContent = countrySlot.value + " is not a valid colnect.com country.";
		    }
		    // console.log(SpeechContent);
		    response.tell(SpeechContent);
		}
	    })
	})
    } else {
	if (!username) {
	    response.tell("You must set your username. Say, set my colnect username to.");
	} else {
	    response.tell("You need to state the country.");
	}
    }// if countrySloot
}; // end handleHaveCountryIntentRequest
function buildSpeechletResponseWithoutCard(output, repromptText, shouldEndSession) {
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
}; // end buildSpeechletResponseWithoutCard
function removeHTML(s) {
    return s.replace(/<(?:.|\n)*?>/gm, '');
}; // end RemoveHTML
function numberWithCommas(x) {
    x = x.toString();
    var pattern = /(-?\d+)(\d{3})/;
    while (pattern.test(x))
	x = x.replace(pattern, "$1,$2");
    return x;
}; // end numberWithCommas
// helper tool
function handlePrintSomethingIntentRequest(intent, session, response) {
    session.attributes.currentCommand = ' PrintSomethingt';
    console.log('in handlePrintSomethingIntentRequest');
    var repromptText = "I did not hear you. what?";
    var speechText = "";
    var cardTitle = "handlePrintSomethingIntentRequest";
    var cardContent = "";
    // console.log('GLOSSARY.length ' + Object.keys(GLOSSARY).length);
    // for ( var i = 0; i < 100; i++) {
    for ( var i = 700; i < 900; i++) {
	// for ( var i = 300; i < Object.keys(GLOSSARY).length; i++) {
	// speechText = speechText + '/n' + Object.keys(ISWSC)[i];
	console.log(Object.keys(ISWSC)[i]);
    }
    speechText = speechText + "<p>How else can I assit you?</p>"
    var speechOutput = {
	speech : "<speak>" + speechText + "</speak>",
	type : AlexaSkill.speechOutputType.SSML
    };
    var repromptOutput = {
	speech : repromptText,
	type : AlexaSkill.speechOutputType.PLAIN_TEXT
    };
    cardContent = speechOutput + "\n  Link: http://www.linns.com/insights/glossary-of-philatelic-terms.html.html";
    response.askWithCard(speechOutput, repromptOutput, cardTitle, cardContent);
} // end handlePrintSomethingIntentRequest
function handleNewsIntentRequest(intent, session, response) {
  
    var parser = require('rss-parser');
   
    
    session.attributes.currentCommand = 'News';
    console.log('in handleNewsIntentRequest');
    var repromptText = "I did not hear you. what?";
    var speechText = "";
    var cardTitle = "News";
    var cardContent = "";
    
    console.log("NEWS_FEEDS = " +  NEWS_FEEDS);
    parser.parseURL(NEWS_FEEDS, function(err, parsed) {
	session.attributes.parsed = parsed;
	session.attributes.err = err;
	speechText = "" + parsed.feed.title + " news. <break time=\"0.8s\"/> ";
	
	var i = 0;
	parsed.feed.entries.forEach(function(entry) {
	  // console.log(entry.title + ':' + entry.link);
	    if (i <= 4) {
		speechText = speechText + pubDate2voice(entry.pubDate) + ". " + entry.title +    + ". <break time=\"0.6s\"/> " + entry.content;
		i++;
	    }
	})
	//  console.log ("speechText  = " + speechText);
	    speechText = speechText + "<p>How else can I assit you today?</p>";
	    var speechOutput = {
		speech : "<speak>" + speechText + "</speak>",
		type : AlexaSkill.speechOutputType.SSML
	    };
	    var repromptOutput = {
		speech : repromptText,
		type : AlexaSkill.speechOutputType.PLAIN_TEXT
	    };
	    response.askWithCard(speechOutput, repromptOutput, cardTitle, cardContent);
	 
    })

} // end handleNewsIntentRequest

function pubDate2voice (pubDate) {
 
var date = new Date(pubDate);

var months = Array("January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December");
var voice = months[date.getMonth()] +  " " + date.getDate() + ", " + date.getFullYear()


// console.log ("voice date = "+ voice);
return voice;

 
}

//
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
