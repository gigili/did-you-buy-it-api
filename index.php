<?php
	declare(strict_types=1);

	session_start();
	include_once "vendor/autoload.php";

	use Gac\Routing\Exceptions\RouteNotFoundException;
	use Gac\Routing\Routes;

	try {
		$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
		$dotenv->load();

		$routes = new Routes();
		$input = json_decode(file_get_contents("php://input")) ?? [];
		$_REQUEST = array_merge($input, $_REQUEST);
		$files = glob($_SERVER['DOCUMENT_ROOT'] . "/routes/*.php");

		$routes->add("/", function () {
			echo json_encode(["message" => Translation::translate(key: "hello_world")]);
		}, ["GET", "POST", "PUT", "PATCH", "DELETE"]);

		foreach ($files as $file) {
			if (file_exists($file)) {
				include_once($file);
			}
		}

		$routes->route();
	} catch (RouteNotFoundException $ex) {
		error_response("Route not found", 404);
	} catch (Exception $ex) {
		error_response("API Error: {$ex->getMessage()}");
	}
