<?php
	/**
	 * Author: Igor Ilić <github@igorilic.net>
	 * Date: 2021-04-08
	 * Project: did-you-buy-it-v2
	 */

	declare( strict_types=1 );

	namespace Gac\DidYouBuyIt\models;

	use Gac\DidYouBuyIt\utility\classes\Database;
	use Ramsey\Uuid\Uuid;

	class ListItemModel
	{

		public static function get_list_items(string $listID): array
		{
			return Database::execute_query("
			SELECT 
				   li.*, u.name AS creator_name, pu.name AS purchase_name, l.name AS list_name
			FROM lists.list_item AS li
			LEFT JOIN users.user AS u ON li.userid = u.id
			LEFT JOIN users.user AS pu ON li.purchaseduserid = pu.id
			LEFT JOIN lists.list AS l on li.listid = l.id
			WHERE li.listid = ?", [ $listID ]);
		}

		public static function add_item_to_list(
			string $listID,
			string $userID,
			string $name,
			bool $isRepeating = false,
			?string $image = NULL,
			?string $purchasedUserID = NULL,
			?string $purchasedAt = NULL
		)
		{
			$query = 'INSERT INTO lists.list_item (id, listid, userid, purchaseduserid, name, image, is_repeating, purchased_at)
					  VALUES(?, ?, ?, ?, ?, ?, ?, ?)';

			$data = [ Uuid::uuid4(), $listID, $userID, $purchasedUserID, $name, $image, $isRepeating ? "true" : "false", $purchasedAt ];
			//dump($data);
			Database::execute_query($query, $data);
		}

		public static function get_list_item(string $itemID): object|array
		{
			return Database::execute_query('SELECT * FROM lists.list_item WHERE id = ?', [ $itemID ], true);
		}

		public static function update_list_item(string $name, ?string $image, mixed $isRepeating, string $itemID)
		{
			Database::execute_query('UPDATE lists.list_item SET 
                           name = ?, 
                           image = COALESCE(?, image), 
                           is_repeating = ?
                      WHERE id = ?', [ $name, $image, $isRepeating, $itemID ]);
		}

		public static function delete_list_item(string $itemID)
		{
			Database::execute_query('DELETE FROM lists.list_item WHERE id = ?', [ $itemID ]);
		}

		public static function update_bought_state(int|string $purchasedAt, mixed $purchasedUserID, string $itemID)
		{
			Database::execute_query('UPDATE lists.list_item SET purchased_at = ?, purchaseduserid = ? WHERE id = ?', [ $purchasedAt, $purchasedUserID, $itemID ]);
		}

		public static function remove_item_image(string $itemID)
		{
			Database::execute_query("UPDATE lists.list_item SET image = null WHERE id = ?", [ $itemID ]);
		}

	}
