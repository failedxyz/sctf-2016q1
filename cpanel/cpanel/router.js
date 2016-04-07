var api = require("./api/api");
var common = require("./api/common");

function showProfile(req, res, next) {
	var vars = {};
	common.is_logged_in(req, function(logged_in) {
		common.db.collection("users").find({
			username: req.params.username
		}).toArray(function(err, users) {
			if (err) { 
				return res.send({ 
					success: 0, 
					message: "Internal error (7)." 
				}); 
			}
			
			if (users.length != 1) {
				vars.user_found = false;
				vars.title = "User Not Found";
			} else {
				var user = users[0];
				vars.user_found = true;
				vars.title = user["firstname"] + " " + user["lastname"];
				vars.user = user;
			}
			
			if (logged_in) {
				api.user_info(req.signedCookies["username"], function(user_info) {
					vars.user_info = user_info;
					vars.logged_in = logged_in;
					res.render("userpage", { page: vars });
				});
			} else {
				vars.logged_in = logged_in;
				res.render("userpage", { page: vars });
			}
		});
	});
}

var configurePublicPage = function(app, page) {
	var handler = function(req, res, next) {
		var vars = { };
		if (page["opt"]["csrf"] == true) {
			vars["csrf_token"] = req.csrfToken();
		}
		// vars.extend_object({ session: req.session });
		common.is_logged_in(req, function(logged_in) {
			if (logged_in) {
				api.user_info(req.signedCookies["username"], function(user_info) {
					vars.extend_object({ user_info: user_info, logged_in: logged_in });
					res.render(page.view, { page: vars.extend_object(page.vars) });
				});
			} else {
				vars.extend_object({ logged_in: logged_in });
				res.render(page.view, { page: vars.extend_object(page.vars) });
			}
		});
	}
	app.get(page.url, handler);
}

var router = function(app) {
	var publicPages = [
		{ url: "/", view: "index", "vars": { title: "" }, opt: { } },
		{ url: "/register", view: "register", "vars": { title: "register" }, opt: { csrf: true } },
		{ url: "/login", view: "login", "vars": { title: "login" }, opt: { csrf: true } },
		{ url: "/account", view: "account", "vars": { title: "account" }, opt: { } },
	];

	for(var i = 0; i < publicPages.length; i++) {
		configurePublicPage(app, publicPages[i]);
	}
	app.get("/u/:username", showProfile);
};

module.exports = router;