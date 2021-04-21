<?php

	use Gac\DidYouBuyIt\controllers\AuthController;
	use Gac\DidYouBuyIt\utility\classes\Logger;

	try {
		$routes->add("/login", [AuthController::class, "login"], ["POST"]);
		$routes->add("/register", [AuthController::class, "register"], ["POST"]);
		$routes->add("/activate/{activationKey}", [AuthController::class, "activate_account"], ["GET"]);
		$routes->middleware(["decode_token"])->add("/refresh", [AuthController::class, "refresh_token"], ["POST"]);
	} catch (Exception $ex) {
		Logger::log("Api Error: {$ex->getMessage()}");
		error_response("Error processing your request", 500);
	}