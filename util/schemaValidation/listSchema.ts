import {SchemaValidator} from "../types";
import {ValidatorsSchema} from "express-validator/src/middlewares/schema";

export const listSchema: SchemaValidator = {
	name: {
		isString: true,
		notEmpty: {
			errorMessage: "List name can't be empty."
		}
	} as ValidatorsSchema
}

export const listUpdateSchema: SchemaValidator = {
	...listSchema,
	listID: {
		in: ["body", "params"],
		isInt: true,
		toInt: true
	} as ValidatorsSchema
}


export const listDeleteSchema: SchemaValidator = {
	listID: {
		in: ["body", "params"],
		isInt: true,
		toInt: true
	} as ValidatorsSchema
}
