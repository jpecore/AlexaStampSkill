const conversation = require('alexa-conversation');
// your Alexa skill main file. app.handle needs to exist
// https://www.npmjs.com/package/alexa-conversation
// asserts that response and reprompt are equal to the given text
// .shouldEqual('Welcome to the Stamp Collector skill', 'I did not understand.
// What did you say')
// assert not Equals
// .shouldNotEqual('Wrong answer', 'Wrong reprompt')
// fuzzy match, not recommended for production use. See readme.md for more
// details
// .shouldApproximate('This is an approximate match')
const app = require('../index.js');
var constants = require('../constants');
const opts = {
    name : 'Help',
    app : app,
    appId :  constants.appId
};
conversation(opts)
//
// Test
//
 .userSays('AMAZON.HelpIntent') // trigger the first Intent
   .ssmlResponse // this gives you access to the non-ssml response
      .shouldContain('Stamp Collector can help you do many things')    
.end();  
