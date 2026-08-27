import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { getSignedDownloadUrl } from "@/lib/storage/s3"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    const { resourceId, fileType = "original" } = await request.json()

    if (!resourceId) {
      return NextResponse.json({ error: "Resource ID is required" }, { status: 400 })
    }

    const { data: resource, error } = await supabase
      .from("resources")
      .select("id, file_url, file_name, storage_path, file_extension, uploader_id")
      .eq("id", resourceId)
      .single()

    if (error || !resource) {
      return NextResponse.json({ error: "Resource not found" }, { status: 404 })
    }

    // Check if resource is approved or user is owner/admin
    if (resource.uploader_id !== user?.id) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user?.id || "")
        .single()
      
      const isAdminOrHost = profile?.role === "admin" || profile?.role === "host"
      if (!isAdminOrHost) {
        // Check if resource is approved
        const { data: approvedResource } = await supabase
          .from("resources")
          .select("status")
          .eq("id", resourceId)
          .single()
        
        if (!approvedResource || approvedResource.status !== "approved") {
          return NextResponse.json({ error: "Resource not available for download" }, { status: 403 })
        }
      }
    }

    let downloadUrl = resource.file_url
    let downloadFilename = resource.file_name

    if (fileType === "docx" || fileType === "pdf") {
      // For edited versions, generate signed URL for the edited file
      // This would be implemented with document editing
      downloadUrl = await getSignedDownloadUrl(resource.storage_path, 3600, downloadFilename)
    } else {
      downloadUrl = await getSignedDownloadUrl(resource.storage_path, 3600, downloadFilename)
    }

    // Record download
    await supabase.from("downloads").insert({
      resource_id: resourceId,
      user_id: user?.id || null,
      file_type: fileType,
    })

    return NextResponse.json({
      downloadUrl,
      filename: downloadFilename,
    })
  } catch (error) {
    console.error("Download error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}