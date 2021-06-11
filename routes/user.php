<?php

	use Gac\DidYouBuyIt\controllers\UserController;

	try {
		$routes->middleware([ "decode_token" ])->add("/user", [ UserController::class, "get_user_profile" ], [ "GET" ]);
		$routes->middleware([ "decode_token" ])->add("/user", [ UserController::class, "update_user_profile" ], [ "PATCH" ]);
		$routes->middleware([ "decode_token" ])->add("/user", [ UserController::class, "delete_user_profile" ], [ "DELETE" ]);
		$routes->middleware([ "decode_token" ])->add("/user/find", [ UserController::class, "filter_users" ], [ "POST" ]);
	} catch ( Exception $ex ) {
		Logger::log("Api Error: {$ex->getMessage()}");
		error_response("Error processing your request", 500);
	}