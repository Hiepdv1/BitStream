export interface SignaturePayload {
  keyId: string;
  timestamp: number;
  nonce: string;
  signature: string;
}

export interface KeyEntry {
  secret: Buffer;
}
