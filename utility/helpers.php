<?php
	declare(strict_types=1);

	use Firebase\JWT\JWT;
	use JetBrains\PhpStorm\ArrayShape;
	use JetBrains\PhpStorm\NoReturn;

	if (!function_exists("dump")) {
		function dump(array $data, bool $asJSON = true) {
			if ($asJSON === true) {
				echo json_encode($data);
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

	if (!function_exists("generate_token")) {
		#[ArrayShape(["accessToken" => "string", "refreshToken" => "null|string"])] function generate_token(string $userID, bool $generateRefreshToken = false): array {
			$currentTime = time();

			$payload = array(
				"iss" => $_SERVER['HTTP_HOST'],
				"aud" => $_SERVER['HTTP_HOST'],
				"iat" => $currentTime,
				"nbf" => $currentTime,
				"jti" => $userID,
			);

			$accessTokenPayload = $payload;
			$accessTokenPayload["exp"] = strtotime(date('Y-m-d H:i:s', strtotime(' + 10 minutes')));
			$accessToken = JWT::encode($accessTokenPayload, $_ENV["JWT_KEY"]);
			$refreshToken = NULL;
			if ($generateRefreshToken === true) {
				$refreshToken = JWT::encode($payload, $_ENV["JWT_KEY"]);
			}

			return [
				"accessToken" => $accessToken,
				"refreshToken" => $refreshToken
			];
		}
	}

	if (!function_exists("decode_token")) {
		function decode_token(): bool {
			if (!preg_match('/Bearer Request =>\s(\S+)/', $_SERVER['HTTP_AUTHORIZATION'], $matches)) {
				error_response(Translation::translate("missing_token"), 401);
			}

			$token = $matches[1];
			$decoded = JWT::decode($token, $_ENV['JWT_KEY'], array('HS256'));
			$userID = $decoded->jti;

			if (is_null($userID)) {
				error_response(Translation::translate("invalid_token"), 401);
			}

			$_SESSION['userID'] = $userID;
			return true;
		}
	}