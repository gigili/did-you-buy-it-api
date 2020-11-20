import "../util/db";
import {addDbRecord, deleteDbRecord, executeQuery, TABLES, updateDbRecord} from "../util/db";
import {DatabaseResult, DefaultDatabaseResult} from "../util/types/database";
import {ModelResponse} from "../util/types";
import {returnModelResponse} from "../util/functions";

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

export type ListAccess = {
	id: number,
	access: string
}

const listModel = {
	async getList(listID: number, ownerID: number): Promise<ModelResponse<List>> {
		const response: ModelResponse<List> = {data: {id: 0, userID: 0, name: "", date_created: 0}};
		const result = await executeQuery(
			`SELECT * FROM ${TABLES.Lists} WHERE id = ? AND userID = ?`,
			[listID, ownerID],
			{singleResult: true}
		);

		return returnModelResponse(response, result);
	},

	async getListsForUser(userID: number): Promise<ModelResponse<List[]>> {
		const response: ModelResponse<List[]> = {data: []};
		const result = await executeQuery(`SELECT * FROM ${TABLES.Lists} WHERE userID = ?`, [userID]);
		return returnModelResponse(response, result);
	},

	async createList(name: string, userID: number): Promise<ModelResponse<DefaultDatabaseResult>> {
		const response: ModelResponse<DefaultDatabaseResult> = {data: {}};
		const result = await addDbRecord(TABLES.Lists, {name, userID});
		return returnModelResponse(response, result);
	},

	async updateList(listID: number, name: string, userID: number): Promise<ModelResponse<DefaultDatabaseResult>> {
		const response: ModelResponse<DefaultDatabaseResult> = {data: {}};
		const result = await updateDbRecord(TABLES.Lists, {name}, `id = ${listID} AND userID = ${userID}`);
		return returnModelResponse(response, result);
	},

	async deleteList(listID: number, userID: number): Promise<ModelResponse<DefaultDatabaseResult>> {
		const response: ModelResponse<DefaultDatabaseResult> = {data: {}};
		const result = await deleteDbRecord(TABLES.Lists, `id = ${listID} AND userID = ${userID}`);
		return returnModelResponse(response, result);
	},

	async getListUsers(listID: number, userID: number): Promise<ModelResponse<ListUser[]>> {
		const response: ModelResponse<ListUser[]> = {data: []};
		const query = `
			SELECT u.id as userID, u.name as userFullName, lu.status FROM ${TABLES.ListUsers} AS lu 
			LEFT JOIN ${TABLES.Lists} AS l ON lu.listID = l.id
			LEFT JOIN ${TABLES.Users} AS u ON u.id = lu.userID
			WHERE l.id = ?
			UNION ALL 
			SELECT u.id, u.name, u.status FROM users AS u
			LEFT JOIN lists AS l ON l.userID = u.id
			WHERE l.id = ?;
		`;

		const result = await executeQuery(query, [listID, listID]);
		return returnModelResponse(response, result);
	},

	async addListUser(listID: number, ownerID: number, userID: number): Promise<DatabaseResult<any> | ModelResponse<DefaultDatabaseResult>> {
		const response: ModelResponse<DefaultDatabaseResult> = {data: {}};
		const listResponse = await this.getList(listID, ownerID);

		if (listResponse.error || !listResponse.data.id || listResponse.data.userID !== ownerID) {
			response.error = {
				message: "You can't add a user to the specified list.",
				code: 401
			};
		} else if (ownerID === userID) {
			response.error = {
				message: "You can't add your self to the list.",
				code: 401
			};
		}

		if (response.error) return response;

		const result = await addDbRecord(TABLES.ListUsers, {listID, userID, status: "1"});
		return returnModelResponse(response, result);
	},

	async deleteListUser(listID: number, ownerID: number, userID: number): Promise<ModelResponse<DefaultDatabaseResult>> {
		const response: ModelResponse<DefaultDatabaseResult> = {data: {}};
		const listResponse = await this.getList(listID, ownerID);

		if (listResponse.error || !listResponse.data.id || listResponse.data.userID !== ownerID) {
			response.error = {
				message: "You can't remove a user from the specified list.",
				code: 401
			};
		} else if (ownerID === userID) {
			response.error = {
				message: "You can't remove your self from the list.",
				code: 401
			};
		}

		if (response.error) return response;

		const result = await deleteDbRecord(TABLES.ListUsers, ` listID = ${listID} AND userID = ${userID}`);
		return returnModelResponse(response, result);
	},

	async hasAccessToList(listID: number, userID: number): Promise<ModelResponse<ListAccess>> {
		const response: ModelResponse<ListAccess> = {data: {id: 0, access: "-1"}};
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

module.exports = listModel;
