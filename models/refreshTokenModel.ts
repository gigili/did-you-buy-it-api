import {executeQuery, TABLES} from "../util/db";

export type RefreshToken = {
	token: string,
	userID: number
}

const RefreshTokenModel = {
	getRefreshToken(userID: number) {
		return executeQuery(
			`SELECT * FROM ${TABLES.RefreshToken} WHERE userID = ?`,
			[userID],
			{
				singleResult: true
			}
		);
	},

	addRefreshToken(userID: number, refreshToken: string) {
		return executeQuery(
			`INSERT INTO ${TABLES.RefreshToken} (token, userID) VALUES (?,?)`,
			[refreshToken, userID]
		);
	},

	removeRefreshToken(userID: number) {
		return executeQuery(
			`DELETE FROM ${TABLES.RefreshToken} WHERE userID = ?`,
			[userID]
		);
	}
}

module.exports = RefreshTokenModel;
