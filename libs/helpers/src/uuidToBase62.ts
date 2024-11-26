import { base16to62 } from './convertBases';
import { uuidToHex } from './uuidToHex';

export const uuidToBase62 = (uuid: string) => base16to62(uuidToHex(uuid));
