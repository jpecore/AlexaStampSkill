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
    name : 'Series',
    app : app,
    appId : 'amzn1.ask.skill.5def441f-b36d-4f44-a8d7-f3c1a4837e17'
};
conversation(opts)
//
// Test
//
.userSays('StampFindIntent', {
    country : 'Canada',
    faceValue : '1',
    topic : 'Queen Elizabeth'
}).ssmlResponse // access the SSML response
.shouldContain('Queen Elizabeth II')
.shouldContain('Say series to hear')
//
// Test
//
.userSays('ShowCurrentSeries')
.ssmlResponse // access the SSML response
.shouldContain('Queen Elizabeth II')

//
// Test
//
.userSays('NextStampIntent')
.ssmlResponse // access the SSML response
.shouldContain('Queen Elizabeth II')
//
//
// END Test
.end(); // this will actually
