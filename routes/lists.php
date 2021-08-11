<?php

	use Gac\DidYouBuyIt\controllers\ListController;
	use Gac\DidYouBuyIt\utility\classes\Logger;

	try {
		$routes->prefix("/list")
			   ->middleware([ "decode_token" ])
			   ->route("/", [ ListController::class, "get_users_lists" ], [ "GET" ])
			   ->route("/", [ ListController::class, "add_list" ], [ "POST" ])
			   ->route("/{listID}", [ ListController::class, "get_list" ], [ "GET" ])
			   ->route("/{listID}", [ ListController::class, "update_list" ], [ "PATCH" ])
			   ->route("/{listID}", [ ListController::class, "delete_list" ], [ "DELETE" ])
			   ->route("/{listID}/user", [ ListController::class, "get_list_users" ], [ "GET" ])
			   ->route("/{listID}/user", [ ListController::class, "add_user_to_list" ], [ "POST" ])
			   ->route("/{listID}/user/{userID}", [ ListController::class, "delete_user_from_list" ], [ "DELETE" ])
			   ->add();
	} catch ( Exception $ex ) {
		Logger::error("Api Error: {$ex->getMessage()}");
		error_response("Error processing your request", 500);
	}