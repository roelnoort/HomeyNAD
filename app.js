"use strict";
var request = require('request');

function init() {

	Homey.log("Started NAD");

	Homey.manager('flow').on('action.select_input', function(callback, args) {
		Homey.log("event select_input triggered args.input_channel=" + args.input_channel );

		var h = Homey.manager("settings").get("host");
		var p = 80;
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
		var p = 80;
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

function detectNadControler(cb) {
		Homey.log("in detectNadControler")

		var dgram = require("dgram")
		var message = new Buffer("detectNadControler")
		var socket = dgram.createSocket("udp4")

		socket.on("message", function(msg, rinfo) {
				Homey.log("detectNad received reply from upd " + rinfo.address + ":" + rinfo.port)
				// note that rinfo.address, rinfo.port refer to the UDP
				// server used for detection. the actual TCP server is at
				// port 80 on the same IP
				cb(true, {host: rinfo.address, port: 80})
				socket.close()
		})

		socket.on("listening", function() {
		    Homey.log("listening event for detectNad called")
		    socket.setBroadcast(true)
		})

		socket.send(message, 0, message.length, 2705, "255.255.255.255", function(err, bytes) {
		  if (err) {
		    Homey.log("error sending detectNad on socket")
		  } else {
		    Homey.log("udp detectNad message sent")
		  }
		})

		setTimeout(function() {
				Homey.log("timeout reached on detectNad")
				socket.close();
				cb(false, null);
		}, 10000)
}

module.exports.init = init;
module.exports.detectNadControler = detectNadControler;
