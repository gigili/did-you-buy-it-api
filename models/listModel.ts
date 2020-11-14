import "../util/db";
import {addDbRecord, deleteDbRecord, executeQuery, TABLES, updateDbRecord} from "../util/db";
import {DatabaseResult} from "../util/types/database";

export type List = {
	id: number,
	userID: number,
	name: string,
	date_created: number
}

const listModel = {
	async getListsForUser(userID: number) {
		return await executeQuery("SELECT * FROM lists WHERE userID = ?", [userID]) as DatabaseResult<List>;
	},

	createList(name: string, userID: number): Promise<DatabaseResult<any>> {
		return addDbRecord(TABLES.Lists, {name, userID});
	},

	updateList(listID: number, name: string, userID: number): Promise<DatabaseResult<any>> {
		return updateDbRecord(TABLES.Lists, {name}, `id = ${listID} AND userID = ${userID}`);
	},

	deleteList(listID: number, userID: number): Promise<DatabaseResult<any>> {
		return deleteDbRecord(TABLES.Lists, `id = ${listID} AND userID = ${userID}`);
	}
}


module.exports = listModel;
