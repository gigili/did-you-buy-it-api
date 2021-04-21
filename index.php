<?php
	declare(strict_types=1);

	session_start();
	include_once "vendor/autoload.php";

	use Gac\DidYouBuyIt\utility\classes\Logger;
	use Gac\DidYouBuyIt\utility\classes\ParseInputStream;
	use Gac\DidYouBuyIt\utility\classes\Translation;
	use Gac\Routing\Exceptions\RouteNotFoundException;
	use Gac\Routing\Routes;

	try {
		$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
		$dotenv->load();

		$routes = new Routes();
		$input = json_decode(file_get_contents("php://input")) ?? [];
		$params = [];
		new ParseInputStream($params);
		$_REQUEST = array_merge($_REQUEST, (array)$input);
		$_REQUEST = array_merge($_REQUEST, $params);

		$files = glob($_SERVER['DOCUMENT_ROOT'] . "/routes/*.php");

		$routes->add("/", function () {
			echo json_encode(["message" => Translation::translate(key: "hello_world")]);
		}, ["GET", "POST", "PUT", "PATCH", "DELETE"]);

		foreach ($files as $file) {
			if (file_exists($file)) {
				include_once($file);
			}
		}

		$routes->handle();
	} catch (RouteNotFoundException $ex) {
		error_response("Route not found", 404);
	} catch (Exception $ex) {
		Logger::error("Api Error: {$ex->getMessage()}");
		error_response("Error processing your request", 500);
	}
