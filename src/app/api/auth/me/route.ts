import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { user: null },
        { status: 200 }
      )
    }

    // Get profile with academic context
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select(`
        *,
        college:colleges(*),
        course:courses(*),
        branch:branches(*),
        academic_year:academic_years(*),
        semester:semesters(*),
        division:divisions(*)
      `)
      .eq("id", user.id)
      .single()

    if (profileError) {
      console.error("Profile fetch error:", profileError)
    }

    return NextResponse.json({
      user: {
        ...user,
        profile,
      },
    })
  } catch (error) {
    console.error("Session error:", error)
    return NextResponse.json(
      { user: null },
      { status: 200 }
    )
  }
}