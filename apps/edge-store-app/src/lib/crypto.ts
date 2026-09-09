import { IEncryptedPayload } from "@edge-store/shared";

const encoder = new TextEncoder();
const decoder = new TextDecoder();


export const deriveKey = async (password: string, salt: Uint8Array): Promise<CryptoKey> => {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt as BufferSource,
      iterations: 150000,
      hash: "SHA-256"
    }, 
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    [ "encrypt", "decrypt" ]
  );
};


export const encryptOfflineData = async (data: any, password: string): Promise<IEncryptedPayload> => {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt);

  const encodeData = encoder.encode(JSON.stringify(data));

  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv as BufferSource },
    key,
    encodeData
  );

  return {
    salt: Array.from(salt),
    iv: Array.from(iv),
    ciphertext: Array.from(new Uint8Array(ciphertext))
  };
};


export const decryptOfflineData = async (payload: IEncryptedPayload, password: string): Promise<any> => {
  try{
    const salt = new Uint8Array(payload.salt);
    const iv = new Uint8Array(payload.iv);
    const ciphertext = new Uint8Array(payload.ciphertext);

    const key = await deriveKey(password, salt);

    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: iv as BufferSource },
      key,
      ciphertext
    );

    return JSON.parse(decoder.decode(decrypted));
  } catch {
    throw new Error("Invalid password or corrupted offline data.");
  }
};