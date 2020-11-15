export type DatabaseResult<T> = {
	success: boolean,
	data: T,
	error?: {
		message: string,
		code: number
	}
}

export type DatabaseArguments = {
	singleResult?: boolean
}

export type DefaultDatabaseResult = {
	fieldCount?: number,
	affectedRows?: number,
	insertId?: number,
	info?: string,
	serverStatus?: number,
	warningStatus?: number,
	changedRows?: number
}
