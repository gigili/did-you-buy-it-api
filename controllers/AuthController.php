<?php
	/**
	 * Author: Igor Ilić <github@igorilic.net>
	 * Date: 2021-04-21
	 * Project: did-you-buy-it-v2
	 */

	namespace Gac\DidYouBuyIt\controllers;

    use Gac\DidYouBuyIt\models\UserModel;
	use Gac\DidYouBuyIt\utility\classes\Translation;
	use Gac\DidYouBuyIt\utility\classes\Validation;
	use Gac\Routing\Request;
	use Ramsey\Uuid\Uuid;

	class AuthController
    {
		function login(Request $request)
		{
			Validation::validate([
				"username" => [ "required", ["min_length" => 3] ],
				"password" => [ "required" ]
            ], $request);

			$username = $request->get("username");
			$password = $request->get("password");

            $result = UserModel::get_users_by([ "username" => $username, "password" => $password ], useOROperator: false);

            if ( count($result) === 0 ) {
				error_response(Translation::translate("invalid_login_credentials"), 401);
			}

			$tokens = generate_token($result[0]->id, true);
			echo json_encode([ "success" => true, "data" => [ "access_token" => $tokens["accessToken"], "refresh_token" => $tokens["refreshToken"] ] ]);
		}

		function register(Request $request)
		{
			$name = $request->get("name");
			$email = $request->get("email");
			$username = $request->get("username");
			$password = $request->get("password");

			Validation::validate([
				"name" => [ "required", [ 'ming_length' => 3 ] ],
				"email" => [ "required", "valid_email" ],
				"username" => [ "required", [ "ming_length" => 3 ] ],
				"password" => [ "required", [ 'ming_length' => 10 ] ],
			], $request);

            $uniqueCheck = UserModel::get_users_by([ "username" => $username, "email" => $email ]);
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

			$result = UserModel::create_account([ $userID, $name, $email, $username, $password, $activationKey ]);

			if ( count($result) === 1 ) {
				$activationLink = "{$_SERVER['REQUEST_SCHEME']}://{$_SERVER["HTTP_HOST"]}/activate/$activationKey";
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

		function activate_account(Request $request, string $activationKey)
		{
			if ( !isset($activationKey) || empty($activationKey) ) {
				error_response(Translation::translate("missing_activation_key"), 400);
			}

            $result = UserModel::get_user_by(["activation_key" => $activationKey]);

			if ( count($result) === 0 || !isset($result[0]->id) ) {
				error_response(Translation::translate("invalid_activation_key"), 400);
			}

			$userData = $result[0];

			if ( $userData->status === '1' ) {
				error_response(Translation::translate("account_already_active"), 400);
			}

            UserModel::update_user(["status" => "1"], ["id" => $userData->id]);
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

			$user = UserModel::get_user_by([ "username" => $emailOrUsername, "email" => $emailOrUsername ], true);

			if ( empty($user) || !isset($user->id) ) {
				error_response(Translation::translate("account_not_found"), 404);
			}

			$passwordActivationCode = generate_random_string(12);

            UserModel::update_user([ "reset_password_code" => $passwordActivationCode, "status" => '0'], ["id" => $user->id]);

			$emailBody = Translation::translate('reset_password_body');
			$url = "{$_SERVER['REQUEST_SCHEME']}://{$_SERVER['HTTP_HOST']}/reset_password/$passwordActivationCode";
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

            $user = UserModel::get_user_by(["reset_password_code" => $resetCode], true);
			if ( empty($user) || !isset($user->id) ) {
				error_response(Translation::translate("invalid_reset_code"), 400);
			}

			Validation::validate([
				"password" => [ "required", [ "min_length" => 10 ] ],
			], $request);

            UserModel::update_user([
                "password" => $request->get("password"),
                "reset_password_code" => null,
                "status" => "1"
            ],[
                "id" => $user->id
            ]);

			echo json_encode([
				"success" => true,
			]);
		}
	}
