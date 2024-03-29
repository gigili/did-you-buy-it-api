<?php
	/**
	 * Author: Igor Ilić <github@igorilic.net>
	 * Date: 2021-04-21
	 * Project: did-you-buy-it-v2
	 */

	namespace Gac\DidYouBuyIt\controllers;

	use Gac\DidYouBuyIt\models\ListModel;
	use Gac\DidYouBuyIt\models\UserModel;
	use Gac\DidYouBuyIt\utility\classes\Translation;
	use Gac\DidYouBuyIt\utility\classes\Validation;
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

		function get_list(string $listID)
		{
			if ( !isset($_SESSION) || !isset($_SESSION["userID"]) ) {
				error_response(Translation::translate("invalid_token"), 401);
			}

			if ( !isset($listID) || empty($listID) || !Uuid::isValid($listID) ) {
				error_response(Translation::translate("required_field"), 400, "listID");
			}

			$userID = $_SESSION["userID"];

			$list = ListModel::get_list($listID);
			if ( empty($list) || !isset($list->id) ) {
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
				"name" => [ "required" ],
			], $request);

			$name = $request->get("name");
			$color = $request->get("color");
			$userID = $_SESSION["userID"];

			$data = ListModel::create_list($name, $userID, $color);
			$list = (object)[];
			if ( isset($data->id) && $data->id != NULL ) {
				$list = ListModel::get_list($data->id);
			}

			header("HTTP/1.1 201");
			echo json_encode([
				"success" => true,
				"data" => $list,
			]);
		}

		function update_list(Request $request, string $listID)
		{
			if ( !isset($_SESSION) || !isset($_SESSION["userID"]) ) {
				error_response(Translation::translate("invalid_token"), 401);
			}

			Validation::validate([
				"name" => [ "required" ],
			], $request);

			$name = $request->get("name");
			$color = $request->get('color');

			if ( !isset($listID) || empty($listID) || !Uuid::isValid($listID) ) {
				error_response(Translation::translate("required_field"), 400, "listID");
			}

			$userID = $_SESSION["userID"];
			$list = ListModel::get_list($listID);

			if ( empty($list) ) {
				error_response(Translation::translate("list_not_found"), 404);
			}

			if ( $list->userid !== $userID ) {
				//error_response(Translation::translate("not_authorized"), 403);
				ListModel::update_list_color($listID, $color);
				$list = ListModel::get_list($listID);
				echo json_encode([ 'success' => true, 'data' => $list ]);
				return;
			}

			ListModel::update_list($name, $listID, $color);

			$list = ListModel::get_list($listID);
			echo json_encode([ "success" => true, "data" => $list ]);
		}

		function delete_list(string $listID)
		{
			if ( !isset($_SESSION) || !isset($_SESSION["userID"]) ) {
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
				"userID" => [ "required", "valid_uuid" ],
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
				error_response(Translation::translate("cant_add_yourself_to_list"), 405);
			}

			$user = UserModel::get_users_by([ 'id' => $guestID ], true);

			if ( !$user || !isset($user->id) ) {
				//TODO: Fix the error code used for this exception
				error_response(Translation::translate('user_doesnt_exist'), 410);
			}

			$userAssignedToList = ListModel::user_in_list($listID, $guestID);
			if ( !empty($userAssignedToList) ) {
				error_response(Translation::translate("user_already_in_list"), 409);
			}

			ListModel::add_user_to_list($listID, $guestID);

			header("HTTP/1.1 201");
			echo json_encode([ "success" => true, "data" => $user ]);
		}

		function delete_user_from_list(string $listID, string $userID)
		{
			if ( !isset($_SESSION) || !isset($_SESSION["userID"]) ) {
				error_response(Translation::translate("invalid_token"), 401);
			}

			if ( !isset($listID) || empty($listID) || !Uuid::isValid($listID) ) {
				error_response(Translation::translate("required_field"), 400, "listID");
			}

			$guestID = $userID ?? NULL;
			$userID = $_SESSION["userID"];

			$list = ListModel::get_list($listID);

			if ( empty($list) ) {
				error_response(Translation::translate("list_not_found"), 404);
			}

			if ( $list->userid !== $userID && ( $guestID !== $userID ) ) {
				error_response(Translation::translate("not_authorized"), 403);
			}

			if ( empty($guestID) ) {
				error_response(Translation::translate("required_field"), 400, "userID");
			}

			if ( !Uuid::isValid($guestID) ) {
				error_response(Translation::translate("invalid_value"), 400, "userID");
			}

			/*if ( $guestID == $userID ) {
				error_response(Translation::translate("cant_add_yourself_to_list"), 405);
			}*/

			$userAssignedToList = ListModel::user_in_list($listID, $guestID);
			if ( empty($userAssignedToList) ) {
				error_response(Translation::translate("user_not_in_list"), 409);
			}

			ListModel::remove_user_from_list($listID, $guestID);

			echo json_encode([ "success" => true ]);
		}

		function get_list_users(string $listID)
		{
			if ( !isset($_SESSION) || !isset($_SESSION["userID"]) ) {
				error_response(Translation::translate("invalid_token"), 401);
			}

			if ( empty($listID) || !Uuid::isValid($listID) ) {
				error_response(Translation::translate("invalid_value"), 400, "listID");
			}

			$list = ListModel::get_list($listID);

			if ( empty($list) ) {
				error_response(Translation::translate("list_not_found"), 404);
			}

			$listUsers = ListModel::get_list_users($listID);

			echo json_encode([
				"success" => true,
				"data" => $listUsers,
			]);
		}
	}
