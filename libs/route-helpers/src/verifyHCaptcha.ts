import { Err } from '@lyku/helpers';

export interface HCaptchaVerifyParams {
	secret?: string;
	remoteip: string;
	response: string;
}
export interface HCaptchaVerifyResponse {
	success: true | false; // is the passcode valid, and does it meet security criteria you specified, e.g. sitekey?
	challenge_ts: string; // timestamp of the challenge (ISO format yyyy-MM-dd'T'HH:mm:ssZZ)
	hostname: string; // the hostname of the site where the challenge was passed
	credit?: true | false; // optional: deprecated field
	'error-codes'?: number[]; // optional: any error codes
	score?: number; // ENTERPRISE feature: a score denoting malicious activity.
	score_reason?: number[]; // ENTERPRISE feature: reason(s) for score.
}
export async function verifyHCaptcha(
	params: HCaptchaVerifyParams,
): Promise<HCaptchaVerifyResponse> {
	const secret = process.env['HCAPTCHA_SECRET'];
	if (!secret) throw new Error('HCAPTCHA_SECRET not set!');
	const formData = new URLSearchParams({
		...params,
		secret: secret,
	});

	const response = await fetch('https://api.hcaptcha.com/siteverify', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
		},
		body: formData.toString(),
	});

	const json = (await response.json()) as HCaptchaVerifyResponse;
	if (!json.success)
		throw new Err(
			403,
			'HCaptcha verification failed: ' + JSON.stringify(json, null, 4),
		);
	return json;
}
