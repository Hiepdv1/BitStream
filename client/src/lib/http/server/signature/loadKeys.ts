export interface SignatureKey {
  Id: string;
  Secret: string;
}

export const LoadSignatureKeys = (): SignatureKey[] => {
  const raw = process.env.SIGNATURE_KEYS || "";
  return raw
    .split(",")
    .map((pair) => {
      const [Id, Secret] = pair.split(":");
      if (!Id || !Secret) return null;
      return { Id, Secret };
    })
    .filter(Boolean) as SignatureKey[];
};
