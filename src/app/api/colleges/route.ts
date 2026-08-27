import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("colleges")
      .select("*")
      .eq("is_active", true)
      .order("name")

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ colleges: data || [] })
  } catch (error) {
    console.error("Colleges fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}