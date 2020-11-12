import {MysqlError} from "mysql";
import {DatabaseArguments, DatabaseResult} from "./types/database";

const mysql = require('mysql2/promise');

export enum TABLES {
	Users= "users",
	ForbiddenUsernames = "forbidden_usernames",
	Languages = "languages",
	Lists = "lists",
	ListItems = "list_items",
	ListUsers = "list_users",
	NotificationToken = "notification_token",
	Pages = "pages",
	UserToken = "user_token",
	RefreshToken = "refresh_token"
}

export async function executeQuery(query: string, params?: any[], args?: DatabaseArguments): Promise<DatabaseResult<any>> {
	const connection = await mysql.createConnection({
		host: process.env.MYSQL_HOST,
		port: process.env.MYSQL_PORT,
		user: process.env.MYSQL_USER,
		password: process.env.MYSQL_PASSWORD,
		database: process.env.MYSQL_DATABASE
	});

	const dbResult: DatabaseResult<any> = {
		success: true,
		data: []
	};

	try {
		const [rows] = await connection.execute(query, params);
		connection.end();
		dbResult.data = (args && args.singleResult === true && rows.length > 0) ? rows[0] : rows;
	} catch (e) {
		dbResult.success = false;
		dbResult.error = {
			message: e.message,
			code: e.code
		};
	}

	return dbResult;
}
