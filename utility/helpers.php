<?php
	declare(strict_types=1);

	use JetBrains\PhpStorm\NoReturn;

	if (!function_exists("dump")) {
		function dump(array $data, bool $asJSON = true) {
			if ($asJSON === true) {
				echo json_encode($asJSON);
			} else {
				echo "<pre>";
				print_r($data);
				echo "</pre>";
			}
		}
	}

	if (!function_exists("dd")) {
		#[NoReturn] function dd(array $data, bool $asJSON = true) {
			dump($data, $asJSON);
			die(1);
		}
	}

	if (!function_exists("error_response")) {
		#[NoReturn] function error_response(string $message, int $errorCode = -1, string $errorField = "") {
			if ($errorCode === -1) {
				$errorCode = 500;
			}

			header("HTTP/1.1 {$errorCode}");
			echo json_encode([
				"success" => false,
				"data" => [],
				"error" => [
					"message" => $message,
					"field" => $errorField
				]
			]);
			die(1);
		}
	}