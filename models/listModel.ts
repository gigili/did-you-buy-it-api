import "../util/db";
import {addDbRecord, deleteDbRecord, executeQuery, TABLES, updateDbRecord} from "../util/db";
import {DatabaseResult} from "../util/types/database";
import {ModelResponse} from "../util/types";

export type List = {
	id: number,
	userID: number,
	name: string,
	date_created: number
}
export type ListUser = {
	userID: number,
	userFullName: string,
	status: string
}

const listModel = {
	getList(listID: number, ownerID: number): Promise<DatabaseResult<List>> {
		return executeQuery(
			`SELECT * FROM ${TABLES.Lists} WHERE id = ? AND userID = ?`,
			[listID, ownerID],
			{singleResult: true}
		);
	},

	getListsForUser(userID: number): Promise<DatabaseResult<List>> {
		return executeQuery(`SELECT * FROM ${TABLES.Lists} WHERE userID = ?`, [userID]);
	},

	createList(name: string, userID: number): Promise<DatabaseResult<any>> {
		return addDbRecord(TABLES.Lists, {name, userID});
	},

	updateList(listID: number, name: string, userID: number): Promise<DatabaseResult<any>> {
		return updateDbRecord(TABLES.Lists, {name}, `id = ${listID} AND userID = ${userID}`);
	},

	deleteList(listID: number, userID: number): Promise<DatabaseResult<any>> {
		return deleteDbRecord(TABLES.Lists, `id = ${listID} AND userID = ${userID}`);
	},

	getListUsers(listID: number, userID: number): Promise<DatabaseResult<ListUser>> {
		const query = `
			SELECT u.id as userID, u.name as userFullName, lu.status FROM ${TABLES.Lists} AS l 
			LEFT JOIN ${TABLES.ListUsers} AS lu ON lu.listID = l.id
			LEFT JOIN ${TABLES.Users} AS u ON u.id = lu.userID
			WHERE l.id = ? AND l.userID = ?;
		`;

		return executeQuery(query, [listID, userID]);
	},

	async addListUser(listID: number, ownerID: number, userID: number): Promise<DatabaseResult<any> | ModelResponse> {
		const listResponse = await this.getList(listID, ownerID);

		if (!listResponse.success || !listResponse.data.hasOwnProperty("id") || (listResponse.data as List).userID !== ownerID) {
			return {
				error: {
					message: "You can't add a user to the specified list.",
					code: 401
				}
			} as ModelResponse;
		}

		if (ownerID === userID) {
			return {
				error: {
					message: "You can't add your self to the list.",
					code: 401
				}
			} as ModelResponse;
		}

		return addDbRecord(TABLES.ListUsers, {listID, userID, status: "1"});
	},

	async deleteListUser(listID: number, ownerID: number, userID: number): Promise<DatabaseResult<any> | ModelResponse> {
		const listResponse = await this.getList(listID, ownerID);

		if (!listResponse.success || !listResponse.data.hasOwnProperty("id") || (listResponse.data as List).userID !== ownerID) {
			return {
				error: {
					message: "You can't remove a user from the specified list.",
					code: 401
				}
			} as ModelResponse;
		}

		if (ownerID === userID) {
			return {
				error: {
					message: "You can't remove your self from the list.",
					code: 401
				}
			} as ModelResponse;
		}

		return deleteDbRecord(TABLES.ListUsers, ` listID = ${listID} AND userID = ${userID}`);
	},

	hasAccessToList(listID: number, userID: number) {
		//accessLevel 1 = Owner of the list
		//accessLevel 2 = Guest user on the list
		const query = `
			SELECT l.id, IF(lu.userID = ${userID}, '2', '1') as accessLevel FROM ${TABLES.Lists} AS l 
			LEFT JOIN ${TABLES.ListUsers} AS lu ON lu.listID = l.id
			WHERE l.id = ? AND (l.userID = ? OR lu.userID = ?);
		`;

		return executeQuery(query, [listID, userID, userID], {singleResult: true});
	}
};

module.exports = listModel;
