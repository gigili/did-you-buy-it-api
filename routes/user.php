<?php

	use Gac\DidYouBuyIt\controllers\UserController;
	use Gac\DidYouBuyIt\utility\classes\Logger;

	try {
		$routes->prefix("/user")
			   ->middleware([ "decode_token" ])
			   ->route("/", [ UserController::class, "get_user_profile" ], [ "GET" ])
			   ->route("/", [ UserController::class, "update_user_profile" ], [ "PATCH" ])
			   ->route("/", [ UserController::class, "delete_user_profile" ], [ "DELETE" ])
			   ->add("/find", [ UserController::class, "filter_users" ], [ "POST" ]);
	} catch ( Exception $ex ) {
		Logger::log("Api Error: {$ex->getMessage()}");
		error_response("Error processing your request", 500);
	}