const
conversation = require('alexa-conversation');
// https://www.npmjs.com/package/alexa-conversation
const
app = require('../index.js');
const opts = {
    name : 'Good1',
    app : app,
    appId : 'amzn1.ask.skill.5def441f-b36d-4f44-a8d7-f3c1a4837e17'
};
conversation(opts)
// Test
.userSays('StampFindIntent', {
    country : '',
    faceValue : '3',
    topic : 'Detroit'
}).ssmlResponse // access the SSML response
.shouldContain('Detroit Skyline') 
//
// Test
//
.userSays('StampFindIntent', {
    country : '',
    faceValue : '3',
    topic : 'Eagle'
}).ssmlResponse // access the SSML response
.shouldContain('The first one')

//
// END Test
.end(); // this will actually