import {connection} from "../app";
import {RefreshTokenEntity} from "../entity/RefreshTokenEntity";
import {ModelResponse} from "../util/types";
import {UserEntity} from "../entity/UserEntity";

const refreshTokenEntity = connection.getRepository(RefreshTokenEntity);
const userEntity = connection.getRepository(UserEntity);

const RefreshTokenModel = {
	async getRefreshToken(userID: number) {
		const response: ModelResponse = {data: {}};
		const user = await userEntity.findOne({id: userID});

		if (!user) {
			response.error = {
				message: "Unable to find the selected user.",
				code: 401
			};
			return response;
		}

		response.data = await refreshTokenEntity.findOne({user: user});
		return response;
	},

	async addRefreshToken(userID: number, refreshToken: string) {
		const response: ModelResponse = {data: {}};
		const user = await userEntity.findOne({id: userID});

		if (!user) {
			response.error = {
				message: "Unable to find the selected user.",
				code: 401
			};
			return response;
		}

		const newRefreshToken = new RefreshTokenEntity();
		newRefreshToken.user = user;
		newRefreshToken.token = refreshToken;

		try {
			await refreshTokenEntity.save(newRefreshToken);
		} catch (e) {
			response.error = {
				message: "Unable to save new refresh token.",
				code: 500
			};
			return response;
		}

		return response;
	},

	async removeRefreshToken(userID: number) {
		const response: ModelResponse = {data: {}};
		const user = await userEntity.findOne({id: userID});

		if (!user) {
			response.error = {
				message: "Unable to find the selected user.",
				code: 401
			};
			return response;
		}

		const refreshToken = await refreshTokenEntity.findOne({user: user});

		if (!refreshToken) {
			response.error = {
				message: "Refresh token doesn't exist.",
				code: 404
			};

			return response;
		}

		try {
			await refreshTokenEntity.remove(refreshToken);
		} catch (e) {
			response.error = {
				message: "Unable to delete refresh token.",
				code: 500
			};
			return response;
		}

		return response;
	}
};

module.exports = RefreshTokenModel;
