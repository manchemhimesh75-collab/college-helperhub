import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get("course_id")

    if (!courseId) {
      return NextResponse.json({ error: "Course ID is required" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("branches")
      .select("*")
      .eq("course_id", courseId)
      .eq("is_active", true)
      .order("name")

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ branches: data || [] })
  } catch (error) {
    console.error("Branches fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}