<?php

	try {
		function login(array $params) {
			$username = $params["username"] ?? NULL;
			$password = $params["password"] ?? NULL;

			if (is_null($username) || mb_strlen($username) < 3) {
				error_response(Translation::translate("invalid_username"), errorField: "username");
			}

			if (is_null($password)) {
				error_response(Translation::translate("invalid_password"), errorField: "password");
			}

			$result = Database::execute_query(
				"SELECT * FROM users.user WHERE username = ? AND password = ?",
				[$username, $password]
			);

			if (count($result) === 0) {
				error_response(Translation::translate("invalid_login_credentials"), 401);
			}

			echo json_encode(["res" => $result]);
		}

		function register(array $params) {
			$name = $params["name"] ?? NULL;
			$email = $params["email"] ?? NULL;
			$username = $params["username"] ?? NULL;
			$password = $params["password"] ?? NULL;

			if (is_null($name) || mb_strlen($name) < 3) {
				error_response(Translation::translate("invalid_name"), 400, "name");
			}

			if (is_null($email) || mb_strlen($email) < 3) {
				error_response(Translation::translate("invalid_email"), 400, "email");
			}

			if (is_null($username) || mb_strlen($username) < 3) {
				error_response(Translation::translate("invalid_username"), 400, "username");
			}

			if (is_null($password)) {
				error_response(Translation::translate("invalid_password"), 400, "password");
			}

			$usernameTaken = Database::execute_query("SELECT * FROM users.user WHERE username = ?", [$username]);
			if (count($usernameTaken) > 0) {
				error_response(Translation::translate("username_taken"));
			}
		}

		$routes->add("/login", "login", $input, ["POST"]);
		$routes->add("/register", "register", $input, ["POST"]);
	} catch (Exception $ex) {
		error_response("API error: {$ex->getMessage()}");
	}