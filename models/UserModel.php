<?php
	/**
	 * Author: Igor Ilić <github@igorilic.net>
	 * Date: 2021-04-28
	 * Project: did-you-buy-it-v2
	 */

    namespace Gac\DidYouBuyIt\models;

	use Gac\DidYouBuyIt\utility\classes\Database;
	use Gac\DidYouBuyIt\utility\classes\Translation;

	class UserModel
	{

		public static function get_users_by(array $arguments, bool $singleResult = false, $useOROperator = true): array|object
		{
			$query = "SELECT id, name, email, username, image, status, activation_key FROM users.user WHERE " . PHP_EOL;

			$operator = $useOROperator ? "OR" : "AND";
			foreach ( $arguments as $argument => $value ) {
				$query .= "$argument = ? {$operator} " . PHP_EOL;
			}

			$query = rtrim($query, " $operator " . PHP_EOL);
			return Database::execute_query($query, array_values($arguments), $singleResult);
		}

		public static function create_account(array $arguments): object|array
		{
			$query = "INSERT INTO users.user (id, name, email, username, password, activation_key) VALUES (?, ?, ?, ?, ?, ?)";

			return Database::execute_query($query, $arguments);
		}

		public static function update_user(array $arguments, array $whereCondition): object|array
		{
			$query = "UPDATE users.user SET ";

			foreach ( $arguments as $field => $value ) {
				$query .= "$field = ?, ";
			}

			$query = rtrim($query, ", ");
			$query .= " WHERE 1=1 AND";

			foreach ( $whereCondition as $field => $value ) {
				$query .= " $field = ? AND";
            }
            $query = rtrim($query, " AND");

            $parameters = array_merge(
                array_values($arguments),
                array_values($whereCondition)
            );

            return Database::execute_query(
                $query,
                $parameters
            );
        }

        public static function delete_user(string $userID){
            $user = self::get_users_by(["id" => $userID], true);

            if(!isset($user->id)){
                error_response(Translation::translate("user_not_found"), 404);
            }

			if ( !empty($user->image) ) {
				$path = $_SERVER["DOCUMENT_ROOT"] . $user->image;
				if ( file_exists($path) ) {
					unlink($path);
				}
			}

			Database::execute_query("DELETE FROM users.user WHERE id = ?", [ $userID ]);
		}

		public static function filter_users(string $search): object|array
		{
			return Database::execute_query("
				SELECT id, name, username, email, image, status FROM users.user
				WHERE username LIKE ? OR email LIKE ? OR name LIKE ?
				LIMIT 50
			", [ $search, $search, $search ]);
		}
	}
