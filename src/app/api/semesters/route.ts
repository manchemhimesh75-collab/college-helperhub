import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const academicYearId = searchParams.get("academic_year_id")

    if (!academicYearId) {
      return NextResponse.json({ error: "Academic year ID is required" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("semesters")
      .select("*")
      .eq("academic_year_id", academicYearId)
      .eq("is_active", true)
      .order("semester_number")

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ semesters: data || [] })
  } catch (error) {
    console.error("Semesters fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}