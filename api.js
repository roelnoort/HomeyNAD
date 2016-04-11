module.exports = [
	{
        description:		'Detect NAD Controler',
        method: 		'GET',
        path:			'/detect',
        fn: function( callback, args ){
						Homey.log("in API callback")
						var result = "hello";//Homey.app.detectNadControler();

            // callback follows ( err, result )
            callback( null, result );

            // access /?foo=bar as args.query.foo
        }
    }
]
