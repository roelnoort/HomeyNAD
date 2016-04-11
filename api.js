module.exports = [
	{
        description:		'Detect NAD Controler',
        method: 		'GET',
        path:			'/detect',
        fn: function( callback, args ){
						Homey.log("in API callback")
						Homey.app.detectNadControler(function(success, result){
							if (success) {
								callback(false, result)
							} else {
								callback(true, null);
							}
						});
        }
    }
]
