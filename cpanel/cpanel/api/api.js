var common = require("./common");
var user = require("./user");

var api = { };

api.route = function(app) {
	app.post("/api/user/login", user.login);
	app.get("/logout", user.logout);
	app.post("/api/user/register", user.register);
};

api.user_info = function(username, callback) {
	common.db.collection("users").find({
		username: username
	}).toArray(function(err, users) {
		if (err) { return callback({ message: "Internal error (5)." }); }
		if (users.length != 1) {
			return callback({ message: "Internal error (6)." });
		} else {
			var user = users[0];
			return callback(user);
		}
	});
}

module.exports = api;