import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export type SignedUpload = {
  uploadUrl: string;
  fileUrl: string;
  key: string;
};

function getEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing env ${name}`);
  return value;
}

function getClient() {
  return new S3Client({
    region: getEnv("S3_REGION"),
    endpoint: getEnv("S3_ENDPOINT"),
    credentials: {
      accessKeyId: getEnv("S3_ACCESS_KEY_ID"),
      secretAccessKey: getEnv("S3_SECRET_ACCESS_KEY")
    },
    forcePathStyle: true
  });
}

export async function createSignedUpload(input: {
  key: string;
  contentType: string;
}): Promise<SignedUpload> {
  const bucket = getEnv("S3_BUCKET");
  const publicBase = getEnv("S3_PUBLIC_BASE_URL");

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: input.key,
    ContentType: input.contentType
  });

  const uploadUrl = await getSignedUrl(getClient(), command, { expiresIn: 60 * 10 });
  const fileUrl = `${publicBase}/${input.key}`;

  return {
    uploadUrl,
    fileUrl,
    key: input.key
  };
}
