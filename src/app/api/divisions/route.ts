import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const semesterId = searchParams.get("semester_id")

    if (!semesterId) {
      return NextResponse.json({ error: "Semester ID is required" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("divisions")
      .select("*")
      .eq("semester_id", semesterId)
      .eq("is_active", true)
      .order("code")

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ divisions: data || [] })
  } catch (error) {
    console.error("Divisions fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}