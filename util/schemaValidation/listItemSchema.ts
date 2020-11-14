import {SchemaValidator} from "../types";
import {ValidatorsSchema} from "express-validator/src/middlewares/schema";

export const newListItemSchema: SchemaValidator = {
	listID: {
		in: ["params"],
		isInt: true,
		toInt: true
	} as ValidatorsSchema,
	name: {
		notEmpty: {
			errorMessage: "Item name can't be empty"
		},
		isString: true
	} as ValidatorsSchema,
	is_repeating: {
		notEmpty: {
			errorMessage: "Item "
		},
		isString: true,
	} as ValidatorsSchema
};

export const editListItemSchema: SchemaValidator = {
	...newListItemSchema,
	itemID: {
		in: ["params"],
		isInt: true,
		toInt: true,
	} as ValidatorsSchema
}

export const deleteListItemSchema = {
	listID: {
		in: ["params"],
		isInt: true,
		toInt: true
	} as ValidatorsSchema,
	itemID: {
		in: ["params"],
		isInt: true,
		toInt: true,
	} as ValidatorsSchema
};
