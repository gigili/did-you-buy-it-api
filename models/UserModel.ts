import {generateToken} from "../util/functions";
import {TokenData} from "../util/types";
import {connection} from "../app";
import {UserEntity} from "../entity/UserEntity";

const uuid = require("uuid");
const fs = require("fs");

type RegistrationParameters = {
	name: string,
	email: string,
	username: string,
	password: string
}

const userEntity = connection.getRepository(UserEntity);

const userModel = {
	async login(username: string, password: string) {
		const user = await userEntity.findOne({username: username, password: password});

		if (!user) {
			return {
				error: {
					message: "Account doesn't exist",
					code: 400
				}
			};
		}

		if (user.status !== "1") {
			return {
				error: {
					message: "Account is not active.",
					code: 400
				}
			};
		}

		const tokenData = await generateToken({
			id: user.id,
			username: user.username
		}, true) as TokenData;

		if (tokenData.error) {
			return {
				error: {
					message: "Login failed",
					code: 500
				}
			};
		}

		return {
			data: {
				user,
				token: tokenData
			}
		};
	},

	/*
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
	},

	async getUser(userID: number): Promise<ModelResponse<UserModel>> {
		const response: ModelResponse<UserModel> = {data: {id: 0, name: "", username: "", email: ""}};

		const query = `SELECT id, name, username, email, status, image FROM ${TABLES.Users} WHERE id = ?`;
		const result = await executeQuery(query, [userID], {singleResult: true});
		return returnModelResponse(response, result);
	},

	async update(name: string, email: string, userID: number, newImageName?: string): Promise<ModelResponse<DefaultDatabaseResult>> {
		const response: ModelResponse<DefaultDatabaseResult> = {data: {}};

		const userData = {
			name, email
		};

		let oldUser;
		if (newImageName) {
			Object.assign(userData, {image: newImageName});

			const oldUserResult = await this.getUser(userID);
			if (!oldUserResult.error && oldUserResult.data.id) {
				oldUser = oldUserResult.data;
			}
		}

		const result = await updateDbRecord(TABLES.Users, userData, `id = ${userID}`);

		if (!result.error && oldUser) {
			const imagePath = `./public/images/user/${oldUser.image}`;
			if (fs.existsSync(imagePath)) {
				fs.rmSync(imagePath);
			}
		}

		return returnModelResponse(response, result);
	},

	async closeAccount(userID: number): Promise<ModelResponse<DefaultDatabaseResult>> {
		const response: ModelResponse<DefaultDatabaseResult> = {data: {}};
		const oldUser = await this.getUser(userID);
		const result = await deleteDbRecord(TABLES.Users, `id = ${userID}`);

		if (!result.error && !oldUser.error) {
			const image = oldUser.data.image;
			const imagePath = `./public/images/user/${image}`;
			if (fs.existsSync(imagePath)) {
				fs.rmSync(imagePath);
			}
		}

		return returnModelResponse(response, result);
	}
	*/
};

module.exports = userModel;
