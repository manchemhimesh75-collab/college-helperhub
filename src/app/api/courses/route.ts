import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const collegeId = searchParams.get("college_id")

    let query = supabase
      .from("courses")
      .select("*")
      .eq("is_active", true)
      .order("name")

    if (collegeId) {
      query = query.eq("college_id", collegeId)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ courses: data || [] })
  } catch (error) {
    console.error("Courses fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}