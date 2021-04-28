<?php
    /*
     * Author: Igor Ilić <github@igorilic.net>
     * Date: 2021-04-08
     * Project: did-you-buy-it-v2
     */

    declare(strict_types=1);

    namespace Gac\DidYouBuyIt\models;

    use Gac\DidYouBuyIt\utility\classes\Database;
	use Ramsey\Uuid\Uuid;

    class ListModel{

        public static function get_user_lists(string $userID, int $limit, int $page){
			if ( $page < 0 ) {
				$page = 0;
			}

			if ( $limit > 50 ) {
				$limit = 100;
            }else if(empty($limit) || $limit < 0){
                $limit = 10;
            }

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
					SELECT listid, COUNT(userid) AS cntUsers
					FROM lists.list_user
					GROUP BY listid
				) AS lu ON lu.listid = l.id
				LEFT JOIN lists.list_user AS llu ON l.id = llu.listid
				WHERE l.userid = ? OR llu.userid = ?
				ORDER BY l.created_at DESC
				LIMIT ? OFFSET ?;
			";
            return Database::execute_query($query, [ $userID, $userID, $limit, ( $page * $limit ) ]);
        }

        public static function get_list(string $listID){
			return Database::execute_query("SELECT * FROM lists.list WHERE id = ?", [ $listID ], true);
        }

        public static function get_list_fn(string $listID, string $userID){
			return Database::execute_query("SELECT * FROM lists.fngetlist(?,?)", [ $listID, $userID ]);
        }

        public static function create_list(string $name, string $userID){
			Database::execute_query("INSERT INTO lists.list (id, userid, name) VALUES (?,?,?)", [ Uuid::uuid4(), $userID, $name ]);
        }

        public static function update_list(string $name, string $listID){
			Database::execute_query("UPDATE lists.list SET name = ? WHERE id = ? ", [ $name, $listID ]);
        }

        public static function delete_list(string $listID){
            $listItems = Database::execute_query("SELECT id, image FROM lists.list_item WHERE listid = ?", [$listID]);

            foreach($listItems as $item){
                if(!empty($item->image)){
                    $path = $_SERVER['DOCUMENT_ROOT'] . $item->image;
                    if(file_exists($path)){
                        unlink($path);
                    }
                }
            }

			Database::execute_query("DELETE FROM lists.list WHERE id = ?", [ $listID ]);
        }
    }
