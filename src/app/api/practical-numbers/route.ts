import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const subjectId = searchParams.get("subject_id")
    const type = searchParams.get("type") || "practical"

    if (!subjectId) {
      return NextResponse.json({ error: "Subject ID is required" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("practical_numbers")
      .select("*")
      .eq("subject_id", subjectId)
      .eq("type", type)
      .eq("is_active", true)
      .order("number")

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ practicalNumbers: data || [] })
  } catch (error) {
    console.error("Practical numbers fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}