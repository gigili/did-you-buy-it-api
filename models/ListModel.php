<?php
	/*
	 * Author: Igor Ilić <github@igorilic.net>
	 * Date: 2021-04-08
	 * Project: did-you-buy-it-v2
	 */

	declare( strict_types=1 );

	namespace Gac\DidYouBuyIt\models;

	use Gac\DidYouBuyIt\utility\classes\Database;
	use Ramsey\Uuid\Uuid;

	class ListModel
	{

		public static function get_user_lists(string $userID, int $limit, int $page): object|array
		{
			if ( $page < 0 ) {
				$page = 0;
			}

			if ( $limit > 50 ) {
				$limit = 100;
			} else if ( empty($limit) || $limit < 0 ) {
				$limit = 10;
			}

			$query = "
				SELECT DISTINCT l.*,
					   COALESCE(lic.cntItems, 0) AS cntItems,
					   (COALESCE(lu.cntUsers, 0) + 1) AS cntUsers,
					   COALESCE(lic.cntBoughtItems, 0) AS cntBoughtItems,
				       lc.color
				FROM lists.list AS l
				LEFT JOIN lists.list_color AS lc ON lc.listid = l.id AND lc.userid = ?
				LEFT JOIN (
					SELECT listid,
						   COUNT(id)                                                  AS cntItems,
						   COUNT(CASE WHEN purchaseduserid IS NULL THEN NULL ELSE 1 END) AS cntBoughtItems
					FROM lists.list_item
					GROUP BY listid
				) AS lic ON lic.listid = l.id
				LEFT JOIN (
					SELECT listid, COUNT(userid) AS cntUsers
					FROM lists.list_user
					GROUP BY listid
				) AS lu ON lu.listid = l.id
				LEFT JOIN lists.list_user AS llu ON l.id = llu.listid
				WHERE l.userid = ? OR llu.userid = ?
				ORDER BY l.created_at DESC
				LIMIT ? OFFSET ?;
			";
			return Database::execute_query($query, [ $userID, $userID, $userID, $limit, ( $page * $limit ) ]);
		}

		public static function get_list(string $listID): object|array
		{
			return Database::execute_query("SELECT * FROM lists.list WHERE id = ?", [ $listID ], true);
		}

		public static function get_list_fn(string $listID, string $userID): object|array
		{
			return Database::execute_query("SELECT * FROM lists.fngetlist(?,?)", [ $listID, $userID ]);
		}

		public static function create_list(string $name, string $userID, ?string $color = NULL): object|array
		{
			$newList = Database::execute_query("INSERT INTO lists.list (id, userid, name) VALUES (?,?,?) RETURNING id", [ Uuid::uuid4(), $userID, $name ], true);

			if ( !is_null($color) && isset($newList->id) ) {
				Database::execute_query("INSERT INTO lists.list_color (userid, listid, color) VALUES (?,?,?) ON CONFLICT (userid,listid) DO UPDATE SET color = excluded.color", [ $userID, $newList->id, $color ]);
			}

			return $newList;
		}

		public static function update_list(string $name, string $listID, ?string $color = NULL)
		{
			Database::execute_query("UPDATE lists.list SET name = ? WHERE id = ? ", [ $name, $listID ]);
			if ( !is_null($color) ) {
				$userID = $_SESSION['userID'];
				Database::execute_query('INSERT INTO lists.list_color (userid, listid, color) VALUES (?,?,?) ON CONFLICT (userid,listid) DO UPDATE SET color = excluded.color', [ $userID, $listID, $color ]);
			}
		}

		public static function delete_list(string $listID)
		{
			$listItems = Database::execute_query("SELECT id, image FROM lists.list_item WHERE listid = ?", [ $listID ]);

			foreach ( $listItems as $item ) {
				if ( !empty($item->image) ) {
					$path = $_SERVER['DOCUMENT_ROOT'] . $item->image;
					if ( file_exists($path) ) {
						unlink($path);
					}
				}
			}

			Database::execute_query("DELETE FROM lists.list WHERE id = ?", [ $listID ]);
		}

		public static function user_in_list(string $listID, string $userID): object|array
		{
			return Database::execute_query("SELECT * FROM lists.list_user WHERE listid = ? AND userid = ?", [ $listID, $userID ], true);
		}

		public static function add_user_to_list(string $listID, string $userID)
		{
			Database::execute_query("INSERT INTO lists.list_user (listid, userid) VALUES (?, ?)", [ $listID, $userID ]);
		}

		public static function remove_user_from_list(string $listID, string $userID)
		{
			Database::execute_query("DELETE FROM lists.list_user WHERE listid = ? AND userid = ?", [ $listID, $userID ]);
		}

		public static function get_list_users(string $listID): array
		{
			return Database::execute_query("
			SELECT u.id, u.name, u.email,u.username, u.image, u.status, 0 AS owner  FROM lists.list_user AS lu
			LEFT JOIN lists.list AS l ON lu.listid = l.id
			LEFT JOIN users.user AS u ON lu.userid = u.id
			WHERE l.id = ? AND u.status = '1'
			UNION ALL
			SELECT u.id, u.name, u.email,u.username, u.image, u.status, 1 AS owner  FROM users.user AS u
			LEFT JOIN lists.list AS l ON u.id = l.userid
			WHERE l.id = ?AND u.status = '1'
			", [ $listID, $listID ]);
		}
	}
