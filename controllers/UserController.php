<?php
	/**
	 * Author: Igor Ilić <github@igorilic.net>
	 * Date: 2021-04-21
	 * Project: did-you-buy-it-v2
	 */

	namespace Gac\DidYouBuyIt\controllers;


    use Gac\DidYouBuyIt\models\UserModel;
	use Gac\DidYouBuyIt\utility\classes\Database;
	use Gac\DidYouBuyIt\utility\classes\FileUpload;
	use Gac\DidYouBuyIt\utility\classes\FileUploadPaths;
	use Gac\DidYouBuyIt\utility\classes\Translation;
	use Gac\DidYouBuyIt\utility\classes\Validation;
    use Gac\Routing\Request;

	class UserController
	{
		function get_user_profile()
		{
			if ( !isset($_SESSION) || !isset($_SESSION["userID"]) ) {
				error_response(Translation::translate("invalid_token"), 401);
			}

			$userID = $_SESSION["userID"];
            $result = UserModel::get_users_by(["id" => $userID], true);

			if ( !isset($result->id) ) {
				error_response(Translation::translate("user_not_found"), 404);
			}

			echo json_encode([
				"success" => true,
				"data" => $result,
			]);
		}

		function update_user_profile(Request $request)
		{
			if ( !isset($_SESSION) || !isset($_SESSION["userID"]) ) {
				error_response(Translation::translate("invalid_token"), 401);
			}

			$userID = $_SESSION["userID"];
            $result = UserModel::get_users_by(["id" => $userID], true);

			if ( !isset($result->id) ) {
				error_response(Translation::translate("user_not_found"), 404);
			}

            Validation::validate([
                "name" => ["required"],
                "email" => ["required", "valid_email"]
            ], $request);

			$name = $request->get("name");
			$email = $request->get("email");

			$uploadResult = NULL;
			if ( isset($_REQUEST["file"]) ) {
				$uploadResult = FileUpload::upload(FileUploadPaths::USER_PHOTOS, $_REQUEST["file"]);
			}

            UserModel::update_user(
                ["name" => $name, "email" => $email, "image" => $uploadResult],
                ["id" => $result->id]
            );
			echo json_encode([ "success" => true ]);
		}

		function delete_user_profile()
		{
			if ( !isset($_SESSION) || !isset($_SESSION["userID"]) ) {
				error_response(Translation::translate("invalid_token"), 401);
			}

			$userID = $_SESSION["userID"];
            $result = UserModel::get_users_by(["id" => $userID], true);

			if ( !isset($result->id) ) {
				error_response(Translation::translate("user_not_found"), 404);
			}

            UserModel::delete_user($userID);

			echo json_encode([ "success" => true ]);
		}

		function filter_users(Request $request)
		{
			if ( !isset($_SESSION) || !isset($_SESSION["userID"]) ) {
				error_response(Translation::translate("invalid_token"), 401);
			}

            Validation::validate([
                "search" => ["required"]
            ], $request);

			$search = $request->get("search");
			$search = "$search%";

            $result = UserModel::filter_users($search);

			echo json_encode([
				"success" => true,
				"data" => $result,
			]);
		}
	}
