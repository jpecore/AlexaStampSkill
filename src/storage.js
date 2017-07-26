'use strict'
var AWS = require("aws-sdk");
AWS.config.update({
    region : "us-east-1",
    endpoint : "https://dynamodb.us-east-1.amazonaws.com"
});
var storage = (function() {
    return {
	saveUsername : function(userName, session, callback) {
	    var params = {
		TableName : 'stampSkill',
		Item : {
		    userId : session.user.userId,
		    username : userName
		}
	    };
	    var dynamodb = new AWS.DynamoDB.DocumentClient();
	    dynamodb.put(params, function(err, data) {
		// console.log("session.user.userId:[" +
		// session.user.userId)
		+"]";
		console.log('err = ' + err);
		// console.log("data.Item.username" +
		// data.Item.username);
		callback(userName);
	    });
	},
	getUsername : function(session, callback) {
	    var params = {
		TableName : 'stampSkill',
		Key : {
		    userId : session.user.userId
		}
	    };
	    var dynamodb = new AWS.DynamoDB.DocumentClient();
	    dynamodb.get(params, function(err, data) {
		console.log("session.user.userId:[" + session.user.userId) + "]";
		console.log("data = " + data);
		console.log("err = " + err);
		if (data && data.Item) {
		    console.log("data.Item.username" + data.Item.username);
		    callback(data.Item.username);
		} else {
		    console.log("data.Item.username is null");
		    callback(null);
		}
	    });
	}
    }
})();
module.exports = storage;