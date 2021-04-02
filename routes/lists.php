<?php

	use Ramsey\Uuid\Uuid;

	try {
		function get_users_lists() {
			if (!isset($_SESSION) || !isset($_SESSION["userID"])) {
				error_response(Translation::translate("invalid_token"), 401);
			}

			$userID = $_SESSION["userID"];
			$page = isset($_REQUEST['page']) && $_REQUEST['page'] != '' ? $_REQUEST['page'] : 0;
			$limit = isset($_REQUEST['limit']) && $_REQUEST['limit'] != '' ? $_REQUEST['limit'] : 10;

			if ($page < 0) $page = 0;
			if ($limit > 50) $limit = 100;

			$query = "
				SELECT DISTINCT l.*,
					   COALESCE(lic.cntItems, 0) AS cntItems,
					   (COALESCE(cntUsers, 0) + 1) AS cntUsers,
					   COALESCE(cntBoughtItems, 0) AS cntBoughtItems
				FROM lists.list AS l
				LEFT JOIN (
					SELECT listid,
						   COUNT(id)                                                  AS cntItems,
						   COUNT(CASE WHEN purchaseduserid IS NULL THEN 0 ELSE 1 END) AS cntBoughtItems
					FROM lists.list_item
					GROUP BY listid
				) AS lic ON lic.listid = l.id
				LEFT JOIN (
					SELECT listid, COUNT(userid) as cntUsers
					FROM lists.list_user
					GROUP BY listid
				) AS lu ON lu.listid = l.id
				LEFT JOIN lists.list_user AS llu ON l.id = llu.listid
				WHERE l.userid = ? OR llu.userid = ?
				ORDER BY l.created_at DESC
				LIMIT ? OFFSET ?;
			";
			$result = Database::execute_query($query, [$userID, $userID, $limit, ($page * $limit)]);

			echo json_encode([
				"success" => true,
				"data" => $result
			]);
		}

		function get_list(array $params) {
			if (!isset($_SESSION) || !isset($_SESSION["userID"])) {
				error_response(Translation::translate("invalid_token"), 401);
			}

			if (!isset($params["listID"]) || empty($params["listID"]) || !Uuid::isValid($params["listID"])) {
				error_response(Translation::translate("required_field"), 400, "listID");
			}

			$userID = $_SESSION["userID"];
			$listID = $params["listID"];

			$list = Database::execute_query("SELECT * FROM lists.list WHERE id = ?", [$listID], true);
			if (empty($list)) {
				error_response(Translation::translate("list_not_found"), 404);
			}

			$result = Database::execute_query("SELECT * FROM lists.fngetlist(?,?)", [$listID, $userID]);

			echo json_encode([
				"succes" => true,
				"data" => $result
			]);
		}

		function add_list() {
			if (!isset($_SESSION) || !isset($_SESSION["userID"])) {
				error_response(Translation::translate('invalid_token'), 401);
			}

			$name = $_REQUEST["name"] ?? NULL;

			if (empty($name)) {
				error_response(Translation::translate("required_field"), 400, "name");
			}

			$userID = $_SESSION["userID"];
			Database::execute_query("INSERT INTO lists.list (id, userid, name) VALUES (?,?,?)", [Uuid::uuid4(), $userID, $name]);

			header("HTTP/1.1 201");
			echo json_encode([
				"success" => true,
			]);
		}

		function update_list(array $params) {
			if (!isset($_SESSION) || !isset($_SESSION["userID"])) {
				error_response(Translation::translate("invalid_token"), 401);
			}

			$name = $_REQUEST["name"] ?? NULL;

			if (empty($name)) {
				error_response(Translation::translate("required_field"), 400, "name");
			}

			if (!isset($params["listID"]) || empty($params["listID"]) || !Uuid::isValid($params["listID"])) {
				error_response(Translation::translate("required_field"), 400, "listID");
			}

			$userID = $_SESSION["userID"];
			$listID = $params["listID"];

			$list = Database::execute_query("SELECT * FROM lists.list WHERE id = ?", [$listID], true);

			if (empty($list)) {
				error_response(Translation::translate("list_not_found"), 404);
			}

			if ($list->userid !== $userID) {
				error_response(Translation::translate("not_authorized"), 403);
			}

			Database::execute_query("UPDATE lists.list SET name = ? WHERE id = ? ", [$name, $listID]);

			echo json_encode(["success" => true]);
		}

		function delete_list(array $params) {
			if (isset($_SESSION) || !isset($_SESSION["userID"])) {
				error_response(Translation::translate("invalid_token"), 401);
			}

			if (!isset($params["listID"]) || empty($params["listID"]) || !Uuid::isValid($params["listID"])) {
				error_response(Translation::translate("required_field"), 400, "listID");
			}

			$userID = $_SESSION["userID"];
			$listID = $params["listID"];

			$list = Database::execute_query("SELECT * FROM lists.list WHERE id = ?", [$listID], true);

			if (empty($list)) {
				error_response(Translation::translate("list_not_found"), 404);
			}

			if ($list->userid !== $userID) {
				error_response(Translation::translate("not_authorized"), 403);
			}

			Database::execute_query("DELETE FROM lists.list WHERE id = ?", [$listID]);

			echo json_encode(["success" => true]);
		}

		function add_user_to_list(array $params) {
			if (!isset($_SESSION) || !isset($_SESSION["userID"])) {
				error_response(Translation::translate("invalid_token"), 401);
			}

			if (!isset($params["listID"]) || empty($params["listID"]) || !Uuid::isValid($params["listID"])) {
				error_response(Translation::translate("required_field"), 400, "listID");
			}

			$userID = $_SESSION["userID"];
			$listID = $params["listID"];
			$guestID = $_REQUEST["userID"] ?? NULL;

			$list = Database::execute_query("SELECT * FROM lists.list WHERE id = ?", [$listID], true);

			if (empty($list)) {
				error_response(Translation::translate("list_not_found"), 404);
			}

			if ($list->userid !== $userID) {
				error_response(Translation::translate("not_authorized"), 403);
			}

			if (empty($guestID)) {
				error_response(Translation::translate("required_field"), 400, "userID");
			}

			if (!Uuid::isValid($guestID)) {
				error_response(Translation::translate("invalid_value"), 400, "userID");
			}

			if ($guestID == $userID) {
				error_response(Translation::translate("cant_add_yourself_to_list"));
			}

			$userAssignedToList = Database::execute_query("SELECT * FROM lists.list_user WHERE listid = ? AND userid = ?", [$listID, $guestID], true);
			if (!empty($userAssignedToList)) {
				error_response(Translation::translate("user_already_in_list"));
			}

			Database::execute_query("INSERT INTO lists.list_user (listid, userid) VALUES (?,?)", [$listID, $guestID]);

			header("HTTP/1.1 201");
			echo json_encode(["success" => true]);
		}

		function delete_user_from_list(array $params) {
			if (!isset($_SESSION) || !isset($_SESSION["userID"])) {
				error_response(Translation::translate("invalid_token"), 401);
			}

			if (!isset($params["listID"]) || empty($params["listID"]) || !Uuid::isValid($params["listID"])) {
				error_response(Translation::translate("required_field"), 400, "listID");
			}

			$userID = $_SESSION["userID"];
			$listID = $params["listID"];
			$guestID = $params["userID"] ?? NULL;

			$list = Database::execute_query("SELECT * FROM lists.list WHERE id = ?", [$listID], true);

			if (empty($list)) {
				error_response(Translation::translate("list_not_found"), 404);
			}

			if ($list->userid !== $userID) {
				error_response(Translation::translate("not_authorized"), 403);
			}

			if (empty($guestID)) {
				error_response(Translation::translate("required_field"), 400, "userID");
			}

			if (!Uuid::isValid($guestID)) {
				error_response(Translation::translate("invalid_value"), 400, "userID");
			}

			if ($guestID == $userID) {
				error_response(Translation::translate("cant_add_yourself_to_list"));
			}

			$userAssignedToList = Database::execute_query("SELECT * FROM lists.list_user WHERE listid = ? AND userid = ?", [$listID, $guestID], true);
			if (empty($userAssignedToList)) {
				error_response(Translation::translate("user_not_in_list"), 404);
			}

			Database::execute_query("DELETE FROM lists.list_user WHERE listid = ? AND userid = ?", [$listID, $guestID]);

			echo json_encode(["success" => true]);
		}

		function get_list_users(array $params) {
			if (!isset($_SESSION) || !isset($_SESSION["userID"])) {
				error_response(Translation::translate("invalid_token"), 401);
			}

			$listID = $params["listID"] ?? NULL;
			if (is_null($listID) || !Uuid::isValid($listID)) {
				error_response(Translation::translate("invalid_value"), 400, "listID");
			}

			$list = Database::execute_query("SELECT * FROM lists.list WHERE id = ?", [$listID], true);

			if (empty($list)) {
				error_response(Translation::translate("list_not_found"), 404);
			}

			$listUsers = Database::execute_query("SELECT u.id, u.name, u.email,u.username, u.image, u.status, 0 as owner  FROM lists.list_user AS lu
														LEFT JOIN lists.list AS l on lu.listid = l.id
														LEFT JOIN users.user AS u ON lu.userid = u.id
														WHERE l.id = ? AND u.status = '1'
														UNION ALL
														SELECT u.id, u.name, u.email,u.username, u.image, u.status, 1 as owner  FROM users.user AS u
														LEFT JOIN lists.list AS l ON u.id = l.userid
														WHERE l.id = ?AND u.status = '1'
			", [$listID, $listID]);

			echo json_encode([
				"success" => true,
				"data" => $listUsers
			]);
		}

		$routes->add("/list", "get_users_lists", ["GET"])->middleware(["decode_token"]);
		$routes->add("/list", "add_list", ["POST"])->middleware(["decode_token"]);

		$routes->add("/list/:listID", "get_list", ["GET"])->middleware(["decode_token"]);
		$routes->add("/list/:listID", "update_list", ["PATCH"])->middleware(["decode_token"]);
		$routes->add("/list/:listID", "delete_list", ["DELETE"])->middleware(["decode_token"]);

		$routes->add("/list/:listID/user", "get_list_users", ["GET"])->middleware(["decode_token"]);
		$routes->add("/list/:listID/user", "add_user_to_list", ["POST"])->middleware(["decode_token"]);
		$routes->add("/list/:listID/user/:userID", "delete_user_from_list", ["DELETE"])->middleware(["decode_token"]);
	} catch (Exception $ex) {
		Logger::error("Api Error: {$ex->getMessage()}");
		error_response("Error processing your request", 500);
	}