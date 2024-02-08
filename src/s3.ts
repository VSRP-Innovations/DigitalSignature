import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import client, { BUCKET } from "./aws/s3.config";

const doesObjectExist = async (key: string) => {
  try {
    const command = new HeadObjectCommand({ Bucket: BUCKET, Key: key });
    await client.send(command);
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

export async function getObjUrl(key: string) {
  const isKeyValid: boolean = await doesObjectExist(key);

  if (!isKeyValid) return "";

  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });

  const url: string = await getSignedUrl(client, command);

  return url;
}

export async function putObjUrl(key: string, contentType: string) {
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
  });

  const url: string = await getSignedUrl(client, command);
  return url;
}

export async function deleteObj(key: string) {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });
  await client.send(command);
}

export const isValidMediaType = (value: any) => {
  return ["IMAGE", "VIDEO", "AUDIO", "TEXT"].includes(value);
};

export async function generateMediaDetails(mediaDetails: any) {
  const fileType = mediaDetails.mimeType.split("/")[0]?.toUpperCase();
  const fileExtension = mediaDetails.mimeType.split("/")[1];
  const isValid = isValidMediaType(fileType);
  let contentType, content, mediaUrl;
  if (isValid) {
    contentType = fileType;
  } else {
    contentType = "OTHER";
  }

  const key = `${fileType.toLowerCase()}/${Date.now()}.${fileExtension}`;
  content = key;
  mediaUrl = await putObjUrl(key, mediaDetails.mimeType);

  return { mediaUrl, content, contentType };
}
