import {SchemaValidator} from "../types";
import {ValidatorsSchema} from "express-validator/src/middlewares/schema";

export const updateUserProfileSchema: SchemaValidator = {
	name: {
		in: ["body"],
		notEmpty: {
			errorMessage: "Name field can't be empty"
		},
		isString: true
	} as ValidatorsSchema,
	email: {
		in: ["body"],
		notEmpty: {
			errorMessage: "Email field can't be empty"
		},
		isEmail: true,
	} as ValidatorsSchema
};
