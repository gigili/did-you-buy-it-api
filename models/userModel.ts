import {addDbRecord, executeQuery, TABLES} from "../util/db";
import {DatabaseResult} from "../util/types/database";
import {generate_token} from "../util/functions";
import {ModelResponse, TokenData} from "../util/types";

const uuid = require("uuid");

export type UserModel = {
	id: number,
	name: string,
	username: string,
	email: string,
	password?: string,
	image?: string,
	level?: number,
	lang: string,
	activation_key?: string,
	status: string,
	date_registered: number
}

type LoginResponse = {
	user: UserModel | null,
	token: TokenData | null,
	error?: {
		message?: string,
		code?: number
	}
}

type RegistrationParameters = {
	name: string,
	email: string,
	username: string,
	password: string
}


const userModel = {
	async login(username: string, password: string): Promise<ModelResponse> {
		const response: ModelResponse = {data: {user: null, token: null}};

		const result = await executeQuery(
			`SELECT id, name, username, email, status  FROM ${TABLES.Users} WHERE username = ? AND password = ?`,
			[username, password],
			{singleResult: true}
		) as DatabaseResult<UserModel>;

		if (!result.success || !result.data.hasOwnProperty("id")) {
			if (response.error === undefined) response.error = {};
			response.error.message = "Account doesn't exist.";
			response.error.code = 400

			return response;
		}

		const user = result.data as UserModel;

		if (user.status !== "1") {
			if (response.error === undefined) response.error = {};
			response.error.message = "Account is not active.";
			response.error.code = 400

			return response;
		}

		const tokenData = await generate_token({
			id: user.id,
			username: user.username
		}, true) as TokenData;

		if (tokenData.error) {
			if (response.error === undefined) response.error = {};
			response.error.message = "Login failed";
			response.error.code = 400
			return response;
		}

		response.data.user = user;
		response.data.token = tokenData;

		return response;
	},

	async register({name, email, username, password}: RegistrationParameters): Promise<ModelResponse> {
		const response: ModelResponse = {data: {}};

		const result = await executeQuery(
			`SELECT id, username, email  FROM ${TABLES.Users} WHERE username = ? OR email = ?`,
			[username, email],
			{singleResult: true}
		) as DatabaseResult<UserModel>;

		if (result.success) {
			if (result.data.hasOwnProperty("id")) {
				if (response.error === undefined) response.error = {};

				response.error.code = 400;

				if ((result.data as UserModel).username.toString().toLowerCase() === username.toLowerCase()) {
					response.error.message = "Username already taken.";
				} else if ((result.data as UserModel).email.toString().toLowerCase() === email.toLowerCase()) {
					response.error.message = "Email already taken.";
				}

				if (response.error.message) return response;
			}
		}

		const status = await addDbRecord(TABLES.Users, {
			name,
			email,
			username,
			password,
			activation_key: uuid.v4().slice(0, 14)
		});

		if (!status.success || status.data.affectedRows === 0) {
			if (response.error === undefined) response.error = {};
			response.error.message = "Registration failed.";
			response.error.code = 500;
		}

		return response;
	}
}

module.exports = userModel;
