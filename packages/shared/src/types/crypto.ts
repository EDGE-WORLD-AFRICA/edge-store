export interface IEncryptedPayload{
  salt: number[];
  iv: number[];
  ciphertext: number[];
}