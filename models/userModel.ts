import {executeQuery, TABLES} from "../util/db";
import {DatabaseResult} from "../util/types/database";
import {generate_token} from "../util/functions";
import {RefreshToken} from "./refreshTokenModel";
import {TokenData} from "../util/types";

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

const userModel = {
	async login(username: string, password: string){
		const result = await executeQuery(
			`SELECT * FROM ${TABLES.Users} WHERE username = ? AND password = ?`,
			[username, password],
			{ singleResult: true }
		) as DatabaseResult<UserModel>;

		if(!result.success || !result.data.hasOwnProperty("id")) return "Account doesn't exist"; //TODO: Return an error message here

		const user = result.data as UserModel;

		if(user.status !== "1")  return "Account is not active"; //TODO: Return an error message here

		const tokenData = await generate_token({
			id: user.id,
			username: user.username
		}, true) as TokenData;

		if(tokenData.error){
			return "Login failed"; //TODO: Return an error message here
		}

		return tokenData;
	}
}

module.exports = userModel;
