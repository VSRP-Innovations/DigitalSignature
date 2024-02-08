import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import client, { BUCKET } from "./aws/s3.config";
import { promises as fsPromises } from "fs";
import dotenv from "dotenv";
import { dirname } from "path";
import { v4 as uuidv4 } from "uuid";

dotenv.config();

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

export async function downloadDocumentInTemporaryFolder(key: string) {
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });

  try {
    const response = await client.send(command);
    if (response.Body) {
      const filePath = `./tempFolder/sample-${uuidv4()}.pdf`;
      const directoryPath = dirname(filePath);

      await fsPromises.mkdir(directoryPath, { recursive: true });

      const byteArray = await response.Body?.transformToByteArray();
      await fsPromises.writeFile(filePath, Buffer.from(byteArray));

      console.log("PDF file has been successfully created:", filePath);
      return filePath;
    }
  } catch (err) {
    console.error(err);
  }
}
