<?php


	class Translation
	{
		private static Translation|null $instance = NULL;

		public static function getInstance(): Translation {
			if (self::$instance == NULL) {
				self::$instance = new Translation();
			}

			return self::$instance;
		}

		public static function translate(string $key, bool $capitalized = true, string $language = "eng"): string {
			$translationFilePath = $_SERVER["DOCUMENT_ROOT"] . "/languages/{$language}.json";
			if (!file_exists($translationFilePath)) {
				error_response("Translation file for language '{$language}' doesn't exist.");
			}

			$translations = json_decode(file_get_contents($translationFilePath), true);

			if (is_null($translations[$key])) {
				error_response("***no_translation({$language}, {$key})***");
			}

			$translatedString = $translations[$key];

			if ($capitalized === false) return $translatedString;

			return self::mb_ucfirst($translatedString);

		}

		private static function mb_ucfirst($string): string {
			$encoding = "UTF-8";
			$strlen = mb_strlen($string, $encoding);
			$firstChar = mb_substr($string, 0, 1, $encoding);
			$then = mb_substr($string, 1, $strlen - 1, $encoding);
			return mb_strtoupper($firstChar, $encoding) . $then;
		}
	}

