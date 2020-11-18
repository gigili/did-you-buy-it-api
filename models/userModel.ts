import {addDbRecord, executeQuery, TABLES, updateDbRecord} from "../util/db";
import {DatabaseResult, DefaultDatabaseResult} from "../util/types/database";
import {generateToken, getEnvVar, returnModelResponse, sendEmail} from "../util/functions";
import {EnvVars, ModelResponse, TokenData} from "../util/types";

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

type RegistrationParameters = {
	name: string,
	email: string,
	username: string,
	password: string
}


const userModel = {
	async login(username: string, password: string): Promise<ModelResponse<any>> {
		const response: ModelResponse<any> = {data: {user: null, token: null}};

		const result = await executeQuery(
			`SELECT id, name, username, email, status  FROM ${TABLES.Users} WHERE username = ? AND password = ?`,
			[username, password],
			{singleResult: true}
		) as DatabaseResult<UserModel>;

		if (!result.success || !result.data.id) {
			if (response.error === undefined) response.error = {};
			response.error.message = "Account doesn't exist.";
			response.error.code = 400;

			return response;
		}

		const user = result.data as UserModel;

		if (user.status !== "1") {
			if (response.error === undefined) response.error = {};
			response.error.message = "Account is not active.";
			response.error.code = 400;

			return response;
		}

		const tokenData = await generateToken({
			id: user.id,
			username: user.username
		}, true) as TokenData;

		if (tokenData.error) {
			if (response.error === undefined) response.error = {};
			response.error.message = "Login failed";
			response.error.code = 400;
			return response;
		}

		response.data.user = user;
		response.data.token = tokenData;

		return response;
	},

	async register({name, email, username, password}: RegistrationParameters): Promise<ModelResponse<any>> {
		const response: ModelResponse<any> = {data: {}};

		const result = await executeQuery(
			`SELECT id, username, email FROM ${TABLES.Users} WHERE username = ? OR email = ?`,
			[username, email],
			{singleResult: true}
		) as DatabaseResult<UserModel>;

		if (result.success) {
			if (result.data.hasOwnProperty("id")) {
				if (response.error === undefined) {
					response.error = {};
				}

				response.error.code = 400;

				if ((result.data as UserModel).username.toString().toLowerCase() === username.toLowerCase()) {
					response.error.message = "Username already taken.";
				} else if ((result.data as UserModel).email.toString().toLowerCase() === email.toLowerCase()) {
					response.error.message = "Email already taken.";
				}

				if (response.error.message) {
					return response;
				}
			}
		}

		const activationKey = uuid.v4().slice(0, 14);
		const status = await addDbRecord(TABLES.Users, {
			name,
			email,
			username,
			password,
			activation_key: activationKey
		});

		if (!status.success || status.data.affectedRows === 0) {
			if (response.error === undefined) {
				response.error = {};
			}
			response.error.message = "Registration failed.";
			response.error.code = 500;
		}

		if (!response.error) {
			//Send an activation email
			const emailSent = await sendEmail(
				email,
				"Confirm your email address | Did You Buy It?",
				{
					file: "confirm_email",
					data: {
						emailTitle: "Confirm your email address",
						emailPreview: "Click the link in the message to confirm your email address and active your account.",
						userFullName: name,
						activationCode: activationKey,
						email: email,
						baseUrl: getEnvVar(EnvVars.BASE_URL)
					}
				});

			if (!emailSent) {
				if (response.error === undefined) response.error = {};

				response.error.message = "Unable to send the activation email. Please use the contact form on the website.";
				response.error.code = 500;
			}
		}

		return response;
	},

	async activate(email: string, activationKey: string): Promise<ModelResponse<DefaultDatabaseResult>> {
		const response: ModelResponse<DefaultDatabaseResult> = {data: {}};

		const query = `SELECT id, username, status FROM ${TABLES.Users} WHERE email = ? AND activation_key = ?`;
		const data = await executeQuery(query, [email, activationKey], {singleResult: true});

		if (data.error) {
			if (response.error === undefined) response.error = {};
			response.error.message = "Unable to find the user account.";
			response.error.code = 400;
		} else if (data.success) {
			if (!data.data.id) {
				if (response.error === undefined) response.error = {};
				response.error.message = "User account doesn't exist.";
				response.error.code = 400;
			} else if (data.data.status === "1") {
				if (response.error === undefined) response.error = {};
				response.error.message = "User account is already activated.";
				response.error.code = 400;
			}
		}

		if (response.error) return response;

		const result = await updateDbRecord(TABLES.Users, {"status": "1"}, ` id = ${data.data.id}`);
		return returnModelResponse(response, result);
	}
};

module.exports = userModel;
