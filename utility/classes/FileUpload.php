<?php

	namespace Gac\DidYouBuyIt\utility\classes;

	use JetBrains\PhpStorm\ArrayShape;


	class FileUpload
	{
		private static int $allowedFileSize = ( 1024 * 1024 * 5 ); //5 MB
		#[ArrayShape( [ "image" => "array", "file" => "array" ] )] private static array $allowedFileTypes = [
			"image" => [ "jpg", "jpeg", "png", "bmp" ],
			"file" => [ "pdf", "doc", "docx", "xls", "xlsx" ],
		];

		public static function upload(string $path, array $file): string
		{
			if ( empty($path) ) {
				error_response(Translation::translate("invalid_upload_path"), 500);
			}

			if ( !isset($file) || !isset($file["name"]) ) {
				error_response(Translation::translate("no_file_selected"), 400);
			}

			if ( str_contains($file["type"], "image") ) {
				if ( !in_array(pathinfo($file["name"], PATHINFO_EXTENSION), self::$allowedFileTypes["image"]) ) {
					error_response(Translation::translate("unsupported_file_type"), 400);
				}
			}

			$uploadPath = $_SERVER["DOCUMENT_ROOT"] . "/uploads/{$path}/{$file["name"]}";

			if ( !is_dir(pathinfo($uploadPath, PATHINFO_DIRNAME)) ) {
				mkdir(pathinfo($uploadPath, PATHINFO_DIRNAME), 0755, true);
			}

			$bytes = file_put_contents($uploadPath, $file["content"]);

			if ( $bytes > self::$allowedFileSize ) {
				if ( file_exists($uploadPath) ) {
					unlink($uploadPath);
				}
				error_response(Translation::translate("file_too_large"), 400);
			}

			if ( $bytes !== false ) {
				return str_replace($_SERVER["DOCUMENT_ROOT"], "", $uploadPath);
			} else {
				error_response(Translation::translate("upload_failed"), 500);
			}
		}
	}