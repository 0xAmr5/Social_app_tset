import { decrypt, encrypt } from "../utils/security/encrypt.security";

export const Globalencrypt = ({ plainText }: { plainText: string }) => encrypt(plainText);

export const Globaldecrypt = ({ cipherText }: { cipherText: string }) => decrypt(cipherText);
