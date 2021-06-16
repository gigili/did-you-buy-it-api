<?php
	declare( strict_types=1 );

	use Firebase\JWT\JWT;
	use Gac\DidYouBuyIt\utility\classes\Database;
	use Gac\DidYouBuyIt\utility\classes\Logger;
	use Gac\DidYouBuyIt\utility\classes\Translation;
	use JetBrains\PhpStorm\ArrayShape;
	use JetBrains\PhpStorm\NoReturn;
	use PHPMailer\PHPMailer\Exception;
	use PHPMailer\PHPMailer\PHPMailer;
	use PHPMailer\PHPMailer\SMTP;

	if ( !function_exists("dump") ) {
        /**
         * Method used for printing out the contents of an object or an array on screen
         *
         * @param array|object $data Array or an object to be printed out on screen
         * @param bool $asJSON Boolean indicating if the output should be in json format
         *
         */
		function dump(array|object $data, bool $asJSON = true)
		{
			if ( $asJSON === true ) {
				echo json_encode($data);
			} else {
				echo "<pre>";
				print_r($data);
				echo "</pre>";
			}
		}
	}

	if ( !function_exists("dd") ) {
        /**
         * Method used as a wrapper around the dump method us for printing out the contents
         * of an object or an array on screen and stopping execution of the code after it
         *
         * @param array|object $data Array or an object to be printed out on screen
         * @param bool $asJSON Boolean indicating if the output should be in json format
         *
         */
		#[NoReturn] function dd(array|object $data, bool $asJSON = true)
		{
			dump($data, $asJSON);
			die(1);
		}
	}

	if ( !function_exists("error_response") ) {
        /**
         * Method used to return a standardised error response from the API
         *
         * @param string $message Error message to be sent in the response
         * @param int $errorCode Error code to be sent in the response
         * @param string $errorField Error field to be sent in the response
         *
         */
		#[NoReturn] function error_response(string $message, int $errorCode = -1, string $errorField = "")
		{
			if ( $errorCode === -1 ) {
				$errorCode = 500;
			}

			header("Content-Type: application/json");
			header("HTTP/1.1 {$errorCode}");
			echo json_encode([
				"success" => false,
				"data" => [],
				"error" => [
					"message" => $message,
					"field" => $errorField,
				],
			]);
			die(1);
		}
	}

    if ( !function_exists("generate_token") ) {
        /**
         * Method used to generate JWT tokens
         *
         * @param string $userID ID of the user for whom the token is being generated
         * @param bool $generateRefreshToken Indicated if the refresh token should be generated and returned as well
         *
         * @return array Returns an array containing the access token and refresh token if $generateRefreshToken is set to True values
         */
		#[ArrayShape( [ "accessToken" => "string", "refreshToken" => "null|string" ] )] function generate_token(string $userID, bool $generateRefreshToken = false): array
		{
			$currentTime = time();

			$payload = array(
				"iss" => $_SERVER['HTTP_HOST'],
				"aud" => $_SERVER['HTTP_HOST'],
				"iat" => $currentTime,
				"nbf" => $currentTime,
				"jti" => $userID,
			);

			$accessTokenPayload = $payload;
			$accessTokenPayload["exp"] = strtotime(date('Y-m-d H:i:s', strtotime(' + 2 hours'))); //strtotime(' + 10 minutes')
			$accessToken = JWT::encode($accessTokenPayload, $_ENV["JWT_KEY"]);
			$refreshToken = NULL;
			if ( $generateRefreshToken === true ) {
				$refreshToken = JWT::encode($payload, $_ENV["JWT_KEY"]);
			}

			return [
				"accessToken" => $accessToken,
				"refreshToken" => $refreshToken,
			];
		}
	}

	if ( !function_exists("decode_token") ) {
        /**
         * Method used to decode a JWT token and extract and save to the session value of a user ID
         */
		function decode_token(): bool
		{
			if ( !preg_match('/Bearer Request =>|Bearer\s(\S+)/', $_SERVER['HTTP_AUTHORIZATION'], $matches) ) {
				error_response(Translation::translate("missing_token"), 401);
			}

			$token = $matches[1];
			$decoded = JWT::decode($token, $_ENV['JWT_KEY'], array( 'HS256' ));
			$userID = $decoded->jti;

			if ( is_null($userID) ) {
				error_response(Translation::translate("invalid_token"), 401);
			}

			$_SESSION['userID'] = $userID;
			return true;
		}
	}

    if ( !function_exists("send_email") ) {
        /**
         * Method used for sending emails from the application
         *
         * @param string $to Email or comma separated email list of recipients
         * @param string $subject Subject of the email
         * @param string $body Body of the email being sent (supports HTML)
         * @param string|null $altBody Text only version of the email body
         * @param array $attachments Array list of files with full paths to them to be attached to the email
         * @param string|null $from Name of the sender (usually name of the app)
         * @param string|array|null $emailTemplate If sent as a string, it will look for an email template file in the assets/emails folder. As an array it expects a propery named file for the email template file and args (key => value list) for any email body values to be replaced
         * @param bool $debug Indicates if the debug will be enabled when sending email to see all the information
         *
         * @return bool Returns true or false to indicated if the email was sent successfully or not
         */
		function send_email(
			string $to,
			string $subject,
			string $body,
			string|null $altBody = NULL,
			array $attachments = [],
			string|null $from = NULL,
			string|array|null $emailTemplate = NULL,
			bool $debug = false
		): bool
		{
			$mail = new PHPMailer(true);

			try {
				//Server settings
				if ( $debug ) $mail->SMTPDebug = SMTP::DEBUG_SERVER;

				$mail->isSMTP();
				$mail->Host = $_ENV["EMAIL_HOST"];
				$mail->SMTPAuth = true;
				$mail->Username = $_ENV["EMAIL_USERNAME"];
				$mail->Password = $_ENV["EMAIL_PASSWORD"];
				$mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
				$mail->Port = $_ENV["EMAIL_PORT"];

				//Recipients
				$mail->setFrom("test@dybi.local", $from ?? 'Did You Buy It?');

				if ( str_contains($to, ",") ) {
					$recipients = explode(",", $to);
					foreach ( $recipients as $recipient ) {
						$mail->addAddress($recipient);
					}
				} else {
					$mail->addAddress($to);
				}

				//Attachments
				if ( count($attachments) > 0 ) {
					foreach ( $attachments as $attachment ) {
						$mail->addAttachment($attachment);
					}
				}

				if ( !is_null($emailTemplate) ) {
					$templateFile = is_array($emailTemplate) ? $emailTemplate["file"] ?? 'default' : $emailTemplate;
					$args = is_array($emailTemplate) ? $emailTemplate["args"] ?? [] : [];

					$emailTemplateFile = $_SERVER["DOCUMENT_ROOT"] . "/assets/emails/{$templateFile}.html";
					if ( file_exists($emailTemplateFile) ) {
						$emailBody = file_get_contents($emailTemplateFile);
						$body = str_replace("{{emailBody}}", $body, $emailBody);

						foreach ( $args as $arg => $value ) {
							$body = preg_replace("/{{{$arg}}}/", $value, $body);
						}
					}

					$altBody = is_array($emailTemplate) ? $emailTemplate["emailPreview"] ?? $altBody : $altBody;
				}

				//Content
				$mail->isHTML(true);
				$mail->Subject = $subject;
				$mail->Body = $body;

				if ( !is_null($altBody) ) $mail->AltBody = $altBody;
				if ( $mail->send() ) return true;

				return false;
			} catch ( Exception $ex ) {
				Logger::log("Failed to send email: {$ex->getMessage()}");
				error_response(Translation::translate("unable_to_send_email"), 500);
			}
		}
	}

	if ( !function_exists("has_access_to_list") ) {
        /**
         * Method used to check if the user has access to a certain list
         *
         * @param string $listID UUID of the list
         * @param string $userID UUID of the user
         *
         * @return object Returns information about the list and the users associated with it
         */
		function has_access_to_list($listID, $userID): object
		{
			$list = Database::execute_query('SELECT * FROM lists.fngetlist(?,?)', [ $listID, $userID ], true);

			$listUsers = json_decode($list->users);

			if ( !in_array($userID, array_map(fn($u) => $u->id, $listUsers)) ) {
				error_response(Translation::translate('not_authorized'), 403);
			}

			return $list;
		}
	}

	if ( !function_exists("generate_random_string") ) {
        /**
         * Method used to generate a random string
         *
         * @param int $length Lenght of the string to be generated
         * @param bool $useSpecialChars Wheter special characters should be included in the string
         *
         * @return string Returns a randomly generated string
         */
		function generate_random_string(int $length = 32, bool $useSpecialChars = false): string
		{
			$characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
			$randomString = '';

			if ( $useSpecialChars ) {
				$characters .= "!@#$.^";
			}

			for ( $i = 0; $i < $length; $i++ ) {
				$index = rand(0, strlen($characters) - 1);
				$randomString .= $characters[$index];
			}

			return $randomString;
		}
	}

	if ( !function_exists("generate_random_number") ) {
        /**
         * Method used to return a randomly generated number in a specified range
         *
         * @param int $min Minimum allowed number to be generated
         * @param int $max Maximum allowed number to be generated
         *
         * @return int Returns a randomly generated number
         */
		function generate_random_number(int $min = 0, int $max = -1): int
		{
			if ( $max < 1 ) $max = getrandmax();
			return rand($min, $max);
		}
	}
