<?php
	/**
	 * Author: Igor Ilić <github@igorilic.net>
	 * Date: 2021-04-21
	 * Project: did-you-buy-it-v2
	 */

	namespace Gac\DidYouBuyIt\controllers;


	use Gac\DidYouBuyIt\utility\classes\Database;
	use Gac\DidYouBuyIt\utility\classes\Translation;
	use Gac\DidYouBuyIt\utility\classes\Validation;
	use Gac\Routing\Request;
	use JetBrains\PhpStorm\NoReturn;
	use Ramsey\Uuid\Uuid;

	class AuthController
	{
		function login()
		{
			$username = $_REQUEST["username"] ?? NULL;
			$password = $_REQUEST["password"] ?? NULL;

			if ( is_null($username) || mb_strlen($username) < 3 ) {
				error_response(Translation::translate("invalid_username"), errorField: "username");
			}

			if ( is_null($password) ) {
				error_response(Translation::translate("invalid_password"), errorField: "password");
			}

			$result = Database::execute_query(
				"SELECT * FROM users.user WHERE username = ? AND password = ?",
				[ $username, $password ]
			);

			if ( count($result) === 0 ) {
				error_response(Translation::translate("invalid_login_credentials"), 401);
			}

			$tokens = generate_token($result[0]->id, true);
			echo json_encode([ "success" => true, "data" => [ "access_token" => $tokens["accessToken"], "refresh_token" => $tokens["refreshToken"] ] ]);
		}

		#[NoReturn] function register()
		{
			$name = $_REQUEST["name"] ?? NULL;
			$email = $_REQUEST["email"] ?? NULL;
			$username = $_REQUEST["username"] ?? NULL;
			$password = $_REQUEST["password"] ?? NULL;

			if ( is_null($name) || mb_strlen($name) < 3 ) {
				error_response(Translation::translate("invalid_name"), 400, "name");
			}
			if ( is_null($email) || mb_strlen($email) < 3 ) {
				error_response(Translation::translate("invalid_email"), 400, "email");
			}
			if ( is_null($username) || mb_strlen($username) < 3 ) {
				error_response(Translation::translate("invalid_username"), 400, "username");
			}
			if ( is_null($password) ) {
				error_response(Translation::translate("invalid_password"), 400, "password");
			}

			//TODO: Add email validation to make sure the email is in correct format

			$uniqueCheck = Database::execute_query("SELECT * FROM users.user WHERE username = ? OR email = ?", [ $username, $email ]);
			if ( count($uniqueCheck) > 0 ) {
				foreach ( $uniqueCheck as $check ) {
					if ( $check->username === $username ) {
						error_response(Translation::translate("username_taken"), 409, errorField: "username");
					}
					if ( $check->email === $email ) {
						error_response(Translation::translate("email_taken"), 409, errorField: "email");
					}
				}
			}

			$userID = Uuid::uuid4();
			$activationKey = mb_substr(hash("sha256", time()), 0, 14);

			$result = Database::execute_query(
				"INSERT INTO users.user (id, name, email, username, password, activation_key) VALUES (?, ?, ?, ?, ?, ?)",
				[ $userID, $name, $email, $username, $password, $activationKey ]
			);

			if ( count($result) === 1 ) {
				$activationLink = "{$_SERVER['REQUEST_SCHEME']}://{$_SERVER["HTTP_HOST"]}/activate/{$activationKey}";
				$emailBody = Translation::translate("confirm_email_body", arguments: [ "name" => $name ]);
				send_email(
					$email,
					Translation::translate("confirm_your_email"),
					$emailBody,
					emailTemplate: [
						"file" => "confirm_email",
						"args" => [
							"emailTitle" => Translation::translate("confirm_your_email"),
							"emailPreview" => strip_tags($emailBody),
							"emailConfirmText" => Translation::translate("confirm_your_email"),
							"emailActivationLink" => $activationLink,
						],
					]
				);
				header("HTTP/1.1 201");
				echo json_encode([ "success" => true, "message" => Translation::translate("account_registered_success") ]);
			} else {
				error_response(Translation::translate("account_registered_error"), 500);
			}
		}

		function activate_account(Request $request,
								  string $activationKey)
		{
			if ( !isset($activationKey) || empty($activationKey) ) {
				error_response(Translation::translate("missing_activation_key"), 400);
			}

			$result = Database::execute_query("SELECT id, activation_key, status FROM users.user WHERE activation_key = ?", [ $activationKey ]);

			if ( count($result) === 0 || !isset($result[0]->id) ) {
				error_response(Translation::translate("invalid_activation_key"), 400);
			}

			$userData = $result[0];

			if ( $userData->status === '1' ) {
				error_response(Translation::translate("account_already_active"), 400);
			}

			Database::execute_query(
				"UPDATE users.user SET status = '1' WHERE id = ? AND activation_key = ?",
				[ $userData->id, $activationKey ]
			);

			echo json_encode([ "success" => true, "message" => Translation::translate("account_activated_success") ]);
		}

		function refresh_token()
		{
			if ( !isset($_SESSION) || !isset($_SESSION["userID"]) ) {
				error_response(Translation::translate("invalid_token"), 403);
			}

			$userID = $_SESSION["userID"];
			$tokens = generate_token($userID);

			echo json_encode([ "success" => true, "data" => [ "access_token" => $tokens["accessToken"], "refresh_token" => $tokens["refreshToken"] ] ]);
		}

		function request_reset_password_link(Request $request)
		{
			$emailOrUsername = $request->get("emailOrUsername");

			Validation::validate([
				"emailOrUsername" => [ "required", [ "min_length" => 3 ], [ "max_length" => 250 ] ],
			], $request);

			$query = "SELECT * FROM users.user WHERE username = ? OR email = ?";
			$user = Database::execute_query($query, [ $emailOrUsername, $emailOrUsername ], true);

			if ( empty($user) || !isset($user->id) ) {
				error_response(Translation::translate("account_not_found"), 404);
			}

			$passwordActivationCode = generate_random_string(12);

			$updateUserQuery = "UPDATE users.user SET reset_password_code = ?, status = ? WHERE id = ?";
			Database::execute_query($updateUserQuery, [ $passwordActivationCode, '0', $user->id ]);

			$emailBody = Translation::translate('reset_password_body');
			$url = "{$_SERVER['REQUEST_SCHEME']}://{$_SERVER['HTTP_HOST']}/reset_password/{$passwordActivationCode}";
			send_email(
				$user->email,
				Translation::translate('reset_your_password'),
				$emailBody,
				emailTemplate: [
					'file' => 'reset_password',
					'args' => [
						'emailTitle' => Translation::translate('reset_your_password'),
						'emailPreview' => strip_tags($emailBody),
						'emailConfirmText' => Translation::translate('reset_your_password'),
						'emailLink' => $url,
					],
				]
			);

			echo json_encode([
				"success" => true,
			]);
		}

		function reset_password(Request $request, string $resetCode)
		{
			if ( empty($resetCode) ) {
				error_response(Translation::translate("invalid_reset_code"), 400);
			}

			$user = Database::execute_query("SELECT * FROM users.user WHERE reset_password_code = ?", [ $resetCode ], true);

			if ( empty($user) || !isset($user->id) ) {
				error_response(Translation::translate("invalid_reset_code"), 400);
			}

			Validation::validate([
				"password" => [ "required", [ "min_length" => 10 ] ],
			], $request);

			$updateUserQuery = "UPDATE users.user SET password = ?, reset_password_code = null, status = '1' WHERE id = ?";
			Database::execute_query($updateUserQuery, [ $request->get("password"), $user->id ]);

			echo json_encode([
				"success" => true,
			]);
		}
	}