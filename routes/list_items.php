<?php

	use Gac\DidYouBuyIt\controllers\ListItemController;
	use Gac\DidYouBuyIt\utility\classes\Logger;

	try {
		$routes
			->prefix("/list/item")
			->middleware([ "decode_token" ])
			->route("/{listID}", [ ListItemController::class, "get_list_items" ], [ "GET" ])
			->route("/{listID}", [ ListItemController::class, "add_new_list_item" ], [ "POST" ])
			->route("/{listID}/{itemID}", [ ListItemController::class, "update_list_item" ], [ "PATCH" ])
			->route("/{listID}/{itemID}", [ ListItemController::class, "delete_list_item" ], [ "DELETE" ])
			->route("/{listID}/{itemID}/bought", [ ListItemController::class, "update_list_item_bought_state" ], [ "PATCH" ])
			->add("/{listID}/{itemID}/image", [ ListItemController::class, "delete_list_item_image" ], [ "DELETE" ]);

	} catch ( Exception $ex ) {
		Logger::log("Api Error: {$ex->getMessage()}");
		error_response("Error processing your request", 500);
	}