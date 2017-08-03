const
conversation = require('alexa-conversation');
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
const
app = require('../index.js');

const
opts = {
    name : 'Bad',
    app : app,
    appId : 'amzn1.ask.skill.5def441f-b36d-4f44-a8d7-f3c1a4837e17'
};


conversation(opts)
 
.userSays('PrevStampIntent')
.ssmlResponse.shouldContain('No more stamps found')
//
.userSays('NextStampIntent' )
.userSays('NextStampIntent' )
.userSays('NextStampIntent' )
.userSays('NextStampIntent' )
.userSays('NextStampIntent' )
.userSays('NextStampIntent' )
.userSays('NextStampIntent' )
.userSays('NextStampIntent' )
.userSays('NextStampIntent' )
.ssmlResponse.shouldContain('No more stamps found')
//
// Test
//
.userSays('StampFindIntent', { 
    country : null,
    faceValue : null,
    topic : null
}).ssmlResponse.shouldContain('You need to provide')
//
.userSays('NextStampIntent' )
.ssmlResponse.shouldContain('No more stamps found')
//
// Test
//
.userSays('StampFindIntent', {
    country : null,
    faceValue : '3',
    topic : 'NOSUCHSTAMP'
}).ssmlResponse  
.shouldContain('sorry, I could not find that')


//
// Test
//

.userSays('StampFindIntent', { 
    country : null,
    faceValue : null,
    topic : null
}).ssmlResponse.shouldContain('You need to provide')

//
// Test
//
.userSays('StampFindIntent', {
    country : "XXX",
    faceValue : '3',
    topic : 'NOSUCHSTAMP'
}).ssmlResponse  
.shouldContain('I could not find that country')


 
 
//
// END Test
.end(); // this will actually
