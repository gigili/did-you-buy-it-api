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
