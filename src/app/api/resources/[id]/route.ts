import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { getSignedDownloadUrl } from "@/lib/storage/s3"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params

    const { data: resource, error } = await supabase
      .from("resources_with_context")
      .select("*")
      .eq("id", id)
      .single()

    if (error || !resource) {
      return NextResponse.json({ error: "Resource not found" }, { status: 404 })
    }

    // Increment view count
    await supabase
      .from("resources")
      .update({ view_count: resource.view_count + 1 })
      .eq("id", id)

    // Get versions
    const { data: versions } = await supabase
      .from("resource_versions")
      .select("*")
      .eq("resource_id", id)
      .order("version", { ascending: false })

    // Get ratings
    const { data: ratings } = await supabase
      .from("ratings")
      .select("*, user:profiles(full_name, avatar_url)")
      .eq("resource_id", id)
      .order("created_at", { ascending: false })
      .limit(10)

    // Get comments
    const { data: comments } = await supabase
      .from("comments")
      .select("*, user:profiles(full_name, avatar_url), votes:comment_votes(user_id, is_helpful)")
      .eq("resource_id", id)
      .is("parent_id", null)
      .order("created_at", { ascending: false })

    return NextResponse.json({
      resource,
      versions: versions || [],
      ratings: ratings || [],
      comments: comments || [],
    })
  } catch (error) {
    console.error("Resource fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    // Check ownership or admin/host role
    const { data: resource } = await supabase
      .from("resources")
      .select("uploader_id, status")
      .eq("id", id)
      .single()

    if (!resource) {
      return NextResponse.json({ error: "Resource not found" }, { status: 404 })
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    const isOwner = resource.uploader_id === user.id
    const isAdminOrHost = profile?.role === "admin" || profile?.role === "host"

    if (!isOwner && !isAdminOrHost) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Owners can only update draft/pending resources
    if (isOwner && !isAdminOrHost && !["draft", "pending"].includes(resource.status)) {
      return NextResponse.json({ error: "Cannot update approved resource" }, { status: 400 })
    }

    const allowedFields = [
      "title", "description", "tags", "resource_type", "is_template", 
      "editable_fields", "division_id", "practical_number_id"
    ]
    
    if (isAdminOrHost) {
      allowedFields.push("status", "reject_reason")
    }

    const updates: Record<string, any> = {}
    for (const field of allowedFields) {
      if (field in body) {
        updates[field] = body[field]
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 })
    }

    const { data: updated, error } = await supabase
      .from("resources")
      .update(updates)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ resource: updated })
  } catch (error) {
    console.error("Resource update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const { data: resource } = await supabase
      .from("resources")
      .select("uploader_id, storage_path")
      .eq("id", id)
      .single()

    if (!resource) {
      return NextResponse.json({ error: "Resource not found" }, { status: 404 })
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    const isOwner = resource.uploader_id === user.id
    const isAdminOrHost = profile?.role === "admin" || profile?.role === "host"

    if (!isOwner && !isAdminOrHost) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Delete from storage
    await supabase.storage.from("resources").remove([resource.storage_path])

    // Delete from database
    const { error } = await supabase
      .from("resources")
      .delete()
      .eq("id", id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Resource delete error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}