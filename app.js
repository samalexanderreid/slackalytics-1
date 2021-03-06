//Set up Reqs
var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var qs = require('querystring');

//set up heroku environment variables
var env_var = {
	ga_key: process.env.GOOGLE_ANALYTICS_UAID
};

//Server Details
var app = express();
var port = process.env.PORT || 3000;

//Set Body Parser
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));


//Routes
app.get('/', function(req, res){
	res.send('here');


});

app.post('/collect', function(req, res){
	

	var channel = {
		id: 	req.body.channel_id,
		name: 	req.body.channel_name
	};
	var user = {
		id: 	req.body.user_id
	};
	var msgText = req.body.text;
	var teamDomain = req.body.team_domain;


	function searchM(regex){
		var searchStr = msgText.match(regex);
		if(searchStr != null){
			return searchStr.length;
		}
		return 0;
	};

	function searchS(regex){
		var searchStr = msgText.split(regex);
		if(searchStr != undefined){
			return searchStr.length;
		}
		return 0;
	};


	var wordCount = searchS(/\s+\b/);
	var emojiCount = searchM(/:[a-z_0-9]*:/g);
	var exclaCount = searchM(/!/g);
	var questionMark = searchM(/\?/g);
	var elipseCount = searchM(/\.\.\./g);


	//Structure Data
	var data = {
		v: 		1,
		tid:    env_var.ga_key,
		cid: 	user.id,
		ds:  	"slack", //data source
		cs: 	"slack", // campaign source
		cd1: 	user.id,
		cd2: 	channel.name,
		cd3: 	msgText,
		cm1: 	wordCount,
		cm2: 	emojiCount,
		cm3: 	exclaCount,
	//	cm4: 	letterCount,
		cm5: 	elipseCount, 
		cm6: 	questionMark, //need to set up in GA
		dh:		teamDomain+".slack.com",
		dp:		"/"+channel.name,
		dt:		"Slack Channel: "+channel.name,
		t: 		"event",
		ec: 	"slack: "+ channel.name + "|" + channel.id,
		ea: 	"post by " + user.id,
		el: 	msgText,
		ev: 	1 
	};
	console.log(JSON.stringify(data));
	console.log(req.body);
	//Make Post Request	
	request.post("https://www.google-analytics.com/collect?" + qs.stringify(data), 
		function(error, resp, body){
		console.log(error);
	})
	res.send("OK")
});

//Start Server
app.listen(port, function () {
	console.log('Listening on port ' + port); 

});
