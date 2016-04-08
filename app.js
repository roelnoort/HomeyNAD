"use strict";
var request = require('request');

function init() {

	Homey.log("Started NAD");

	Homey.manager('flow').on('action.music_on', function(callback, args) {
		Homey.log("event music_on triggered args.input_channel=" + args.input_channel );

		var h = Homey.manager("settings").get("host");
		var p = Homey.manager("settings").get("port");
		var url = h + ":" + p + "/switchnad/" + args.input_channel;

		Homey.log("attempting to call [" + url + "]");

		request.post(
			url,
			{},
			function (error, response, body) {
				if (!error && response.statusCode == 200) {
					Homey.log("successfully called switchnad service");
					callback(null, true); // we've fired successfully
				} else {
					Homey.log("error calling switchnad service");
					callback(null, false);
				}
			}
		);

/*
		switch (args.input_channel) {
			case "music":
				Homey.log("sonos input");
				break;
			case "mediacenter":
				Homey.log("mediacenter input");
				break;
			default:
				Homey.log("other input");
		}*/

		//callback(null, true);
	});
}

module.exports.init = init;
