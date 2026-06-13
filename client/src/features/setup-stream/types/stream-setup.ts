export interface streamKeyResponse {
  streamID: string;
  streamKey: string;
  rtmpUrl: string;
  dashUrl: string;
  expiresAt?: string;
}

export interface ManifestResponse {
  manifestUrl: string;
  expiresMs: number;
}
