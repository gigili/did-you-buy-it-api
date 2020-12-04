import {ModelResponse} from "../util/types";
import {connection} from "../app";
import {ListItemEntity} from "../entity/ListItemEntity";
import {ListEntity} from "../entity/ListEntity";
import {UserEntity} from "../entity/UserEntity";
import {HasAccessType} from "./ListModel";

const listItemEntity = connection.getRepository(ListItemEntity);
const listEntity = connection.getRepository(ListEntity);
const listModel = require("./ListModel");
const fs = require("fs");

const ListItemModel = {
	async getListItem(itemID: number) {
		const response: ModelResponse = {data: {}};
		const item = await listItemEntity.findOne({id: itemID});

		if (!item) {
			response.error = {
				message: "Unable to find selected item.",
				code: 404
			};
			return response;
		}

		response.data = item;
		return response;
	},

	async getListItems(listID: number): Promise<ModelResponse> {
		const response: ModelResponse = {data: {}};

		const list = await listEntity.findOne({id: listID});
		if (!list) {
			response.error = {
				message: "Unable to find the selected list.",
				code: 404
			};
			return response;
		}

		response.data = await listItemEntity.find({where: {list: list}});
		return response;
	},

	async addListItem(listID: number, name: string, is_repeating: string, userID: number, newImageName?: string): Promise<ModelResponse> {
		const response: ModelResponse = {data: {}};
		const list = await listModel.getList(listID, userID);
		const user = await connection.getRepository(UserEntity).findOne({id: userID});

		if (list.error) return list;

		if (!user) {
			response.error = {
				message: "Invalid user.",
				code: 401
			};
			return response;
		}

		const hasListAccess = await listModel.hasAccessToList(listID, userID);
		if (hasListAccess.error) return hasListAccess.error;

		const listAccess = hasListAccess.data as HasAccessType;
		if (!listAccess.hasAccess) {
			response.error = {
				message: "You can't add new items to this list.",
				code: 401
			};
			return response;
		}

		try {
			const newListItem = new ListItemEntity();
			newListItem.list = list.data;
			newListItem.name = name;
			newListItem.is_repeating = is_repeating;
			newListItem.userID = Promise.resolve(user);
			if (newImageName !== undefined) {
				newListItem.image = newImageName;
			}

			await listItemEntity.save(newListItem);
		} catch (e) {
			response.error = {
				message: "Unable to add new list item.",
				code: 500
			};
			return response;
		}

		return response;
	},

	async editListItem(listID: number, name: string, is_repeating: string, newImageName: string | null, userID: number, itemID: number): Promise<ModelResponse> {
		const response: ModelResponse = {data: {}};
		const listAccessResult = await listModel.hasAccessToList(listID, userID);
		const itemResult = await this.getListItem(itemID);

		if (listAccessResult.error) return listAccessResult;
		if (itemResult.error) return itemResult;

		const listAccess = listAccessResult.data as HasAccessType;

		if (!listAccess.isOwner && itemResult.data.userID !== userID) {
			response.error = {
				message: "You can only edit your own items",
				code: 401
			};

			return response;
		}

		const listItem = itemResult.data as ListItemEntity;
		listItem.name = name;
		listItem.is_repeating = is_repeating;
		if (newImageName !== null) {
			if (listItem.image) {
				const image = listItem.image;
				if (fs.existsSync(`./public/images/listItem/${image}`)) {
					fs.rmSync(`./public/images/listItem/${image}`);
				}
			}

			listItem.image = newImageName;
		}
		await listItemEntity.save(listItem);

		return response;
	},

	async setItemBoughtStatus(listID: number, itemID: number, userID: number): Promise<ModelResponse> {
		const response: ModelResponse = {data: {}};
		const listResult = await listModel.hasAccessToList(listID, userID);
		const itemResult = await this.getListItem(itemID);
		const user = await connection.getRepository(UserEntity).findOne({id: userID});

		if (listResult.error) return listResult;

		if (itemResult.error) return itemResult;

		if (!user) {
			response.error = {
				message: "Invalid user.",
				code: 400
			};
			return response;
		}

		const item = itemResult.data as ListItemEntity;

		item.purchasedUserID = user;
		item.purchase_date = new Date().toISOString();

		try {
			await listItemEntity.save(item);
		} catch (e) {
			response.error = {
				message: "Unable to mark item as bought.",
				code: 500
			};
			return response;
		} finally {
			await this.sendBoughtNotification(listID, itemID, userID, "all");
		}

		return response;
	},

	//TODO: Implement sending notifications
	async sendBoughtNotification(listID: number, itemID: number, userID: number, system: string) {
		const response: ModelResponse = {data: {}};
		const listItem = await this.getListItem(itemID);
		const listUsers = await listModel.getListUsers(listID, userID);

		if (listItem.error) return listItem;
		if (listUsers.error) return listUsers;

		if (response.error) return response;

		/*const users = listUsers.data.filter((user: any) => user.userID != userID && user.status === "1");

		const userIDs = users.map((user: any) => user.userID);

		const query = `SELECT * FROM ${TABLES.UserToken} WHERE userID IN (?)`;
		const result = await executeQuery(query, [userIDs.join(","), system]) as DatabaseResult<UserToken[]>;

		if (result.error || result.data.length === 0) return response;

		const tokens = result.data.map((userToken: UserToken) => userToken.token);

		if (tokens.length === 0) return response;
		const currentUser = listUsers.filter((user: any) => user.userID === userID)[0];
		const item = listItem.data;

		sendNotification(`${item.name} was just bought`, `${currentUser.userFullName} bought ${item.name}`, tokens);*/

		return response;
	},

	async deleteListItem(listID: number, itemID: number, userID: number): Promise<ModelResponse> {
		const response: ModelResponse = {data: {affectedRows: 0}};
		const listResult = await listModel.hasAccessToList(listID, userID);
		const itemResult = await this.getListItem(itemID);

		if (listResult.error) return listResult;
		if (itemResult.error) return itemResult;

		const listAccess = listResult.data as HasAccessType;
		if (!listAccess.isOwner && itemResult.data.userID !== userID) {
			response.error = {
				message: "You can only delete your own item",
				code: 401
			};
			return response;
		}

		try {
			const item = itemResult.data as ListItemEntity;
			await listItemEntity.remove(item);
		} catch (e) {
			response.error = {
				message: "There was an error deleting the item.",
				code: 500
			};
			return response;
		} finally {
			if (itemResult.data.image) {
				const image = itemResult.data.image;
				if (fs.existsSync(`./public/images/listItem/${image}`)) {
					fs.rmSync(`./public/images/listItem/${image}`);
				}
			}
		}

		return response;
	},

	async deleteItemImage(listID: number, itemID: number, userID: number) {
		const response: ModelResponse = {data: {affectedRows: 0}};
		const listResult = await listModel.hasAccessToList(listID, userID);
		const itemResult = await this.getListItem(itemID);

		if (listResult.error) return listResult;
		if (itemResult.error) return itemResult;

		const listAccess = listResult.data as HasAccessType;
		if (!listAccess.isOwner && itemResult.data.userID !== userID) {
			response.error = {
				message: "You can only delete your own item",
				code: 401
			};
			return response;
		}

		try {
			const item = itemResult.data as ListItemEntity;
			if (item.image) {
				const image = item.image;
				if (fs.existsSync(`./public/images/listItem/${image}`)) {
					fs.rmSync(`./public/images/listItem/${image}`);

					item.image = null;
					await listItemEntity.save(item);
				}
			}
		} catch (e) {
			response.error = {
				message: "There was an error deleting the item image.",
				code: 500
			};
			return response;
		}

		return response;
	}

};

module.exports = ListItemModel;
