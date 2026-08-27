import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { getSignedUploadUrl, generateStoragePath } from "@/lib/storage/s3"
import { validateFile } from "@/lib/utils"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { filename, contentType, fileSize } = await request.json()

    if (!filename || !contentType) {
      return NextResponse.json(
        { error: "Filename and content type are required" },
        { status: 400 }
      )
    }

    // Validate file
    const validation = validateFile({ name: filename, size: fileSize, type: contentType } as File)
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    const storagePath = generateStoragePath(user.id, "resources", filename)
    const uploadUrl = await getSignedUploadUrl(storagePath, contentType)

    return NextResponse.json({
      uploadUrl,
      storagePath,
      fileUrl: `${process.env.S3_ENDPOINT}/${process.env.S3_BUCKET_NAME}/${storagePath}`,
    })
  } catch (error) {
    console.error("Signed URL error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}