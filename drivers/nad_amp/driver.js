"use strict";
var request = require('request');

function detectNadControler(cb) {
		Homey.log("in detectNadControler")

		var dgram = require("dgram")
		var message = new Buffer("detectNadControler")
		var socket = dgram.createSocket("udp4")
		var timerId = null

		socket.on("message", function(msg, rinfo) {
				Homey.log("detectNad received reply from upd " + rinfo.address + ":" + rinfo.port)
				// note that rinfo.address, rinfo.port refer to the UDP
				// server used for detection. the actual TCP server is at
				// port 80 on the same IP

				if (timerId) {
						clearTimeout(timerId)
				}
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

		timerId = setTimeout(function() {
				Homey.log("timeout reached on detectNad")
				timerId = null
				socket.close();
				cb(false, null);
		}, 10000)
}


module.exports.init = function( devices_data, callback ) {

    // when the driver starts, Homey rebooted. Initialise all previously paired devices.
    devices_data.forEach(function(device_data){
        // do something here to initialise the device, e.g. start a socket connection
        // for the NAD controler, no initialisation is needed, as we will just
        // invoke a REST call.
        Homey.log("init device loop device");
        Homey.log(device_data);
    })

    // let Homey know the driver is ready
    callback();
}


module.exports.pair = function (socket) {

	socket.on('list_devices', function (data, callback) {
    detectNadControler(function(success, nadcontroler) {
      if (success) {
        var list_amps = [];
        // Right now, I always return ID 27.
        // This is fine for private usage.
        // If there could be more than one NAD installed in your network,
        // connected to this Homey, it would make sense to ask for a
        // serial number from the device and use that.
        // Right now, I did not bother to implement that.
        list_amps.push({
            name: "NAD Controler",
            data: {
              id:27
            }
          });
        callback(null, list_amps);
      }
    });
	});

};

function CommunicateWithNad(commanduri, callback) {
  var h = Homey.manager("settings").get("host");
  var p = 80;
  var url = h + ":" + p + commanduri;

  Homey.log("attempting to call [" + url + "]");

  request.post(
    url,
    {},
    function (error, response, body) {
      if (!error && response.statusCode == 200) {
        Homey.log("CommunicateWithNad, success. Return value: " + body);
        callback(true, body); // we've fired successfully
      } else {
        Homey.log("CommunicateWithNad, error calling Nad");
        callback(false, null);
      }
    }
  );
}


module.exports.capabilities = {
    onoff: {

        // this function is called by Homey when it wants to GET the onoff state, e.g. when the user loads the smartphone interface
        // `device_data` is the object as saved during pairing
        // `callback` should return the current value in the format callback( err, value )
        get: function( device_data, callback ){
          Homey.log("onoff.get");

          CommunicateWithNad("/power", function(success, data){
            if (success) {
              callback(null, data == "On");
            }
            else {
              callback(device_data);
            }
          });
        },

        // this function is called by Homey when it wants to SET the onoff state, e.g. when the user says 'amplifier on'
        // `device_data` is the object as saved during pairing
        // `val` is the new value
        // `callback` should return the new value in the format callback( err, value )
        set: function( device_data, val, callback ) {
          Homey.log("onoff.set val=" + val );

          var onoff = "";
          onoff = (val? "on" : "off");
          CommunicateWithNad("/power/" + onoff, function(success, data){
            if (success) {
              callback( null, data == "On");
            }
            else {
              callback(device_data);
            }
          });
        }
    },

    volume_set: {
      get: function(device_data, callback) {
        Homey.log("volume_set.get " + device_data);

        CommunicateWithNad("/volume", function(success, data){
          if (success) {
            callback( null, data);
          }
          else {
            callback(device_data);
          }
        });
      },
      set: function(device_data, val, callback) {
        Homey.log("volume_set.set val=" + val );

        // Homey's API uses 0-1 float values in mobile UI for capabilities.
        // Actual NAD uses -99 to +19 values. Action uses this.
        // Figure out whether the value is a float and map the range if needed
        // Works mostly, but 0% and 100% (0 and 1) values appear as integers
        if (val % 1 === 0) {
          Homey.log("volume is integer, so came via action --> can directly set volume to " + val);
        }
        else {
          val = Math.round((val * 119) - 99);
          Homey.log("volume is a float (should be between 0 and 1 also). need to map on -99 to +19 range first. new val " + val);
        }

        CommunicateWithNad("/volume/set?volume=" + val, function(success, data){
          if (success) {
            callback( null, data);
          }
          else {
            callback(device_data);
          }
        });
      }
    },

    volume_mute: {
      get: function(device_data, callback) {
        Homey.log("volume_mute.get ");

        CommunicateWithNad("/mute", function(success, data){
          if (success) {
            callback(null, data);
          }
          else {
            callback(device_data);
          }
        });
      },
      set: function(device_data, val, callback) {
        Homey.log("mute_set.set val=" + val );

        CommunicateWithNad("/mute/" + val, function(success, data){
          if (success) {
            callback( null, data);
          }
          else {
            callback(device_data);
          }
        });
      }
    },

    volume_up: {
      set: function(device_data, val, callback) {
        Homey.log("volume_up.set val=" + val );

        CommunicateWithNad("/volume/up" + val, function(success, data){
          if (success) {
            callback( null, data);
          }
          else {
            callback(device_data);
          }
        });
      }
    },

    volume_down: {
      set: function(device_data, val, callback) {
        Homey.log("volume_down.set val=" + val );

        CommunicateWithNad("/volume/down" + val, function(success, data){
          if (success) {
            callback( null, data);
          }
          else {
            callback(device_data);
          }
        });
      }
    },

    source_input: {
      get: function(device_data, callback) {
        Homey.log("source.get " + device_data);

        CommunicateWithNad("/source", function(success, data){
          if (success) {
            callback(null, data);
          }
          else {
            callback(device_data);
          }
        });
      },
      set: function(device_data, val, callback) {
        Homey.log("source.set val=" + val );

        CommunicateWithNad("/source/set?source=" + val, function(success, data){
          if (success) {
            callback(null, data);
          }
          else {
            callback(device_data);
          }
        });
      }
    }
}

module.exports.detectNadControler = detectNadControler;
