export type InitialPacket<Request = unknown> = {
	auth: string;
	request: Request;
};
