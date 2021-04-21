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
	use Gac\DidYouBuyIt\utility\classes\Validation;
	use Gac\Routing\Request;
	use Ramsey\Uuid\Uuid;

	class ListItemController
	{
		public function get_list_items(Request $request, string $listID)
		{
			if ( !isset($_SESSION) || !isset($_SESSION['userID']) ) {
				error_response(Translation::translate('invalid_token'), 401);
			}

			$userID = $_SESSION["userID"];
			has_access_to_list($listID, $userID);

			$query = "SELECT 
						   li.*, u.name AS creator_name, pu.name AS purchase_name, l.name AS list_name
					FROM lists.list_item AS li
					LEFT JOIN users.user AS u ON li.userid = u.id
					LEFT JOIN users.user AS pu ON li.purchaseduserid = pu.id
					LEFT JOIN lists.list AS l on li.listid = l.id
					WHERE li.listid = ?";

			$result = Database::execute_query($query, [ $listID ]);
			echo json_encode([ "success" => true, "data" => $result ]);
		}

		public function add_new_list_item(Request $request, string $listID)
		{
			if ( !isset($_SESSION) || !isset($_SESSION['userID']) ) {
				error_response(Translation::translate('invalid_token'), 401);
			}

			$userID = $_SESSION['userID'];
			has_access_to_list($listID, $userID);

			Validation::validate([
				"name" => [ "required", [ "min_length" => 3 ], [ "max_length" => 250 ] ],
				"is_repeating" => [ "required", "numeric" ],
			], $request);

			$name = $request->get("name");
			$is_repeating = $request->get("is_repeating");

			$image = NULL;
			if ( isset($_REQUEST['file']) ) {
				$image = FileUpload::upload(FileUploadPaths::LIST_PHOTOS, $_REQUEST['file']);
			}

			$query = "INSERT INTO lists.list_item (id, listid, userid, purchaseduserid, name, image, is_repeating, purchased_at)
					  VALUES(?, ?, ?, ?, ?, ?, ?, ?)";

			Database::execute_query($query, [ Uuid::uuid4(), $listID, $userID, NULL, $name, $image, $is_repeating, NULL ]);
			echo json_encode([ "success" => true ]);
		}

		public function update_list_item(Request $request, string $listID, string $itemID)
		{
			if ( !isset($_SESSION) || !isset($_SESSION['userID']) ) {
				error_response(Translation::translate('invalid_token'), 401);
			}
			$userID = $_SESSION['userID'];

			Validation::validate([
				'listID' => [ [ 'valid_uuid' => $listID ] ],
				'userID' => [ [ 'valid_uuid' => $userID ] ],
				'itemID' => [ [ 'valid_uuid' => $itemID ] ],
				'name' => [ 'required', [ 'min_length' => 3 ], [ 'max_length' => 250 ] ],
				'is_repeating' => [ 'required', 'numeric' ],
			], $request);

			has_access_to_list($listID, $userID);

			$item = Database::execute_query('SELECT * FROM lists.list_item WHERE id = ?', [ $itemID ], true);

			if ( !$item || !isset($item->id) ) {
				error_response(Translation::translate('list_item_not_found'), 404);
			}

			$name = $request->get('name');
			$is_repeating = $request->get('is_repeating');

			$image = NULL;
			if ( isset($_REQUEST['file']) ) {
				$image = FileUpload::upload(FileUploadPaths::LIST_PHOTOS, $_REQUEST['file']);
			}

			if ( !is_null($image) ) {
				if ( isset($item->image) && !is_null($item->image) ) {
					if ( file_exists($item->image) ) {
						unlink($item->image);
					}
				}
			}

			$query = 'UPDATE lists.list_item SET 
                           name = ?, 
                           image = COALESCE(?, image), 
                           is_repeating = ?
                      WHERE id = ?';

			Database::execute_query($query, [ $name, $image, $is_repeating, $itemID ]);
			echo json_encode([ 'success' => true ]);
		}

		public function delete_list_item(Request $request, string $listID, string $itemID)
		{
			if ( !isset($_SESSION) || !isset($_SESSION['userID']) ) {
				error_response(Translation::translate('invalid_token'), 401);
			}

			$userID = $_SESSION['userID'];
			$list = has_access_to_list($listID, $userID);

			$item = Database::execute_query("SELECT * FROM lists.list_item WHERE id = ?", [ $itemID ], true);

			if ( !$item || !isset($item->id) ) {
				error_response(Translation::translate("list_item_not_found"), 404);
			}

			if ( $list->userid !== $userID && $item->userid !== $userID ) {
				error_response(Translation::translate('only_owner_can_delete_this_item'), 403);
			}

			Database::execute_query("DELETE FROM lists.list_item WHERE id = ?", [ $itemID ]);

			if ( isset($item->image) && !is_null($item->image) ) {
				if ( file_exists($item->image) ) {
					unlink($item->image);
				}
			}

			echo json_encode([ "success" => true ]);
		}

		public function update_list_item_bought_state(Request $request, string $listID, string $itemID)
		{
			if ( !isset($_SESSION) || !isset($_SESSION['userID']) ) {
				error_response(Translation::translate('invalid_token'), 401);
			}

			$userID = $_SESSION['userID'];
			has_access_to_list($listID, $userID);

			$item = Database::execute_query('SELECT * FROM lists.list_item WHERE id = ?', [ $itemID ], true);

			if ( !$item || !isset($item->id) ) {
				error_response(Translation::translate('list_item_not_found'), 404);
			}

			$purchasedAt = is_null($item->purchased_at) ? time() : NULL;
			$purchasedUserID = is_null($item->purchaseduserid) ? $userID : NULL;

			Database::execute_query("UPDATE lists.list_item SET purchased_at = ?, purchaseduserid = ? WHERE id = ?", [ $purchasedAt, $purchasedUserID, $itemID ]);

			echo json_encode([ "success" => true ]);
		}

		public function delete_list_item_image(Request $request, string $listID, string $itemID)
		{
			if ( !isset($_SESSION) || !isset($_SESSION['userID']) ) {
				error_response(Translation::translate('invalid_token'), 401);
			}

			$userID = $_SESSION['userID'];
			has_access_to_list($listID, $userID);

			$item = Database::execute_query('SELECT * FROM lists.list_item WHERE id = ?', [ $itemID ], true);

			if ( !$item || !isset($item->id) ) {
				error_response(Translation::translate('list_item_not_found'), 404);
			}

			if ( isset($item->image) && !is_null($item->image) ) {
				if ( file_exists($item->image) ) {
					unlink($item->image);
				}
			}

			Database::execute_query("UPDATE lists.list_item SET image = null WHERE id = ?", [ $itemID ]);
			echo json_encode([ "success" => true ]);
		}
	}