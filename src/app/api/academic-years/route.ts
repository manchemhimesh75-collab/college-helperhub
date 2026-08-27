import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const branchId = searchParams.get("branch_id")

    if (!branchId) {
      return NextResponse.json({ error: "Branch ID is required" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("academic_years")
      .select("*")
      .eq("branch_id", branchId)
      .eq("is_active", true)
      .order("year_number")

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ academicYears: data || [] })
  } catch (error) {
    console.error("Academic years fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}