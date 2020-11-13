import {ValidatorsSchema} from "express-validator/src/middlewares/schema";
import {SchemaValidator} from "../types";

export const loginSchema: SchemaValidator = {
	username: {
		in: ['body'],
		errorMessage: "Invalid username",
		notEmpty: {
			errorMessage: "Username can't be empty"
		},
		isLength: {
			errorMessage: "Username must be at least 3 characters",
			options: {min: 3}
		},
		isString: true
	} as ValidatorsSchema,
	password: {
		in: ["body"],
		errorMessage: "Invalid password",
		notEmpty: true,
		isLength: {
			options: {min: 10}
		},
		isString: true
	} as ValidatorsSchema
}

export const registerSchema: SchemaValidator = {
	...loginSchema,
	name: {
		in: ['body'],
		errorMessage: "Invalid name value",
		notEmpty: {
			errorMessage: "Name can't be empty"
		},
		isLength: {
			errorMessage: "Name must be at least 3 characters long.",
			options: {min: 3}
		},
		isString: true
	} as ValidatorsSchema,
	email: {
		in: ["body"],
		errorMessage: "Invalid email address.",
		notEmpty: {
			errorMessage: "Email address can't be empty"
		},
		isEmail: true
	} as ValidatorsSchema
}
