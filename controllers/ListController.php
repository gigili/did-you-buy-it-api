<?php
	/**
	 * Author: Igor Ilić <github@igorilic.net>
	 * Date: 2021-04-21
	 * Project: did-you-buy-it-v2
	 */

	namespace Gac\DidYouBuyIt\controllers;

    use Gac\DidYouBuyIt\models\ListModel;
	use Gac\DidYouBuyIt\utility\classes\Database;
	use Gac\DidYouBuyIt\utility\classes\Translation;
	use Gac\Routing\Request;
	use Ramsey\Uuid\Uuid;

	class ListController
	{
		function get_users_lists(Request $request)
		{
			if ( !isset($_SESSION) || !isset($_SESSION["userID"]) ) {
				error_response(Translation::translate("invalid_token"), 401);
			}

			$userID = $_SESSION["userID"];
			$page = $request->get("page");
			$limit = $request->get("limit");

            $result = ListModel::get_user_lists($userID, $limit, $page);

			echo json_encode([
				"success" => true,
				"data" => $result,
			]);
		}

		function get_list(Request $request, string $listID)
		{
			if ( !isset($_SESSION) || !isset($_SESSION["userID"]) ) {
				error_response(Translation::translate("invalid_token"), 401);
			}

			if ( !isset($listID) || empty($listID) || !Uuid::isValid($listID) ) {
				error_response(Translation::translate("required_field"), 400, "listID");
			}

			$userID = $_SESSION["userID"];

			$list = ListModel::get_list($listID);
			if ( empty($list) || !isset($list->id)) {
				error_response(Translation::translate("list_not_found"), 404);
			}

            $result = ListModel::get_list_fn($listID, $userID);

			echo json_encode([
				"success" => true,
				"data" => $result,
			]);
		}

		function add_list(Request $request)
		{
			if ( !isset($_SESSION) || !isset($_SESSION["userID"]) ) {
				error_response(Translation::translate('invalid_token'), 401);
			}

            Validation::validate([
                "name" => ["required"]
            ], $request);

			$name = $request->get("name");
            $userID = $_SESSION["userID"];

            ListModel::create_list($name, $userID);

			header("HTTP/1.1 201");
			echo json_encode([
				"success" => true,
			]);
		}

		function update_list(Request $request, string $listID)
		{
			if ( !isset($_SESSION) || !isset($_SESSION["userID"]) ) {
				error_response(Translation::translate("invalid_token"), 401);
			}

            Validation::validate([
                "name" => ["required"]
            ]);

			$name = $request->get("name");

			if ( !isset($listID) || empty($listID) || !Uuid::isValid($listID) ) {
				error_response(Translation::translate("required_field"), 400, "listID");
			}

			$userID = $_SESSION["userID"];
			$list = ListModel::get_list($listID);

			if ( empty($list) ) {
				error_response(Translation::translate("list_not_found"), 404);
			}

			if ( $list->userid !== $userID ) {
				error_response(Translation::translate("not_authorized"), 403);
			}

            ListModel::update_list($name, $listID);

			echo json_encode([ "success" => true ]);
		}

		function delete_list(Request $request, string $listID)
		{
			if ( isset($_SESSION) || !isset($_SESSION["userID"]) ) {
				error_response(Translation::translate("invalid_token"), 401);
			}

			if ( !isset($listID) || empty($listID) || !Uuid::isValid($listID) ) {
				error_response(Translation::translate("required_field"), 400, "listID");
			}

			$userID = $_SESSION["userID"];

			$list = ListModel::get_list($listID);

			if ( empty($list) ) {
				error_response(Translation::translate("list_not_found"), 404);
			}

			if ( $list->userid !== $userID ) {
				error_response(Translation::translate("not_authorized"), 403);
			}

            ListModel::delete_list($listID);

			echo json_encode([ "success" => true ]);
		}

		function add_user_to_list(Request $request, string $listID)
		{
			if ( !isset($_SESSION) || !isset($_SESSION["userID"]) ) {
				error_response(Translation::translate("invalid_token"), 401);
			}

			if ( !isset($listID) || empty($listID) || !Uuid::isValid($listID) ) {
				error_response(Translation::translate("required_field"), 400, "listID");
			}

            Validation::validate([
                "userID" => ["required", "valid_uuid"]
            ], $request);

			$userID = $_SESSION["userID"];
			$guestID = $request->get("userID") ?? NULL;

			$list = ListModel::get_list($listID);

			if ( empty($list) ) {
				error_response(Translation::translate("list_not_found"), 404);
			}

			if ( $list->userid !== $userID ) {
				error_response(Translation::translate("not_authorized"), 403);
			}

			if ( $guestID == $userID ) {
				error_response(Translation::translate("cant_add_yourself_to_list"));
			}

            $userAssignedToList = ListModel::user_in_list($listID, $guestID);
			if ( !empty($userAssignedToList) ) {
				error_response(Translation::translate("user_already_in_list"));
			}

            ListModel::add_user_to_list($listID, $guestID);

			header("HTTP/1.1 201");
			echo json_encode([ "success" => true ]);
		}

		function delete_user_from_list(Request $request, string $listID, string $userID)
		{
			if ( !isset($_SESSION) || !isset($_SESSION["userID"]) ) {
				error_response(Translation::translate("invalid_token"), 401);
			}

			if ( !isset($listID) || empty($listID) || !Uuid::isValid($listID) ) {
				error_response(Translation::translate("required_field"), 400, "listID");
			}

			$guestID = $userID ?? NULL;
			$userID = $_SESSION["userID"];

			$list = Database::execute_query("SELECT * FROM lists.list WHERE id = ?", [ $listID ], true);

			if ( empty($list) ) {
				error_response(Translation::translate("list_not_found"), 404);
			}

			if ( $list->userid !== $userID ) {
				error_response(Translation::translate("not_authorized"), 403);
			}

			if ( empty($guestID) ) {
				error_response(Translation::translate("required_field"), 400, "userID");
			}

			if ( !Uuid::isValid($guestID) ) {
				error_response(Translation::translate("invalid_value"), 400, "userID");
			}

			if ( $guestID == $userID ) {
				error_response(Translation::translate("cant_add_yourself_to_list"));
			}

			$userAssignedToList = Database::execute_query("SELECT * FROM lists.list_user WHERE listid = ? AND userid = ?", [ $listID, $guestID ], true);
			if ( empty($userAssignedToList) ) {
				error_response(Translation::translate("user_not_in_list"), 404);
			}

			Database::execute_query("DELETE FROM lists.list_user WHERE listid = ? AND userid = ?", [ $listID, $guestID ]);

			echo json_encode([ "success" => true ]);
		}

		function get_list_users(Request $request, string $listID)
		{
			if ( !isset($_SESSION) || !isset($_SESSION["userID"]) ) {
				error_response(Translation::translate("invalid_token"), 401);
			}

			if ( empty($listID) || !Uuid::isValid($listID) ) {
				error_response(Translation::translate("invalid_value"), 400, "listID");
			}

			$list = Database::execute_query("SELECT * FROM lists.list WHERE id = ?", [ $listID ], true);

			if ( empty($list) ) {
				error_response(Translation::translate("list_not_found"), 404);
			}

			$listUsers = Database::execute_query("SELECT u.id, u.name, u.email,u.username, u.image, u.status, 0 AS owner  FROM lists.list_user AS lu
														LEFT JOIN lists.list AS l ON lu.listid = l.id
														LEFT JOIN users.user AS u ON lu.userid = u.id
														WHERE l.id = ? AND u.status = '1'
														UNION ALL
														SELECT u.id, u.name, u.email,u.username, u.image, u.status, 1 AS owner  FROM users.user AS u
														LEFT JOIN lists.list AS l ON u.id = l.userid
														WHERE l.id = ?AND u.status = '1'
			", [ $listID, $listID ]);

			echo json_encode([
				"success" => true,
				"data" => $listUsers,
			]);
		}
	}
