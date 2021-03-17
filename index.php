<?php
	declare(strict_types=1);
	include_once "vendor/autoload.php";
	include_once "utility/helpers.php";
	include_once "utility/Database.php";
	include_once "utility/Routes.php";

	try {
		$routes = new Routes();

		$routes->add("/", function () {
			$result = Database::execute_query("SELECT * FROM \"Test\"");
			echo json_encode(["message" => "Hello World", "result" => $result]);
		}, NULL, ["GET", "POST", "PUT", "PATCH", "DELETE"]);

		$routes->route();
	} catch (Exception $ex) {
		die(json_encode(["error" => "API Error: {$ex->getMessage()}"]));
	}
