import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { getSignedUploadUrl, generateStoragePath, uploadFile } from "@/lib/storage/s3"

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const status = searchParams.get("status") || "approved"
    const collegeId = searchParams.get("college_id")
    const courseId = searchParams.get("course_id")
    const branchId = searchParams.get("branch_id")
    const semesterId = searchParams.get("semester_id")
    const divisionId = searchParams.get("division_id")
    const subjectId = searchParams.get("subject_id")
    const practicalNumberId = searchParams.get("practical_number_id")
    const resourceType = searchParams.get("resource_type")
    const uploaderId = searchParams.get("uploader_id")
    const tags = searchParams.get("tags")?.split(",").filter(Boolean)
    const sortBy = searchParams.get("sort_by") || "newest"
    const query = searchParams.get("q")

    let queryBuilder = supabase
      .from("resources_with_context")
      .select("*", { count: "exact" })
      .eq("status", status)

    // Apply filters
    if (collegeId) queryBuilder = queryBuilder.eq("college_id", collegeId)
    if (courseId) queryBuilder = queryBuilder.eq("course_id", courseId)
    if (branchId) queryBuilder = queryBuilder.eq("branch_id", branchId)
    if (semesterId) queryBuilder = queryBuilder.eq("semester_id", semesterId)
    if (divisionId) queryBuilder = queryBuilder.eq("division_id", divisionId)
    if (subjectId) queryBuilder = queryBuilder.eq("subject_id", subjectId)
    if (practicalNumberId) queryBuilder = queryBuilder.eq("practical_number_id", practicalNumberId)
    if (resourceType) queryBuilder = queryBuilder.eq("resource_type", resourceType)
    if (uploaderId) queryBuilder = queryBuilder.eq("uploader_id", uploaderId)
    if (tags && tags.length > 0) queryBuilder = queryBuilder.overlaps("tags", tags)

    // Text search
    if (query) {
      queryBuilder = queryBuilder.textSearch("search_vector", query, {
        type: "websearch",
        config: "english",
      })
    }

    // Sorting
    switch (sortBy) {
      case "oldest":
        queryBuilder = queryBuilder.order("created_at", { ascending: true })
        break
      case "popular":
        queryBuilder = queryBuilder.order("download_count", { ascending: false })
        break
      case "rating":
        queryBuilder = queryBuilder.order("rating_avg", { ascending: false })
        break
      case "relevance":
        // Already sorted by search ranking
        break
      default:
        queryBuilder = queryBuilder.order("created_at", { ascending: false })
    }

    // Pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    queryBuilder = queryBuilder.range(from, to)

    const { data, error, count } = await queryBuilder

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({
      data: data || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    })
  } catch (error) {
    console.error("Resources fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const subjectId = formData.get("subject_id") as string
    const practicalNumberId = formData.get("practical_number_id") as string
    const resourceType = formData.get("resource_type") as string
    const tags = JSON.parse(formData.get("tags") as string || "[]")
    const isTemplate = formData.get("is_template") === "true"
    const editableFields = JSON.parse(formData.get("editable_fields") as string || "{}")

    if (!file || !title || !subjectId) {
      return NextResponse.json(
        { error: "File, title, and subject are required" },
        { status: 400 }
      )
    }

    // Get subject to determine academic context
    const { data: subject } = await supabase
      .from("subjects")
      .select("*, semester:semesters(*, academic_year:academic_years(*, branch:branches(*, course:courses(*, college:colleges(*)))))")
      .eq("id", subjectId)
      .single()

    if (!subject) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 })
    }

    // Upload file to S3
    const buffer = Buffer.from(await file.arrayBuffer())
    const storagePath = generateStoragePath(user.id, "resources", file.name)
    const { url: fileUrl } = await uploadFile(storagePath, buffer, file.type)

    // Calculate file hash for duplicate detection
    const fileHash = require("crypto").createHash("sha256").update(buffer).digest("hex")

    // Check for duplicates
    const { data: existing } = await supabase
      .from("resources")
      .select("id, title, download_count, uploader_id")
      .eq("file_hash", fileHash)
      .eq("status", "approved")
      .single()

    if (existing) {
      return NextResponse.json({
        duplicate: true,
        existing: {
          id: existing.id,
          title: existing.title,
          download_count: existing.download_count,
        },
      }, { status: 409 })
    }

    // Create resource
    const { data: resource, error } = await supabase
      .from("resources")
      .insert({
        title,
        description,
        college_id: subject.semester.academic_year.branch.course.college_id,
        course_id: subject.semester.academic_year.branch.course_id,
        branch_id: subject.semester.academic_year.branch_id,
        academic_year_id: subject.semester.academic_year_id,
        semester_id: subject.semester_id,
        division_id: formData.get("division_id") as string || null,
        subject_id: subjectId,
        practical_number_id: practicalNumberId || null,
        file_url: fileUrl,
        file_name: file.name,
        file_size: file.size,
        file_type: file.type,
        file_extension: file.name.split(".").pop()?.toLowerCase() || "",
        file_hash: fileHash,
        storage_path: storagePath,
        resource_type: resourceType || "practical",
        tags,
        is_template: isTemplate,
        editable_fields: editableFields,
        uploader_id: user.id,
        status: "pending",
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Increment upload count
    await supabase.rpc("increment_upload_count", { user_id: user.id })

    // Create document record for parsing
    await supabase
      .from("documents")
      .insert({
        resource_id: resource.id,
        original_file_url: fileUrl,
      })

    return NextResponse.json({ resource })
  } catch (error) {
    console.error("Resource upload error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}