<?php
	declare(strict_types=1);
	include_once "vendor/autoload.php";

	$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
	$dotenv->load();

	try {
		$routes = new Routes();
		$input = json_decode(file_get_contents("php://input")) ?? [];
		$input = array_merge($input, $_REQUEST);
		$files = glob($_SERVER['DOCUMENT_ROOT'] . "/routes/*.php");

		$routes->add("/", function () {
			echo json_encode(["message" => Translation::translate(key: "hello_world")]);
		}, NULL, ["GET", "POST", "PUT", "PATCH", "DELETE"]);

		foreach ($files as $file) {
			if (file_exists($file)) {
				include_once($file);
			}
		}

		$routes->route();
	} catch (Exception $ex) {
		error_response("API Error: {$ex->getMessage()}");
	}
