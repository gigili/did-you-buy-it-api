import {addDbRecord, deleteDbRecord, executeQuery, TABLES, updateDbRecord} from "../util/db";
import {DatabaseResult} from "../util/types/database";
import {ModelResponse} from "../util/types";

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

const listModel = require("./listModel");

const listItemModel = {
	getListItem(itemID: number): Promise<DatabaseResult<any>> {
		return executeQuery(`SELECT * FROM ${TABLES.ListItems} WHERE id = ?`, [itemID], {singleResult: true});
	},

	getListItems(listID: number): Promise<DatabaseResult<ListItem>> {
		return executeQuery(`SELECT * FROM ${TABLES.ListItems} WHERE listID = ?`, [listID]);
	},

	async addListItem(listID: number, name: string, is_repeating: string, userID: number): Promise<DatabaseResult<any> | ModelResponse> {
		const listResult = await listModel.hasAccessToList(listID, userID);

		if (!listResult.success || !listResult.data.id) {
			return {
				error: {
					message: "Can't add a new item to the specified list.",
					code: 401
				}
			} as ModelResponse;
		}

		return addDbRecord(TABLES.ListItems, {
			listID,
			name,
			is_repeating,
			userID
		});
	},

	async editListItem(listID: number, name: string, is_repeating: string, userID: number, itemID: number): Promise<DatabaseResult<any> | ModelResponse> {
		const listResult = await listModel.hasAccessToList(listID, userID);
		const itemResult = await this.getListItem(itemID);

		if (!listResult.success || !listResult.data.id) {
			return {
				error: {
					message: "Can't edit the selected item.",
					code: 401
				}
			} as ModelResponse;
		}

		if (!itemResult.success || !itemResult.data.id) {
			return {
				error: {
					message: "Unable to find the selected item",
					code: 400
				}
			} as ModelResponse;
		}

		if (listResult.data.access !== "1" && itemResult.data.userID !== userID) {
			return {
				error: {
					message: "You can only edit your own items",
					code: 401
				}
			} as ModelResponse;
		}

		return updateDbRecord(TABLES.ListItems, {
			listID,
			name,
			is_repeating,
			userID
		}, ` id = ${itemID} AND listID = ${listID}`);
	},

	async deleteListItem(listID: number, itemID: number, userID: number): Promise<DatabaseResult<any> | ModelResponse> {
		const listResult = await listModel.hasAccessToList(listID, userID);
		const itemResult = await this.getListItem(itemID);

		if (!listResult.success || !listResult.data.id) {
			return {
				error: {
					message: "Can't delete the selected item.",
					code: 401
				}
			} as ModelResponse;
		}

		if (!itemResult.success || !itemResult.data.id) {
			return {
				error: {
					message: "Unable to find the selected item",
					code: 400
				}
			} as ModelResponse;
		}

		if (listResult.data.access !== "1" && itemResult.data.userID !== userID) {
			return {
				error: {
					message: "You can only delete your own item",
					code: 401
				}
			} as ModelResponse;
		}

		return deleteDbRecord(TABLES.ListItems, `listID = ${listID} AND id = ${itemID}`);
	}
};

module.exports = listItemModel;
