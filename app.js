"use strict";
var request = require('request');

function init() {

	Homey.log("Started NAD");

	Homey.manager('flow').on('action.select_input', function(callback, args) {
		Homey.log("event select_input triggered args.input_channel=" + args.input_channel );

		var h = Homey.manager("settings").get("host");
		var p = Homey.manager("settings").get("port");
		var url = h + ":" + p + "/switchinput/" + args.input_channel;

		Homey.log("attempting to call [" + url + "]");

		request.post(
			url,
			{},
			function (error, response, body) {
				if (!error && response.statusCode == 200) {
					Homey.log("successfully called switchnad service");
					callback(null, true); // we've fired successfully
				} else {
					Homey.log("error calling switchinput service");
					callback(null, false);
				}
			}
		);
	});

	Homey.manager('flow').on('action.power_off', function(callback, args) {
		Homey.log("event power_off triggered");

		var h = Homey.manager("settings").get("host");
		var p = Homey.manager("settings").get("port");
		var url = h + ":" + p + "/poweroff/";

		Homey.log("attempting to call [" + url + "]");

		request.post(
			url,
			{},
			function (error, response, body) {
				if (!error && response.statusCode == 200) {
					Homey.log("successfully called poweroff service");
					callback(null, true); // we've fired successfully
				} else {
					Homey.log("error calling poweroff service");
					callback(null, false);
				}
			}
		);
	});
}

module.exports.init = init;
