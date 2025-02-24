import { exec } from 'child_process';

const promisify = (fn: (...args: any[]) => void) => {
	return (...args: any[]) => {
		return new Promise((resolve, reject) => {
			fn(...args, (err: any, ...results: any[]) =>
				err ? reject(err) : resolve(results)
			);
		});
	};
};
export const run = promisify(exec);
