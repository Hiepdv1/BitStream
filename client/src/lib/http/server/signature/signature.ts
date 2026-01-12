/* eslint-disable @typescript-eslint/no-explicit-any */
import crypto from "crypto";

interface SignatureOptions {
  KeyId: string;
  Secret: string;
}

export const CreateSignature = async (
  method: string,
  url: string,
  body: string,
  opts: SignatureOptions
) => {
  const timestamp = Math.floor(Date.now() / 1000).toString();

  const nonce = crypto.randomBytes(32).toString("hex");

  const bodyHash = crypto.createHash("sha256").update(body).digest("hex");

  const canonical = [method, url, timestamp, nonce, bodyHash].join("\n");

  const keyBuffer = Buffer.from(opts.Secret, "base64");

  const mac = crypto
    .createHmac("sha256", keyBuffer)
    .update(canonical)
    .digest("base64");

  return {
    signature: mac,
    timestamp,
    nonce,
  };
};
