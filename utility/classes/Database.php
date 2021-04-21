<?php
	declare(strict_types=1);

	namespace Gac\DidYouBuyIt\utility\classes;

	use PDO;

	class Database
	{
		private static Database|null $instance = NULL;
		private PDO $db;

		private function __construct(
			string $db_host,
			int $db_port,
			string $db_name,
			string $db_user,
			string $db_password
		) {
			$this->db = new PDO("pgsql:dbname={$db_name} host={$db_host} port={$db_port}", $db_user, $db_password);
			$this->db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
		}

		public static function getInstance(
			?string $db_host = NULL,
			?int $db_port = NULL,
			?string $db_name = NULL,
			?string $db_user = NULL,
			?string $db_password = NULL
		): Database {
			if (self::$instance == NULL) {
				$db_host = $db_host ?? $_ENV["POSTGRES_HOST"];
				$db_port = $db_port ?? intval($_ENV["POSTGRES_PORT"]);
				$db_name = $db_name ?? $_ENV["POSTGRES_DATABASE"];
				$db_user = $db_user ?? $_ENV["POSTGRES_USERNAME"];
				$db_password = $db_password ?? $_ENV["POSTGRES_PASSWORD"];
				self::$instance = new Database(
					$db_host,
					$db_port,
					$db_name,
					$db_user,
					$db_password
				);
			}

			return self::$instance;
		}

		public static function execute_query(string $query, array $params = [], bool $singleResult = false): array|object {
			$db = Database::getInstance()->db;
			$stm = $db->prepare($query);

			if (count($params) > 0) {
				$stm->execute($params);
			} else {
				$stm->execute();
			}

			$result = $stm->fetchAll(PDO::FETCH_OBJ);
			return $singleResult === false ? $result : $result[0] ?? [];
		}
	}
