var express = require("express");
var ejs = require("ejs");
var CryptoJS = require("crypto-js");
var MersenneTwister = require("./mt");
var fs = require("fs");
var app = express();
var moment = require("moment");

app.use(require("body-parser")());
app.use(require("cookie-parser")());
app.set("view engine", "ejs");
var words = fs.readFileSync("words.txt", { encoding: "utf-8" }).split("\n"); // it's like 160k words
var secret = "pieiscool";

app.use("/", function(req, res, next) {
        if (moment().isBefore(moment("1460160000", "X"))) {
                res.status(403).send("Competition not started yet.");
        } else {
                next();
        }
});

var sets = {};
var token = function(length) {
	var length = length || 25;
	var chars = "abcdefghijklmnopqrstuvwxyz0123456789";
	var token = "";
	var r = new MersenneTwister(Date.now());
	for(var i=0; i<length; i++) {
		var R = Math.floor(r.random()*chars.length);
		token += chars.substring(R, R+1);
	}
	return token;
};

var encrypt = function(message) {
	var r = new MersenneTwister(parseInt(CryptoJS.MD5(message).toString(), 16) % 0xFFFFFFF); // souper secure
	var b = [];
	for(var i=0; i<message.length; i++) {
		b.push({ c: message.charAt(i), x: r.random() });
	}
	b.sort(function(a, b) { return a.x - b.x; });
	var w = "";
	for(var i=0; i<message.length; i++) {
		w += b[i].c;
	}
	return w;
};

app.use(express.static("static"));

app.use("/", function(req, res) {
	var level = 1;
	var judgment = 0;
	var showflag = false;
	try {
		level = parseInt(req.cookies.data.split("level=")[1]);
		var sig = CryptoJS.MD5(secret + req.cookies.data).toString();
		if (sig != req.cookies.sig) {
			throw "wrong sig (" + sig + " vs. " + req.cookies.sig + ")";
		}
	} catch (e) {
		level = 1;
		console.log(e);
	}
	if (req.method == "POST") {
		var w = [], y = new MersenneTwister(parseInt(secret + req.body.token, 32) % 0xFFFFFFF);
		for(var i=0; i<(120-level); i++) {
			w.push(words[~~(y.random() * words.length)]);
		}
		w = w.join(" ");
		if (w == req.body.answer) {
			level += 1;
			judgment = 1;
		} else {
			judgment = -1;
		}
	}
	if (level >= 100) {
		showflag = true;
	}
	var data = "level=" + level;
	res.cookie("data", data);
	res.cookie("sig", CryptoJS.MD5(secret + data).toString()); // make sure user don't tamper with data
	var t = token(20);
	var r = new MersenneTwister(parseInt(secret + t, 32) % 0xFFFFFFF);
	var s = [], c;
	for(var i=0; i<(120-level); i++) {
		s.push(words[~~(r.random() * words.length)]);
	}
	s = s.join(" ");
	c = encrypt(s);
	var f = {
		token: t,
		challenge: c,
		judgment: judgment == 1 ? "right" : (judgment == -1 ? "wrong" : ""),
		showflag: showflag
	};
	res.render("index", f);
});

var port = 8002;
app.listen(port, "0.0.0.0", function() {
	console.log("Listening on port " + port + "...");
});
