const
conversation = require('alexa-conversation');
// https://www.npmjs.com/package/alexa-conversation
const
app = require('../index.js');
const
opts = {
    name : 'Identify',
    app : app,
    appId : 'amzn1.ask.skill.5def441f-b36d-4f44-a8d7-f3c1a4837e17'
};
conversation(opts)
//
// Test  
//
.userSays('GetStampIDIntent', {
    letters : 'm a g y a r'
}).ssmlResponse // access the SSML response
.shouldContain('Hungary')
//    
//
// END Test
.end(); // this will actually
