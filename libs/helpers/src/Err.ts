export class Err extends Error {
	code: number = 0;
	constructor(code: number, message?: string) {
		super(message);
		code = code;
	}
}
