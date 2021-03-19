<?php
	declare(strict_types=1);

	use Firebase\JWT\JWT;
	use JetBrains\PhpStorm\ArrayShape;
	use JetBrains\PhpStorm\NoReturn;
	use PHPMailer\PHPMailer\Exception;
	use PHPMailer\PHPMailer\PHPMailer;
	use PHPMailer\PHPMailer\SMTP;

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

	if (!function_exists("send_email")) {
		function send_email(
			string $to,
			string $subject,
			string $body,
			string|null $altBody = NULL,
			array $attachments = [],
			string|null $from = NULL,
			string|null $emailTemplate = NULL,
			bool $debug = false
		): bool {
			$mail = new PHPMailer(true);

			try {
				//Server settings
				if ($debug) $mail->SMTPDebug = SMTP::DEBUG_SERVER;

				$mail->isSMTP();
				$mail->Host = $_ENV["EMAIL_HOST"];
				$mail->SMTPAuth = false;
				/*$mail->Username = $_ENV["EMAIL_USER"];
				$mail->Password = $_ENV["EMAIL_PASSWORD"];
				$mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;*/
				$mail->Port = $_ENV["EMAIL_PORT"];

				//Recipients
				$mail->setFrom("test@dybi.local", $from ?? 'Did You Buy It?');

				if (str_contains($to, ",")) {
					$recipients = explode(",", $to);
					foreach ($recipients as $recipient) {
						$mail->addAddress($recipient);
					}
				} else {
					$mail->addAddress($to);
				}

				//Attachments
				if (count($attachments) > 0) {
					foreach ($attachments as $attachment) {
						$mail->addAttachment($attachment);
					}
				}

				if (!is_null($emailTemplate)) {
					$emailBody = file_get_contents($_SERVER["DOCUMENT_ROOT"] . "/assets/email_templates/{$emailTemplate}.html");
					$body = str_replace("{{email_body}}", $body, $emailBody);
				}

				//Content
				$mail->isHTML(true);
				$mail->Subject = $subject;
				$mail->Body = $body;

				if (!is_null($altBody)) $mail->AltBody = $altBody;
				if ($mail->send()) return true;

				return false;
			} catch (Exception $e) {
				error_response(Translation::translate("unable_to_send_email"), 500);
			}
		}
	}