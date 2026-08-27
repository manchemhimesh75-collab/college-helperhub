import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { createHash } from "crypto"

const s3Client = new S3Client({
  region: process.env.S3_REGION || "us-east-1",
  endpoint: process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "",
  },
})

const BUCKET_NAME = process.env.S3_BUCKET_NAME || "college-resources"

export async function uploadFile(
  key: string,
  body: Buffer | Uint8Array | Blob | string,
  contentType: string,
  metadata?: Record<string, string>
): Promise<{ url: string; key: string }> {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: body as any,
    ContentType: contentType,
    Metadata: metadata,
  })
  
  await s3Client.send(command)
  
  const url = `${process.env.S3_ENDPOINT}/${BUCKET_NAME}/${key}`
  return { url, key }
}

export async function getSignedUploadUrl(
  key: string,
  contentType: string,
  expiresIn = 3600
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  })
  
  return getSignedUrl(s3Client, command, { expiresIn })
}

export async function getSignedDownloadUrl(
  key: string,
  expiresIn = 3600,
  filename?: string
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ResponseContentDisposition: filename ? `attachment; filename="${filename}"` : undefined,
  })
  
  return getSignedUrl(s3Client, command, { expiresIn })
}

export async function deleteFile(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  })
  
  await s3Client.send(command)
}

export async function fileExists(key: string): Promise<boolean> {
  try {
    const command = new HeadObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    })
    await s3Client.send(command)
    return true
  } catch {
    return false
  }
}

export function generateStoragePath(
  userId: string,
  resourceType: string,
  filename: string
): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  const ext = filename.split(".").pop()?.toLowerCase() || ""
  return `${resourceType}/${userId}/${timestamp}-${random}.${ext}`
}

export function generateCollectionStoragePath(
  collectionId: string,
  filename: string
): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  const ext = filename.split(".").pop()?.toLowerCase() || ""
  return `collections/${collectionId}/${timestamp}-${random}.${ext}`
}

export async function calculateFileHash(buffer: Buffer): Promise<string> {
  return createHash("sha256").update(buffer).digest("hex")
}

export function getPublicUrl(key: string): string {
  return `${process.env.S3_ENDPOINT}/${BUCKET_NAME}/${key}`
}