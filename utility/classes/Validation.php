<?php
	/**
	 * Author: Igor Ilić <github@igorilic.net>
	 * Date: 2021-04-21
	 * Project: did-you-buy-it-v2
	 */

	namespace Gac\DidYouBuyIt\utility\classes;


	use Gac\Routing\Request;
	use Ramsey\Uuid\Uuid;

	/**
	 * Class Validation
	 * @package Gac\DidYouBuyIt\utility\classes
	 */
	class Validation
	{
		public static function validate(array $validation_fields, Request $request): bool
		{
			foreach ( $validation_fields as $field => $rules ) {
				$ruleCondition = NULL;

				foreach ( $rules as $rule ) {
					if ( is_array($rule) ) {
						$ruleCondition = $rule[array_key_first($rule)];
						$rule = array_key_first($rule);
					}

					switch ( $rule ) {
						case 'required':
							self::required_field($field, $request);
							break;

						case "min_length":
							self::min_length($field, $request, $ruleCondition);
							break;

						case "max_length":
							self::max_length($field, $request, $ruleCondition);
							break;

						case "valid_email":
							self::valid_email($field, $request);
							break;

						case "numeric":
							self::numeric($field, $request);
							break;
						case "valid_uuid":
							self::valid_uuid($field, $request, $ruleCondition);
							break;
					}
				}
			}

			return true;
		}

		private static function required_field(string $field, Request $request)
		{
			$value = $request->get($field);

			if ( !is_numeric($value) && empty($value) ) {
				error_response(Translation::translate("required_field"), 400, $field);
			}
		}

		private static function min_length(string $field, Request $request, int $minLength = 0)
		{
			$value = $request->get($field);
			if ( mb_strlen($value) < $minLength ) {
				error_response(Translation::translate('validation_min_length', arguments: [ $minLength ]), 400, $field);
			}
		}

		private static function max_length(string $field, Request $request, int $maxLength = 0)
		{
			$value = $request->get($field);

			if ( mb_strlen($value) > $maxLength ) {
				error_response(Translation::translate('validation_max_length', arguments: [ $maxLength ]), 400, $field);
			}
		}

		private static function valid_email(string $field, Request $request)
		{
			$value = $request->get($field);

			if ( !filter_var($value, FILTER_VALIDATE_EMAIL) ) {
				error_response(Translation::translate("invalid_email"), 400, $field);
			}
		}

		private static function numeric(string $field, Request $request)
		{
			$value = $request->get($field);

			if ( !is_numeric($value) ) {
				error_response(Translation::translate('value_must_be_numeric'), 400, $field);
			}
		}

		private static function valid_uuid(string $field, Request $request, mixed $ruleCondition)
		{
			$value = $request->get($field) ?? $ruleCondition;
			if ( !Uuid::isValid($value) ) {
				error_response(Translation::translate("invalid_id"), 400, $field);
			}
		}
	}