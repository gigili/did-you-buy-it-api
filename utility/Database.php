<?php
	declare(strict_types=1);

	class Database
	{
		private static Database|null $instance = NULL;
		private PDO $db;

		private function __construct(
			private string $db_host,
			private int $db_port,
			private string $db_name,
			private string $db_user,
			private string $db_password
		) {
			$this->db = new PDO("pgsql:dbname={$this->db_name} host={$this->db_host} port={$this->db_port}", $this->db_user, $this->db_password);
			$this->db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
		}

		public static function getInstance(): Database {
			if (self::$instance == NULL) {
				$db_host = "localhost";
				$db_port = 5432;
				$db_name = "dybi";
				$db_user = "postgres";
				$db_password = "postgres";
				self::$instance = new Database($db_host, $db_port, $db_name, $db_user, $db_password);
			}

			return self::$instance;
		}

		public static function execute_query(string $query, array $params = []): array {
			$db = Database::getInstance()->db;
			$db->beginTransaction();
			$stm = $db->prepare($query);

			if (count($params) > 0) {
				$stm->execute($params);
			} else {
				$stm->execute();
			}

			return $stm->fetchAll(PDO::FETCH_OBJ);
		}
	}
