<?php
	declare(strict_types=1);

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

		public static function getInstance(): Database {
			if (self::$instance == NULL) {
				self::$instance = new Database(
					$_ENV["PG_HOST"],
					intval($_ENV["PG_PORT"]),
					$_ENV["PG_DATABASE"],
					$_ENV["PG_USERNAME"],
					$_ENV["PG_PASSWORD"]
				);
			}

			return self::$instance;
		}

		public static function execute_query(string $query, array $params = []): array {
			$db = Database::getInstance()->db;
			$stm = $db->prepare($query);

			if (count($params) > 0) {
				$stm->execute($params);
			} else {
				$stm->execute();
			}

			return $stm->fetchAll(PDO::FETCH_OBJ);
		}
	}
