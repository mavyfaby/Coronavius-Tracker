const express = require("express");
const og = require("open-graph-scraper");
const app = express();
const port = 3000;

app.use(express.static("./Public"));

const options = {
	url: "http://127.0.0.1:3000"
};

function line() {
	console.log("------------------");
}

function log(text) {
	line();
	console.log(text);
	line();
}

app.listen(port, function() {
	log("Listening at " + port);
	
	og(options, function(error, results) {
		console.log(error, results);
	});
	
});