<?php


	class Logger
	{
		public static function log(string $message = "") {
			if (is_dir($_SERVER["DOCUMENT_ROOT"] . "/logs") === false) {
				mkdir($_SERVER["DOCUMENT_ROOT"] . "/logs", 0644);
			}

			$handle = fopen($_SERVER["DOCUMENT_ROOT"] . "/logs/log.txt", "a+");
			fwrite($handle, $message . "\n");
			fclose($handle);
		}

		public static function log_network_request(string $message, array|object|null $response = NULL) {
			if (is_dir($_SERVER["DOCUMENT_ROOT"] . "/logs") === false) {
				mkdir($_SERVER["DOCUMENT_ROOT"] . "/logs", 0644);
			}

			$handle = fopen($_SERVER["DOCUMENT_ROOT"] . "/logs/log.txt", "a+");
			fwrite($handle, "=====================================================\n");
			fwrite($handle, "Date: " . date("Y-m-d H:i:s") . "\n");
			fwrite($handle, "IP: {$_SERVER["REMOTE_ADDR"]}\n");
			fwrite($handle, "Request method: {$_SERVER["REQUEST_METHOD"]}\n");
			fwrite($handle, "Request params: \n" . json_encode($_REQUEST) . "\n");
			if (!is_null($response)) {
				fwrite($handle, "Response: \n" . json_encode($response) . "\n");
			}
			fwrite($handle, $message);
			fwrite($handle, "=====================================================\n");
			fclose($handle);
		}
	}