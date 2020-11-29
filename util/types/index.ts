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

//WebStorm exposes env var values in autocomplete and there is no way to disable it as of writing this (14.11.2020)
export enum EnvVars {
	PORT = "PORT",
	TYPEORM_HOST = "TYPEORM_HOST",
	TYPEORM_PORT = "TYPEORM_PORT",
	TYPEORM_USER = "TYPEORM_USER",
	TYPEORM_PASSWORD = "TYPEORM_PASSWORD",
	TYPEORM_DATABASE = "TYPEORM_DATABASE",
	JWT_SECRET = "JWT_SECRET",
	EMAIL_USER = "EMAIL_USER",
	EMAIL_PASSWORD = "EMAIL_PASSWORD",
	BASE_URL = "BASE_URL"
}

export type TokenUser = {
	id: number,
	username: string
}
