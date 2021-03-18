<?php

	use JetBrains\PhpStorm\NoReturn;
	use Ramsey\Uuid\Uuid;

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

		#[NoReturn] function register(array $params) {
			$name = $params["name"] ?? NULL;
			$email = $params["email"] ?? NULL;
			$username = $params["username"] ?? NULL;
			$password = $params["password"] ?? NULL;

			if (is_null($name) || mb_strlen($name) < 3) error_response(Translation::translate("invalid_name"), 400, "name");
			if (is_null($email) || mb_strlen($email) < 3) error_response(Translation::translate("invalid_email"), 400, "email");
			if (is_null($username) || mb_strlen($username) < 3) error_response(Translation::translate("invalid_username"), 400, "username");
			if (is_null($password)) error_response(Translation::translate("invalid_password"), 400, "password");

			//TODO: Add email validation to make sure the email is in correct format

			$uniqueCheck = Database::execute_query("SELECT * FROM users.user WHERE username = ? OR email = ?", [$username, $email]);
			if (count($uniqueCheck) > 0) {
				foreach ($uniqueCheck as $check) {
					if ($check->username === $username) error_response(Translation::translate("username_taken"), errorField: "username");
					if ($check->email === $email) error_response(Translation::translate("email_taken"), errorField: "email");
				}
			}

			$userID = Uuid::uuid4();
			$activationKey = mb_substr(hash("sha256", time()), 0, 14);

			$result = Database::execute_query(
				"INSERT INTO users.user (id, name, email, username, password, activation_key) VALUES (?, ?, ?, ?, ?, ?)",
				[$userID, $name, $email, $username, $password, $activationKey]
			);

			if (count($result) === 0) {
				header("HTTP/1.1 201");
				echo json_encode(["success" => true, "message" => Translation::translate("account_registered_success")]);
			}

			error_response(Translation::translate("account_registered_error"), 500);
		}

		$routes->add("/login", "login", $input, ["POST"]);
		$routes->add("/register", "register", $input, ["POST"]);
	} catch (Exception $ex) {
		error_response("API error: {$ex->getMessage()}");
	}