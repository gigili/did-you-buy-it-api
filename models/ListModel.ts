import {DatabaseResult} from "../util/types/database";
import {ModelResponse} from "../util/types";
import {connection} from "../app";
import {ListEntity} from "../entity/ListEntity";
import {UserEntity} from "../entity/UserEntity";

const listEntity = connection.getRepository(ListEntity);
const userEntity = connection.getRepository(UserEntity);

export type HasAccessType = {
	hasAccess: boolean,
	isOwner: boolean,
	isGuest: boolean
}

const ListModel = {
	async getList(listID: number, ownerID: number): Promise<ModelResponse> {
		const response: ModelResponse = {data: {}};
		const user = await userEntity.findOne({id: ownerID});

		if (!user) {
			response.error = {
				message: "Invalid user.",
				code: 401
			};
			return response;
		}

		const data = await listEntity.findOne({
			where: {
				id: listID,
				user: user
			}
		});

		if (!data) {
			response.error = {
				message: "List not found.",
				code: 404
			};
			return response;
		}


		response.data = {
			...data,
			user: await data.user,
			users: await data.users,
			items: await data.items
		};

		return Promise.resolve(response);
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
		list.user = Promise.resolve(user);
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

		const list = await listEntity.findOne({where: {id: listID, user: user}});

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
		const user = userEntity.findOne({id: userID});

		if (!user) {
			response.error = {
				message: "Invalid user.",
				code: 401
			};
			return response;
		}

		const list = await listEntity.findOne({
			where: {
				id: listID,
				user: user
			},
			relations: ["user", "users"]
		});

		if (!list) {
			response.error = {
				message: "List not found.",
				code: 404
			};
			return response;
		}

		const users = await list.users;
		users.push((await list.user));

		response.data = users;
		return response;
	},

	async addListUser(listID: number, ownerID: number, userID: number): Promise<DatabaseResult<any> | ModelResponse> {
		const response: ModelResponse = {data: {}};
		try {
			const list = await listEntity.findOne({id: listID});

			if (!list) {
				response.error = {
					message: "List not found.",
					code: 404
				};
			} else if ((await list.user).id !== ownerID) {
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

			for (const usr of (await list!.users)) {
				if (usr.id === user.id) {
					response.error = {
						message: "User is already in the list.",
						code: 406
					};
					return response;
				}
			}

			(await list?.users!).push(user!);
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
			const list = await listEntity
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
			} else if ((await list.user).id !== ownerID) {
				response.error = {
					message: "You can't remove users from this list.",
					code: 401
				};
			} else if (ownerID === userID && (await list.user).id === ownerID) {
				response.error = {
					message: "You can't remove yourself from this list.",
					code: 400
				};
			}

			if (response.error) return response;

			if (list) {
				list.users = Promise.resolve((await list.users).filter((usr => usr.id !== userID)));
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

	async hasAccessToList(listID: number, userID: number) {
		const response: ModelResponse = {data: {}};
		const list = await this.getList(listID, userID);

		if (list.error) {
			response.error = list.error;
			return response;
		}

		const isListOwner = list.data.user.id === userID;
		const isListGuest = list.data.users.some((usr: UserEntity) => usr.id === userID);

		response.data = {
			hasAccess: (isListOwner || isListGuest),
			isOwner: isListOwner,
			isGuest: isListGuest,
		} as HasAccessType;

		return response;
	}
};

module.exports = ListModel;
