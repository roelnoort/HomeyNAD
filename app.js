"use strict";
var request = require('request');

function init() {

	Homey.log("Started NAD");

	Homey.manager('flow').on('action.select_input', function(callback, args) {
		Homey.log("event select_input triggered args.input_channel=" + args.input_channel );

		Homey.manager('drivers').getDriver('nad_amp').capabilities.onoff.set(args.device, true, function(err, success) {
			if (!err && success) {
				Homey.manager('drivers').getDriver('nad_amp').capabilities.source_input.set(args.device, args.input_channel, function(err, success) {
					callback(null, !err && success);
				});
			} else {
				callback(null, false);
			}
		});
	});

	Homey.manager('flow').on('action.source_input', function(callback, args) {
		Homey.log("event source_input triggered args.input_channel=" + args.input_channel );

		Homey.manager('drivers').getDriver('nad_amp').capabilities.source_input.set(args.device, args.input_channel, function(err, success) {
			callback(null, !err && success);
		});
	});

	Homey.manager('flow').on('action.power_on', function(callback, args) {
		Homey.log("event power_on triggered for device=" + args.device);

		Homey.manager('drivers').getDriver('nad_amp').capabilities.onoff.set(args.device, true, function(err, success) {
			callback(null, !err && success);
		});
	});

	Homey.manager('flow').on('action.power_off', function(callback, args) {
		Homey.log("event power_off triggered for device=" + args.device);

		Homey.manager('drivers').getDriver('nad_amp').capabilities.onoff.set(args.device, false, function(err, success) {
			callback(null, !err && success);
		});
	});

	Homey.manager('flow').on('action.volume_set', function(callback, args) {
		Homey.log("event power_on triggered for device=" + args.device);

		Homey.manager('drivers').getDriver('nad_amp').capabilities.volume_set.set(args.device, args.volume, function(err, success) {
			callback(null, !err && success);
		});
	});
}

module.exports.init = init;
