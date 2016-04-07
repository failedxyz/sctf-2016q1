var bcrypt = require("bcrypt");
var common = require("./common");
var moment = require("moment");
var request = require("request");
var validator = require("validator");

var get_user_ip = function(req) {
	return (req.headers["x-forwarded-for"] || "").split(",")[0] || req.connection.remoteAddress;
};

exports.login = function(req, res) {
	var username = req.body.username;
	var password = req.body.password;
	
	if (!(username && username.length > 0 && password && password.length > 0)) {
		return res.send({ success: 0, message: "Please fill out all the fields." });
	}
	
	login_user(req, username, password, function(result) {
		if (result.success == 1 && "sid" in result) {
			res.cookie("sid", result.sid, { signed: true });
			res.cookie("username", unescape(username), { signed: true });
		}
		res.send(result);
	});
};

exports.logout = function(req, res) {
	common.db.collection("tokens").update({
		type: "login",
		sid: req.signedCookies["sid"],
	}, {
		$set: {
			expired: true,
			expireTime: moment().format()
		}
	}, function() {
		res.clearCookie("sid", { signed: true });
		res.clearCookie("username", { signed: true });
		req.session.destroy();
		res.redirect("/");
	});
};

exports.register = function(req, res) {
	var username = req.body.username.replace(/\W+/g, "_");
	var password = req.body.password;
	
	if (!(username && username.length && password && password.length > 0)) {
		return res.send({ success: 0, message: "Please fill out all the fields." });
	}
	
	common.db.collection("users").find({
		username: username
	}).count(function(err, count) {
		if (err) { return res.send({ success: 0, message: "Internal error (1)." }); }
		if (count != 0) {
			return res.send ({ success: 0, message: "Someone's already registered this username." });
		} else {
			var uid = common.token();
			var salt = bcrypt.genSaltSync(10);
			var phash = bcrypt.hashSync(password, salt);
			var doc = req.body;
			doc["uid"] = uid;
			doc["password"] = phash;
			delete doc["_csrf"];
			common.db.collection("users").insert(doc, { w: 1 }, function(err2, doc) {
				if (err2) { return res.send({ success: 0, message: "Internal error (2)." }); }
				login_user(req, username, password, function(result) {
					if (result.success == 1 && "sid" in result) {
						res.cookie("sid", result.sid, { signed: true });
						res.cookie("username", unescape(username), { signed: true });
					}
					return res.send({ success: 1, message: "registered" });
				});
			});
		}
	});
};

var login_user = function(req, username, password, callback) {
	common.db.collection("users").find({
		username: username
	}).toArray(function(err, users) {
		if (err) { return callback({ success: 0, message: "Internal error (3)." }); }
		if (users.length != 1) {
			return callback({ success: 0, message: "Please check if your username and password are correct." });
		} else {
			var user = users[0];
			var correct = bcrypt.compareSync(password, user["password"]);
			if (correct) {
				var sid = common.token();
				var session_information = {
					type: "login",
					uid: user["uid"],
					sid: sid,
					created: moment().format(),
					expired: false,
					ua: req.headers["user-agent"],
					ip: get_user_ip(req)
				};
				common.db.collection("tokens").insert(session_information, { w: 1 }, function(err2, doc) {
					if (err2) { return callback({ success: 0, message: "Internal error (4)." }); }
					return callback({ success: 1, message: "Successfully logged in.", sid: sid });
				});
			} else {
				return callback({ success: 0, message: "Please check if your username and password are correct." });
			}
		}
	});
};