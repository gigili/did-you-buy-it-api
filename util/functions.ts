import {DatabaseResult} from "./types/database";
import {RefreshToken} from "../models/refreshTokenModel";
import {ApiResponse, EnvVars, ModelResponse, TokenData} from "./types";
import {NextFunction, Response} from "express";
import {Request} from "./types/request";

const {VerifyErrors} = require("jsonwebtoken");
const refreshTokenModel = require("../models/refreshTokenModel");
const jwt = require("jsonwebtoken");
const privateKey = getEnvVar(EnvVars.JWT_SECRET);
const nodemailer = require("nodemailer");

export async function generateToken(userData: { id: number, username: string }, shouldGenerateRefreshToken: Boolean = true): Promise<TokenData> {
	let refreshToken = null;
	let currentDate = new Date();
	const expiresAt = (currentDate.setHours(currentDate.getHours() + 2));
	const tokenData = {
		algorithm: "HS256",
		issuer: "did-you-buy-it",
		iat: Date.now(),
		user: userData
	};

	if (shouldGenerateRefreshToken) {
		const refreshTokenResult = await refreshTokenModel.getRefreshToken(userData.id) as DatabaseResult<RefreshToken>;
		refreshToken = (refreshTokenResult.data as RefreshToken).token;

		if (!refreshTokenResult.success || !refreshToken) {
			refreshToken = await generateRefreshToken(tokenData, userData.id);
		}
	}

	if (refreshToken === null) {
		return {
			access_token: null,
			refresh_token: null,
			expires: null,
			error: "Unable to generate refresh token for the user!"
		};
	}

	Object.assign(tokenData, {expiresIn: expiresAt});
	const accessToken = jwt.sign(tokenData, privateKey);

	return {
		access_token: accessToken,
		refresh_token: refreshToken,
		expires: expiresAt
	};
}

export async function generateRefreshToken(tokenData: object, userID: number): Promise<string | null> {
	const refreshToken = jwt.sign(tokenData, privateKey);
	const result = await refreshTokenModel.addRefreshToken(userID, refreshToken);
	console.log(result);
	return result.success ? refreshToken : null;
}

export function invalidResponse(msg: string, field?: string, errorCode?: number): ApiResponse {
	const response: ApiResponse = {
		success: false,
		data: {},
		error: {
			message: msg
		}
	};

	if (field !== undefined && response.error !== null) {
		response.error.field = field;
	}

	if (errorCode !== undefined && response.error !== null) {
		response.error.code = errorCode;
	}

	return response;
}

export async function sendEmail(recipient: string, subject: string, template: { file: string, data: any }, attachments?: string[]) {
	const Email = require("email-templates");

	const transporter = nodemailer.createTransport({
		host: "smtp.gmail.com",
		port: 465,
		secure: true, // true for 465, false for other ports
		auth: {
			user: getEnvVar(EnvVars.EMAIL_USER),
			pass: getEnvVar(EnvVars.EMAIL_PASSWORD)
		}

	});

	try {
		const email = new Email({
			transport: transporter,
			template: template.file,
			locals: template.data,
			send: true,
			views: {
				options: {
					extension: "ejs"
				}
			}
		});
		await email
			.send({
				template: template.file,
				locals: template.data,
				message: {
					subject: subject,
					to: recipient,
					from: {
						name: "Did you buy it?",
						address: "support@didyoubuyit.local"
					}
				},

			});
		return true;
	} catch (e) {
		console.error(e);
		return false;
	}
}

export function getEnvVar(key: string) {
	return process.env[key];
}

export function authenticateToken() {
	return (req: Request, res: Response, next: NextFunction) => {
		const authHeader = req.headers["authorization"];
		const token = authHeader && authHeader.split(" ")[1];

		if (!token) {
			return res.status(401).send({"success": false, "message": "Token is missing."});
		}

		jwt.verify(token, getEnvVar(EnvVars.JWT_SECRET), (err: typeof VerifyErrors | null, user?: { user: { id: number, username: string } }) => {
			if (err) {
				return res.status(401).send({"success": false, "message": "Unable to verify token"});
			}

			/*if (requiredPower !== null && user) {
				if (requiredPower > user.power) {
					return res.status(401).send({
						"success": false,
						"message": "Not authorized"
					});
				}
			}*/

			if (typeof user !== "undefined") {
				Object.assign(req, {user: user.user});
			} else {
				return res.status(401).send({"success": false, "message": "Invalid token."});
			}

			next(); // pass the execution off to whatever request the client intended
		});
	};
}

export function returnModelResponse(response: ModelResponse<any>, result?: DatabaseResult<any>): ModelResponse<any> {
	if (response.error) return response;

	if (result) {
		if (result.success) {
			response.data = result.data;
			if (response.error) delete response.error;
		} else {
			response.error = {
				message: result.error?.message,
				code: result.error?.code
			};
		}
	}

	if (response.data) delete response.data;

	return response;
}
