import "../util/db";
import {executeQuery} from "../util/db";
import {DatabaseResult} from "../util/types/database";

export type List = {
	id: number,
	userID: number,
	name : string,
	date_created: number
}

export class ListModel {
	async getListsForUser(userID: number){
		return await executeQuery("SELECT * FROM lists WHERE userID = ?", [userID]) as DatabaseResult<List>;
	}
}
