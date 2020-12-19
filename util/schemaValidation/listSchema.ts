import {SchemaValidator} from "../types";
import {ValidatorsSchema} from "express-validator/src/middlewares/schema";

export const listSchema: SchemaValidator = {
	name: {
		isString: true,
		notEmpty: {
			errorMessage: "List name can't be empty."
		}
	} as ValidatorsSchema
};

export const listUpdateSchema: SchemaValidator = {
	...listSchema,
	listID: {
		in: ["body", "params"],
		isInt: true,
		toInt: true
	} as ValidatorsSchema
};


export const listDeleteSchema: SchemaValidator = {
	listID: {
		in: ["body", "params"],
		isInt: true,
		toInt: true
	} as ValidatorsSchema
};

export const newListUserSchema: SchemaValidator = {
	userID: {
		in: ["body"],
		isInt: true,
		toInt: true,
		notEmpty: {
			errorMessage: "User ID is required."
		}
	} as ValidatorsSchema,
	listID: {
		in: ["params"],
		isInt: true,
		toInt: true
	} as ValidatorsSchema
};

export const deleteListUserSchema : SchemaValidator = {
  userID: {
    in: ["params"],
    isInt: true,
    toInt: true,
    notEmpty: {
      errorMessage: "User ID is required"
    }
  } as ValidatorsSchema,
  listID: {
	in: ["params"],
	isInt: true,
	toInt: true
} as ValidatorsSchema
};
