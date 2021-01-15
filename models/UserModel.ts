import {generateToken, getEnvVar, sendEmail} from "../util/functions";
import {EnvVars, ModelResponse, TokenData} from "../util/types";
import {UserEntity} from "../entity/UserEntity";
import {getRepository, ILike, Not} from "typeorm";

const uuid = require("uuid");
const fs = require("fs");

const userEntity = getRepository(UserEntity);

const userModel = {
	async login(username: string, password: string) {
		const response: ModelResponse = {data: {}, error: {}};
		const user = await userEntity.findOne({username: username, password: password});

		if (!user) {
			response.error = {message: "Account doesn't exist", code: 400};
			return response;
		}

		if (!user.status) {
			response.error = {message: "Account is not active.", code: 400};
			return response;
		}

		const tokenData: TokenData = await generateToken({id: user.id, username: user.username}, true);

		if (tokenData.error) {
			response.error = {message: "Login failed", code: 500};
			return response;
		}

		delete response.error;
		response.data = {user, token: tokenData};
		return response;
	},

	async register(name: string, email: string, username: string, password: string) {
		const response: ModelResponse = {data: {}, error: {}};

		const user = await userEntity.findOne({
			where: [
				{username},
				{email}
			]
		});

		if (user) {
			if (!response.error) response.error = {};
			response.error.code = 400;
			if (user.username === username) {
				response.error.message = "Username already taken.";
			} else if (user.email === email) {
				response.error.message = "Email already taken.";
			} else {
				response.error.message = "Account already exists.";
			}

			return response;
		}

		const activationKey = uuid.v4().slice(0, 14);
		const newUser = new UserEntity();
		newUser.name = name;
		newUser.email = email;
		newUser.username = username;
		newUser.password = password;
		newUser.activation_key = activationKey;

		try {
			await userEntity.save(newUser);
		} catch (e) {
			if (!response.error) response.error = {};
			response.error.message = "Failed to create new user account.";
			response.error.code = 500;
			return response;
		}

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
			if (!response.error) response.error = {};
			response.error.message = "Unable to send the activation email. Please use the contact support.";
			response.error.code = 500;
			return response;
		}

		delete response.error;
		response.data = newUser;
		return response;
	},

	async activate(email: string, activationKey: string) {
		const response: ModelResponse = {data: {}};

		if (!response.error) response.error = {};
		const user = await userEntity.findOne({email: email, activation_key: activationKey});
		if (!user) {
			response.error.message = "User account doesn't exist.";
			response.error.code = 400;
			return response;
		} else if (user.status) {
			response.error.message = "User account is already active.";
			response.error.code = 400;
			return response;
		}

		try {
			user.status = true;
			await userEntity.save(user);
		} catch (e) {
			response.error.message = "Failed to activate user account.";
			response.error.code = 500;
			return response;
		}

		delete response.error;
		return response;
	},

	async getUser(userID: number) {
		const response: ModelResponse = {data: {}};

		const user = userEntity.findOne({id: userID});
		if (!user) {
			response.error = {
				message: "Unable to find the user account.",
				code: 404
			};
			return response;
		}

		response.data = user;
		return response;
	},

	async update(name: string, email: string, userID: number, newImageName?: string) {
		const response: ModelResponse = {data: {}};

		const user = await userEntity.findOne({id: userID});
		if (!user) {
			response.error = {
				message: "Unable to find the user account.",
				code: 404
			};
			return response;
		}

		let oldImageName;
		user.name = name;
		user.email = email;

		if (newImageName) {
			oldImageName = user.image;
			user.image = newImageName;
		}

		try {
			await userEntity.save(user);
			if (oldImageName) {
				const imagePath = `./public/images/user/${oldImageName}`;
				if (fs.existsSync(imagePath)) {
					fs.rmSync(imagePath);
				}
			}
		} catch (e) {
			response.error = {
				message: "Unable to update user account.",
				code: 500
			};
			return response;
		}

		return response;
	},

	async closeAccount(userID: number) {
		const response: ModelResponse = {data: {}};

		const user = await userEntity.findOne({id: userID});
		if (!user) {
			response.error = {
				message: "Unable to find user account.",
				code: 404
			};
			return response;
		}

		try {
			const image = user.image;
			await userEntity.delete(user);
			const imagePath = `./public/images/user/${image}`;
			if (fs.existsSync(imagePath)) {
				fs.rmSync(imagePath);
			}

			//TODO: Send an email to notify the user that their account is closed.
		} catch (e) {
			response.error = {
				message: "Unable to close user account",
				code: 500
			};
		}

		return response;
	},

	async find(userID: number, search: string, start: number = 0, limit: number = 10): Promise<ModelResponse> {
		const response: ModelResponse = {data: {}};
		const searchValue = `%${search}%`;
		const users = await userEntity.findAndCount({
			where: [
				{name: ILike(searchValue), status: true, id: Not(userID)},
				{username: ILike(searchValue), status: true, id: Not(userID)},
				{email: ILike(searchValue), status: true, id: Not(userID)}
			],
			skip: start,
			take: limit
		});

		if (!users) {
			response.error = {
				message: "Unable to find users.",
				code: 500
			};
			return response;
		}

		response.data = {
			users: users[0],
			total: users[1]
		};

		return response;
	}
};

module.exports = userModel;
