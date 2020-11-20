import {addDbRecord, deleteDbRecord, executeQuery, TABLES, updateDbRecord} from "../util/db";
import {ModelResponse} from "../util/types";
import {returnModelResponse, sendNotification} from "../util/functions";
import {DatabaseResult, DefaultDatabaseResult} from "../util/types/database";
import {ListUser} from "./listModel";

export type ListItem = {
	id: number,
	listID: number,
	name: string,
	image: string,
	userID: number,
	is_repeating: string,
	status: string,
	last_bought: number,
	last_bought_date: string,
	userAddedFullName?: string,
	userBoughtFullName?: string
}

export type UserToken = {
	userID: number,
	token: string,
	system: string
}

const listModel = require("./listModel");

const listItemModel = {
	async getListItem(itemID: number): Promise<ModelResponse<ListItem>> {
		const result = await executeQuery(`SELECT * FROM ${TABLES.ListItems} WHERE id = ?`, [itemID], {singleResult: true});

		return {
			data: result.data,
			error: result.error
		} as ModelResponse<ListItem>;
	},

	async getListItems(listID: number): Promise<ModelResponse<ListItem[]>> {
		const result = await executeQuery(`SELECT * FROM ${TABLES.ListItems} WHERE listID = ?`, [listID]) as DatabaseResult<ListItem[]>;

		return {
			data: result.data,
			error: result.error
		} as ModelResponse<ListItem[]>;
	},

	async addListItem(listID: number, name: string, is_repeating: string, userID: number, newImageName?: string): Promise<ModelResponse<DefaultDatabaseResult>> {
		const response: ModelResponse<DefaultDatabaseResult> = {data: {affectedRows: 0}};
		const listResult = await listModel.hasAccessToList(listID, userID);

		if (listResult.error || !listResult.data.id) {
			response.error = {
				message: "Can't add a new item to the specified list.",
				code: 401
			};
			return response;
		}

		const newListItemData = {
			listID,
			name,
			is_repeating,
			userID
		};

		if (newImageName && newImageName.length > 0) {
			Object.assign(newListItemData, {image: newImageName});
		}

		const result = await addDbRecord(TABLES.ListItems, newListItemData);
		return returnModelResponse(response, result);
	},

	async editListItem(listID: number, name: string, is_repeating: string, userID: number, itemID: number): Promise<ModelResponse<DefaultDatabaseResult>> {
		const response: ModelResponse<DefaultDatabaseResult> = {data: {}};
		const listResult = await listModel.hasAccessToList(listID, userID);
		const itemResult = await this.getListItem(itemID);

		if (listResult.error || !listResult.data.id) {
			response.error = {
				message: "Can't edit the selected item.",
				code: 401
			};
		} else if (!itemResult.data || !itemResult.data.id) {
			response.error = {
				message: "Unable to find the selected item",
				code: 400
			};
		} else if (listResult.data.access !== "1" && itemResult.data.userID !== userID) {
			response.error = {
				message: "You can only edit your own items",
				code: 401
			};
		}

		if (response.error) return response;

		const result = await updateDbRecord(TABLES.ListItems, {
			listID,
			name,
			is_repeating,
			userID
		}, ` id = ${itemID} AND listID = ${listID}`);
		return returnModelResponse(response, result);
	},

	async deleteListItem(listID: number, itemID: number, userID: number): Promise<ModelResponse<DefaultDatabaseResult>> {
		const response: ModelResponse<DefaultDatabaseResult> = {data: {affectedRows: 0}};
		const listResult = await listModel.hasAccessToList(listID, userID);
		const itemResult = await this.getListItem(itemID);

		if (listResult.error || !listResult.data.id) {
			response.error = {
				message: "Can't delete the selected item.",
				code: 401
			};
		} else if (!itemResult.data || !itemResult.data.id) {
			response.error = {
				message: "Unable to find the selected item",
				code: 400
			};
		} else if (listResult.data.access !== "1" && itemResult.data.userID !== userID) {
			response.error = {
				message: "You can only delete your own item",
				code: 401
			};
		}

		if (response.error) return response;

		const result = await deleteDbRecord(TABLES.ListItems, `listID = ${listID} AND id = ${itemID}`);
		return returnModelResponse(response, result);
	},

	async getImage(listID: number, itemID: number, userID: number): Promise<ModelResponse<ListItem>> {
		const response: ModelResponse<ListItem> = {
			data: {
				id: 0,
				image: "",
				is_repeating: "0",
				last_bought: 0,
				last_bought_date: "",
				listID: 0,
				name: "",
				status: "0",
				userAddedFullName: "",
				userBoughtFullName: "",
				userID: 0
			}
		};
		const listResult = await listModel.hasAccessToList(listID, userID);

		if (listResult.error || !listResult.data.id) {
			response.error = {
				message: "Can't find the selected item.",
				code: 401
			};
		}

		if (response.error) return response;

		const result = await executeQuery(
			`SELECT image FROM ${TABLES.ListItems} WHERE id = ?`,
			[itemID],
			{singleResult: true}
		);

		return returnModelResponse(response, result);
	},

	async setItemBoughtStatus(listID: number, itemID: number, userID: number): Promise<ModelResponse<DefaultDatabaseResult>> {
		const response: ModelResponse<DefaultDatabaseResult> = {data: {}};
		const listResult = await listModel.hasAccessToList(listID, userID);
		const itemResult = await this.getListItem(itemID);

		if (listResult.error || !listResult.data.id) {
			response.error = {
				message: "Can't update the selected item.",
				code: 401
			};
		} else if (itemResult.error || !itemResult.data.id) {
			response.error = {
				message: "Selected item doesn't exist.",
				code: 404
			};
		}

		if (response.error) return response;

		const item = itemResult.data;

		if (item.last_bought === null && item.last_bought_date === null) {
			const result = await updateDbRecord(TABLES.ListItems, {
				last_bought: userID,
				last_bought_date: Date.now()
			}, `id = ${itemID}`);
			return returnModelResponse(response, result);
		}

		return response;
	},

	async sendBoughtNotification(listID: number, itemID: number, userID: number, system: string) {
		const response: ModelResponse<DefaultDatabaseResult> = {data: {}};
		const listItem = await this.getListItem(itemID);
		const listUsers = await listModel.getListUsers(listID, userID);

		if (listItem.error || !listItem.data.id) {
			response.error = {
				message: "Invalid list item selected.",
				code: 401
			};
		} else if (listUsers.error || listUsers.data.length === 0) {
			response.error = {
				message: "List not found.",
				code: 404
			};
		}

		if (response.error) return response;

		const users = listUsers.data.filter((user: ListUser) => user.userID != userID && user.status === "1");

		const userIDs = users.map((user: ListUser) => user.userID);

		const query = `SELECT * FROM ${TABLES.UserToken} WHERE userID IN (?)`;
		const result = await executeQuery(query, [userIDs.join(","), system]) as DatabaseResult<UserToken[]>;

		if (result.error || result.data.length === 0) return response;

		const tokens = result.data.map((userToken: UserToken) => userToken.token);

		if (tokens.length === 0) return response;
		const currentUser = listUsers.filter((user: ListUser) => user.userID === userID)[0] as ListUser;
		const item = listItem.data;

		sendNotification(`${item.name} was just bought`, `${currentUser.userFullName} bought ${item.name}`, tokens);

		return response;
	}
};

module.exports = listItemModel;
