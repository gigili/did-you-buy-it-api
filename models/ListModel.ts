import "../util/db";
import {executeQuery, TABLES} from "../util/db";
import {DatabaseResult} from "../util/types/database";
import {ModelResponse} from "../util/types";
import {returnModelResponse} from "../util/functions";
import {connection} from "../app";
import {ListEntity} from "../entity/ListEntity";
import {UserEntity} from "../entity/UserEntity";

const listEntity = connection.getRepository(ListEntity);
const userEntity = connection.getRepository(UserEntity);

const ListModel = {
	async getList(listID: number, ownerID: number): Promise<ModelResponse> {
		const response: ModelResponse = {data: {}};

		const user = await userEntity.findOne({id: ownerID});
		response.data = await listEntity.findOne({
			id: listID,
			user: user
		});

		return response;
	},

	async getListsForUser(userID: number): Promise<ModelResponse> {
		const response: ModelResponse = {data: []};
		const result = await executeQuery(`SELECT * FROM ${TABLES.Lists} WHERE userID = ?`, [userID]);
		return returnModelResponse(response, result);
	},

	async createList(name: string, userID: number): Promise<ModelResponse> {
		const response: ModelResponse = {data: {}};
		const user = await userEntity.findOne({id: userID});

		if (!user) {
			response.error = {
				message: "Invalid user.",
				code: 400
			};
			return response;
		}

		const list = new ListEntity();
		list.user = user;
		list.name = name;
		list.created_at = new Date().toISOString();

		try {
			response.data = await listEntity.save(list);
		} catch (e) {
			console.error(e);
			response.error = {
				message: "Unable to create new list.",
				code: 500
			};
			return response;
		}

		return response;
	},

	async updateList(listID: number, name: string, userID: number): Promise<ModelResponse> {
		const response: ModelResponse = {data: {}};

		const user = await userEntity.findOne({id: userID});
		if (!user) {
			response.error = {
				message: "Invalid user.",
				code: 400
			};
			return response;
		}

		const list = await listEntity.findOne({id: listID, user: user});

		if (!list) {
			response.error = {
				message: "List not found.",
				code: 404
			};
			return response;
		}

		list.name = name;

		try {
			await listEntity.save(list);
		} catch (e) {
			response.error = {
				message: "Unable to save list.",
				code: 500
			};
			return response;
		}

		return response;
	},

	async deleteList(listID: number, userID: number): Promise<ModelResponse> {
		const response: ModelResponse = {data: {}};

		const user = await userEntity.findOne({id: userID});

		if (!user) {
			response.error = {
				message: "Unable to find user.",
				code: 400
			};
			return response;
		}

		const list = await listEntity.findOne({id: listID});
		if (!list) {
			response.error = {
				message: "List not found.",
				code: 404
			};
			return response;
		}

		try {
			await listEntity.remove(list);
		} catch (e) {
			response.error = {
				message: "Unable to delete a list.",
				code: 500
			};
			return response;
		}

		return response;
	},

	async getListUsers(listID: number, userID: number) {
		const response: ModelResponse = {data: []};

		const list = await connection.getRepository(ListEntity)
			.createQueryBuilder("list")
			.leftJoinAndSelect("list.users", "users")
			.leftJoinAndSelect("list.user", "user")
			.where("list.id = :listID AND list.userID = :userID", {listID, userID})
			.getOne();

		if (!list) {
			response.error = {
				message: "List not found.",
				code: 404
			};
			return response;
		}

		const users = list.users;
		users.push(list.user);

		response.data = users;
		return response;
	},

	async addListUser(listID: number, ownerID: number, userID: number): Promise<DatabaseResult<any> | ModelResponse> {
		const response: ModelResponse = {data: {}};
		try {
			const list = await connection.getRepository(ListEntity)
				.createQueryBuilder("list")
				.leftJoinAndSelect("list.users", "users")
				.leftJoinAndSelect("list.user", "user")
				.where("list.id = :id", {id: listID})
				.getOne();

			if (!list) {
				response.error = {
					message: "List not found.",
					code: 404
				};
			} else if (list.user.id !== ownerID) {
				response.error = {
					message: "You can't add new users to this list.",
					code: 401
				};
			} else if (ownerID === userID) {
				response.error = {
					message: "You can't add yourself to the list.",
					code: 400
				};
			}

			if (response.error) return response;

			const user = await userEntity.findOne({id: userID});

			if (!user) {
				response.error = {
					message: "Invalid user provided.",
					code: 400
				};
				return response;
			}

			for (const usr of list!.users) {
				if (usr.id === user.id) {
					response.error = {
						message: "User is already in the list.",
						code: 406
					};
					return response;
				}
			}

			list?.users.push(user!);
			await listEntity.save(list!);
		} catch (e) {
			console.error(e);
			response.error = {
				message: "Unable to add a user to the list.",
				code: 500
			};
			return response;
		}

		return response;
	},

	async deleteListUser(listID: number, ownerID: number, userID: number): Promise<ModelResponse> {
		const response: ModelResponse = {data: {}};
		try {
			const list = await connection.getRepository(ListEntity)
				.createQueryBuilder("list")
				.leftJoinAndSelect("list.users", "users")
				.leftJoinAndSelect("list.user", "user")
				.where("list.id = :id", {id: listID})
				.getOne();

			if (!list) {
				response.error = {
					message: "List not found.",
					code: 404
				};
			} else if (list.user.id !== ownerID) {
				response.error = {
					message: "You can't remove users from this list.",
					code: 401
				};
			} else if (ownerID === userID && list.user.id === ownerID) {
				response.error = {
					message: "You can't remove yourself from this list.",
					code: 400
				};
			}

			if (response.error) return response;

			if (list) {
				list.users = list.users.filter((usr => usr.id !== userID));
				await listEntity.save(list!);
			}
		} catch (e) {
			console.error(e);
			response.error = {
				message: "Unable to remove user from the list.",
				code: 500
			};
			return response;
		}

		return response;
	},

	async hasAccessToList(listID: number, userID: number): Promise<ModelResponse> {
		const response: ModelResponse = {data: {id: 0, access: "-1"}};
		//accessLevel 1 = Owner of the list
		//accessLevel 2 = Guest user on the list
		const query = `
			SELECT l.id, IF(lu.userID = ${userID}, '2', '1') as accessLevel FROM ${TABLES.Lists} AS l 
			LEFT JOIN ${TABLES.ListUsers} AS lu ON lu.listID = l.id
			WHERE l.id = ? AND (l.userID = ? OR lu.userID = ?);
		`;

		const result = await executeQuery(query, [listID, userID, userID], {singleResult: true});
		return returnModelResponse(response, result);
	}
};

module.exports = ListModel;
