<?php
	/**
	 * Author: Igor Ilić <github@igorilic.net>
	 * Date: 2021-04-21
	 * Project: did-you-buy-it-v2
	 */

	namespace Gac\DidYouBuyIt\controllers;


	use Gac\DidYouBuyIt\models\ListItemModel;
	use Gac\DidYouBuyIt\utility\classes\FileUpload;
	use Gac\DidYouBuyIt\utility\classes\FileUploadPaths;
	use Gac\DidYouBuyIt\utility\classes\Translation;
	use Gac\DidYouBuyIt\utility\classes\Validation;
	use Gac\Routing\Request;

	class ListItemController
	{
		/**
			* Swagger doc block
			*
			* @OA\Get(
			* path="list/item/{listID}",
			* summary="Find list items by list id",
			* @OA\Parameter(
			*		name="listID",
			* 	in= "path",
			* 	description="Identifier of the list to fetch items from",
			* 	required=true,
			* 	type="string",
			* 	style="form"
			*	),
			* @OA\Response(
			*		response=200,
      *   description="successful operation",
			*		@OA\Schema(
 			*   	schema = "ListItem",
 			*  		properties= {
			*		  	@OA\Property(property="id", type="string"),
			* 	}
		  * ),
			* ),
			*	@OA\Response(
			* 	response="401",
			*   description="Invalid token",
		  * ),
			*)
			*/

		public function get_list_items(string $listID)
		{
			if ( !isset($_SESSION) || !isset($_SESSION['userID']) ) {
				error_response(Translation::translate('invalid_token'), 401);
			}

			$userID = $_SESSION["userID"];
			has_access_to_list($listID, $userID);

			$result = ListItemModel::get_list_items($listID);
			echo json_encode([ "success" => true, "data" => $result ]);
		}

		/**
			* Swagger doc block
			*
			* @OA/Post(
			* path="list/item/{listID}",
			* summary = "Add a new list item",
			* @OA\RequestBody(
     	* 	required=true,
			* 	@OA\Property(
			*  		description = "List item to be added",
			*  		name = "name",
			*  		type = "string",
			*  		in = "body",
			*  		required = true,
			*  		minLength = 3,
			*  		maxLength = 250
			* 	),
			* 	@OA\Property(
			*  		description = "Is the item repeating",
			*  		name = "is_repeating",
			*  		type = "integer",
			*  		in = "body",
			*  		required = true
			* 	),
			* 	@OA\Property(
			*  		description = "Image file to upload for the list item",
			*  		name = "name",
			*  		type = "string",
			*			format = "file",
			*  		in = "body",
			*  		required=false
			* 	),
			* ),
			*	@OA\Response(
			* 	response="401",
			*   description="Invalid token",
		  * ),
			*)
		  */
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
			$is_repeating = $request->get("is_repeating") ?? false;

			$image = NULL;
			if ( isset($_REQUEST['file']) ) {
				$image = FileUpload::upload(FileUploadPaths::LIST_PHOTOS, $_REQUEST['file']);
			}

			$result = ListItemModel::add_item_to_list($listID, $userID, $name, $is_repeating, $image);
			$item = ListItemModel::get_list_item($result->id);
			echo json_encode([ "success" => true, "data" => $item ]);
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

			$item = ListItemModel::get_list_item($itemID);

			if ( !$item || !isset($item->id) ) {
				error_response(Translation::translate('list_item_not_found'), 404);
			}

			$name = $request->get('name');
			$isRepeating = $request->get('is_repeating');

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

			ListItemModel::update_list_item($name, $image, $isRepeating, $itemID);
			$item = ListItemModel::get_list_item($itemID);
			echo json_encode([ 'success' => true, "data" => $item ]);
		}

		public function delete_list_item(string $listID, string $itemID)
		{
			if ( !isset($_SESSION) || !isset($_SESSION['userID']) ) {
				error_response(Translation::translate('invalid_token'), 401);
			}

			$userID = $_SESSION['userID'];
			$list = has_access_to_list($listID, $userID);

			$item = ListItemModel::get_list_item($itemID);

			if ( !$item || !isset($item->id) ) {
				error_response(Translation::translate("list_item_not_found"), 404);
			}

			if ( $list->userid !== $userID && $item->userid !== $userID ) {
				error_response(Translation::translate('only_owner_can_delete_this_item'), 403);
			}

			ListItemModel::delete_list_item($itemID);

			if ( isset($item->image) && !is_null($item->image) ) {
				if ( file_exists($item->image) ) {
					unlink($item->image);
				}
			}

			echo json_encode([ "success" => true ]);
		}

		public function update_list_item_bought_state(string $listID, string $itemID)
		{
			if ( !isset($_SESSION) || !isset($_SESSION['userID']) ) {
				error_response(Translation::translate('invalid_token'), 401);
			}


			$userID = $_SESSION['userID'];
			has_access_to_list($listID, $userID);

			$item = ListItemModel::get_list_item($itemID);
			if ( !$item || !isset($item->id) ) {
				error_response(Translation::translate('list_item_not_found'), 404);
			}

			$purchasedAt = is_null($item->purchased_at) ? date("c") : NULL;
			$purchasedUserID = is_null($item->purchaseduserid) ? $userID : NULL;

			//TODO: Check how the purchasedAt is being handled if sent in date format
			ListItemModel::update_bought_state($purchasedAt, $purchasedUserID, $itemID);
			$item = ListItemModel::get_list_item($itemID);
			echo json_encode([ "success" => true, "data" => $item ]);
		}

		public function delete_list_item_image(string $listID, string $itemID)
		{
			if ( !isset($_SESSION) || !isset($_SESSION['userID']) ) {
				error_response(Translation::translate('invalid_token'), 401);
			}

			$userID = $_SESSION['userID'];
			has_access_to_list($listID, $userID);

			$item = ListItemModel::get_list_item($itemID);

			if ( !$item || !isset($item->id) ) {
				error_response(Translation::translate('list_item_not_found'), 404);
			}

			if ( isset($item->image) && !is_null($item->image) ) {
				if ( file_exists($item->image) ) {
					unlink($item->image);
				}
			}

			ListItemModel::remove_item_image($itemID);
			echo json_encode([ "success" => true ]);
		}
	}
