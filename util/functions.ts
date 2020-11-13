import {DatabaseResult} from "./types/database";
import {RefreshToken} from "../models/refreshTokenModel";
import {ApiResponse, TokenData} from "./types";

const refreshTokenModel = require("../models/refreshTokenModel");
const jwt = require("jsonwebtoken");
const privateKey = process.env.JWT_SECRET;
const nodemailer = require("nodemailer");

export async function generate_token(userData: { id: number, username: string }, generateRefreshToken: Boolean = true): Promise<TokenData> {
	let refreshToken = null;
	let currentDate = new Date();
	const expiresAt = (currentDate.setHours(currentDate.getHours() + 2));
	const tokenData = {
		algorithm: "HS256",
		issuer: "did-you-buy-it",
		iat: Date.now(),
		user: userData
	};

	if (generateRefreshToken) {
		const refreshTokenResult = await refreshTokenModel.getRefreshToken(userData.id) as DatabaseResult<RefreshToken>;
		refreshToken = (refreshTokenResult.data as RefreshToken).token;

		if (!refreshTokenResult.success || !refreshToken) {
			refreshToken = await generate_refresh_token(tokenData, userData.id);
		}
	}

	if (refreshToken === null) {
		return {
			access_token: null,
			refresh_token: null,
			expires: null,
			error: "Unable to generate refresh token for the user!"
		}
	}

	Object.assign(tokenData, {expiresIn: expiresAt});
	const accessToken = jwt.sign(tokenData, privateKey);

	return {
		access_token: accessToken,
		refresh_token: refreshToken,
		expires: expiresAt
	};
}

export async function generate_refresh_token(tokenData: object, userID: number): Promise<string | null> {
	const refreshToken = jwt.sign(tokenData, privateKey);
	const result = await refreshTokenModel.addRefreshToken(userID, refreshToken);
	console.log(result);
	return result.success ? refreshToken : null;
}

export function invalid_response(msg: string, field?: string, errorCode?: number): ApiResponse {
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

export async function send_email(recipient: string, subject: string, message: string, attachments?: string[]) {
	let transporter = nodemailer.createTransport({
		host: 'smtp.gmail.com',
		port: 465,
		secure: true, // true for 465, false for other ports
		auth: {
			user: process.env.EMAIL_USER,
			pass: process.env.EMAIL_PASSWORD
		}
	});

	return await transporter.sendMail({
		to: recipient,
		subject,
		html: message,
		from: {
			name: "Did you buy it?",
			address: "support@didyoubuyit.local"
		}
	});
}
