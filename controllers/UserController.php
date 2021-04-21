<?php
	/**
	 * Author: Igor Ilić <github@igorilic.net>
	 * Date: 2021-04-21
	 * Project: did-you-buy-it-v2
	 */

	namespace Gac\DidYouBuyIt\controllers;


	use Gac\DidYouBuyIt\utility\classes\Database;
	use Gac\DidYouBuyIt\utility\classes\FileUpload;
	use Gac\DidYouBuyIt\utility\classes\FileUploadPaths;
	use Gac\DidYouBuyIt\utility\classes\Translation;

	class UserController
	{
		function get_user_profile() {
			if (!isset($_SESSION) || !isset($_SESSION["userID"])) {
				error_response(Translation::translate("invalid_token"), 401);
			}

			$userID = $_SESSION["userID"];
			$result = Database::execute_query("SELECT id, name, username, email, image, status FROM users.user WHERE id = ?", [$userID], true);

			if (!isset($result->id)) {
				error_response(Translation::translate("user_not_found"), 404);
			}

			echo json_encode([
								 "success" => true,
								 "data"    => $result,
							 ]);
		}

		function update_user_profile() {
			if (!isset($_SESSION) || !isset($_SESSION["userID"])) {
				error_response(Translation::translate("invalid_token"), 401);
			}

			$userID = $_SESSION["userID"];
			$result = Database::execute_query("SELECT id, name, username, email, image, status FROM users.user WHERE id = ?", [$userID], true);

			if (!isset($result->id)) {
				error_response(Translation::translate("user_not_found"), 404);
			}

			$name = isset($_REQUEST['name']) && $_REQUEST['name'] != '' ? $_REQUEST['name'] : NULL;
			$email = isset($_REQUEST['email']) && $_REQUEST['email'] != '' ? $_REQUEST['email'] : NULL;

			if (is_null($name)) {
				error_response(Translation::translate("required_field"), 400, "name");
			}

			if (is_null($email)) {
				error_response(Translation::translate("required_field"), 400, "email");
			}

			if (filter_var($email, FILTER_VALIDATE_EMAIL) === false) {
				error_response(Translation::translate("invalid_email"), 400, "email");
			}

			$uploadResult = NULL;
			if (isset($_REQUEST["file"])) {
				$uploadResult = FileUpload::upload(FileUploadPaths::USER_PHOTOS, $_REQUEST["file"]);
			}

			Database::execute_query(
				"UPDATE users.user SET name = ?, email = ?, image = ? WHERE id = ?",
				[$name, $email, $uploadResult, $userID]
			);

			echo json_encode(["success" => true]);
		}

		function delete_user_profile() {
			if (!isset($_SESSION) || !isset($_SESSION["userID"])) {
				error_response(Translation::translate("invalid_token"), 401);
			}

			$userID = $_SESSION["userID"];
			$result = Database::execute_query("SELECT id, name, username, email, image, status FROM users.user WHERE id = ?", [$userID], true);

			if (!isset($result->id)) {
				error_response(Translation::translate("user_not_found"), 404);
			}

			Database::execute_query("DELETE FROM users.user WHERE id = ?", [$userID]);

			echo json_encode(["success" => true]);
		}

		function filter_users() {
			if (!isset($_SESSION) || !isset($_SESSION["userID"])) {
				error_response(Translation::translate("invalid_token"), 401);
			}

			$search = $_REQUEST['search'] ?? NULL;

			if (empty($search)) {
				error_response(Translation::translate("required_field"), 400, "search");
			}

			$search = "%{$search}%";

			$result = Database::execute_query("
				SELECT id, name, username, email, image, status FROM users.user
				WHERE username LIKE ? OR email LIKE ? OR name LIKE ?
				LIMIT 50
			", [$search, $search, $search]);

			echo json_encode([
								 "success" => true,
								 "data"    => $result,
							 ]);
		}
	}