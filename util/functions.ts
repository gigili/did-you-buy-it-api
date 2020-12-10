import {ApiResponse, EnvVars, TokenData} from "./types";
import {NextFunction, Response} from "express";
import {Request} from "./types/request";
import {RefreshTokenEntity} from "../entity/RefreshTokenEntity";

const {VerifyErrors} = require("jsonwebtoken");
const refreshTokenModel = require("../models/RefreshTokenModel");
const jwt = require("jsonwebtoken");
const privateKey = getEnvVar(EnvVars.JWT_SECRET);
const nodemailer = require("nodemailer");

export async function generateToken(userData: { id: number, username: string }, shouldGenerateRefreshToken: Boolean = true): Promise<TokenData> {
	let refreshToken = null;
	let currentDate = Math.floor(Date.now() / 1000);
	const expiresAt = currentDate + (2 * 3600); //2h
	const tokenData = {
		algorithm: "HS256",
		issuer: "did-you-buy-it",
		iat: Date.now(),
		user: userData
	};

	if (shouldGenerateRefreshToken) {
		const refreshTokenResult = await refreshTokenModel.getRefreshToken(userData.id);
		if (refreshTokenResult.error || refreshTokenResult.data === undefined) {
			refreshToken = await generateRefreshToken(tokenData, userData.id);
		} else {
			refreshToken = (refreshTokenResult.data as RefreshTokenEntity).token;
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

	Object.assign(tokenData, {expiresIn: expiresAt, exp: expiresAt});
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
	return !result.error ? refreshToken : null;
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

export async function sendEmail(recipient: string, subject: string, template: { file: string, data: {} }, attachments?: string[]) {
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

		jwt.verify(token, getEnvVar(EnvVars.JWT_SECRET), (err: typeof VerifyErrors | null, user?: { exp: number, user: { id: number, username: string, power?: number } }) => {
			if (err) {
				return res.status(401).send(invalidResponse("Unable to verify token"));
			}

			if (typeof user !== "undefined") {
				Object.assign(req, {user: user.user});
			} else {
				return res.status(401).send(invalidResponse("Invalid token."));
			}

			next(); // pass the execution off to whatever request the client intended
		});
	};
}

export function sendNotification(title: string, message: string, recipients: string[]) {
}
