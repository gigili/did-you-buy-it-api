import {DatabaseArguments, DatabaseResult} from "./types/database";
import {Connection} from "mysql2";

const mysql = require("mysql2/promise");

export enum TABLES {
	Users = "users",
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

let connection: Connection;

export async function getConnection(): Promise<Connection> {
	if (connection !== undefined) {
		return connection;
	}
	connection = await mysql.createConnection({
		host: process.env.TYPEORM_HOST,
		port: process.env.TYPEORM_PORT,
		user: process.env.TYPEORM_USERNAME,
		password: process.env.TYPEORM_PASSWORD,
		database: process.env.TYPEORM_DATABASE
	});
	return connection;
}

export async function executeQuery(query: string, params?: any[], args?: DatabaseArguments): Promise<DatabaseResult<any>> {
	const db = await getConnection();
	const dbResult: DatabaseResult<any> = {
		success: true,
		data: []
	};

	try {
		//@ts-ignore
		const [rows] = await db.execute(query, params);
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

export function addDbRecord(table: string, data: {}): Promise<DatabaseResult<any>> {
	let query = `INSERT INTO ${table} (`;

	Object.keys(data).forEach(key => {
		query += `${key},`;
	});

	query = query.slice(0, -1);
	query += `) VALUES (`;

	Object.keys(data).forEach(() => {
		query += `?,`;
	});

	query = query.slice(0, -1);
	query += `);`;

	return executeQuery(query, Object.values(data));
}

export function updateDbRecord(table: string, data: {}, whereCondition: string): Promise<DatabaseResult<any>> {
	let query = `UPDATE ${table} SET `;

	Object.keys(data).forEach(column => {
		query += `${column} = ?,`;
	});

	query = query.slice(0, -1);
	query += ` WHERE ${whereCondition};`;

	return executeQuery(query, Object.values(data));
}

export function deleteDbRecord(table: string, whereCondition: string) {
	const query = `DELETE FROM ${table} WHERE ${whereCondition};`;
	return executeQuery(query);
}
