import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { email, password, fullName, collegeId, courseId, branchId, academicYearId, semesterId, divisionId, enrollmentNumber, rollNumber } = await request.json()

    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: "Email, password, and full name are required" },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/verify-email`,
      },
    })

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      )
    }

    if (authData.user) {
      // Update profile with academic info
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          college_id: collegeId,
          course_id: courseId,
          branch_id: branchId,
          academic_year_id: academicYearId,
          semester_id: semesterId,
          division_id: divisionId,
          enrollment_number: enrollmentNumber,
          roll_number: rollNumber,
        })
        .eq("id", authData.user.id)

      if (profileError) {
        console.error("Profile update error:", profileError)
      }
    }

    return NextResponse.json({
      user: authData.user,
      session: authData.session,
      message: "Account created successfully. Please check your email to verify.",
    })
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}