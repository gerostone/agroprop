export type SignedUpload = {
  uploadUrl: string;
  fileUrl: string;
};

export async function createSignedUpload(_key: string): Promise<SignedUpload> {
  throw new Error("S3 signed upload not implemented yet");
}
