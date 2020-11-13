import {ValidatorsSchema} from "express-validator/src/middlewares/schema";

export type TokenData = {
	access_token: string | null,
	refresh_token: string | null,
	expires: number | null,
	error?: string
}

export type ApiResponse = {
	success: boolean,
	data?: [] | {},
	message?: string,
	error: {
		message: string,
		field?: string,
		code?: number
	} | null
}

export type SchemaValidator = {
	[key: string]: ValidatorsSchema
}

export type ModelResponse = {
	data: any,
	error?: {
		message?: string,
		code?: number
	}
}
