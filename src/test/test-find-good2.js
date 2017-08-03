const
conversation = require('alexa-conversation');

const
app = require('../index.js');
const
opts = {
    name : 'GoodTwo',
    app : app,
    appId : 'amzn1.ask.skill.5def441f-b36d-4f44-a8d7-f3c1a4837e17'
};
conversation(opts)
//
// Test
//
.userSays('StampFindIntent', {
    country : 'US',
    faceValue : '3',
    topic : 'Eagle'
}).ssmlResponse // access the SSML response
.shouldContain('The first one')
//
// Test
//
.userSays('StampFindIntent', {
    country : 'UK',
    faceValue : '5',
    topic : 'Eagle'
}).ssmlResponse // access the SSML response
.shouldContain('The Eagle Tower')

.userSays('StampFindIntent', {
    country : 'Canada',
    faceValue : '1',
    topic : 'Queen Elizabeth'
}).ssmlResponse // access the SSML response
.shouldContain('Queen Elizabeth')
//
//
// END Test
.end(); // this will actually
