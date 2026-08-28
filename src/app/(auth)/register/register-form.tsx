"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { GraduationCap, Mail, Lock, User, Building, BookOpen, Eye, EyeOff, AlertCircle, ChevronRight, CheckCircle, Shield, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { toast } from "react-hot-toast";
import { detectCollegeFromEmail, validatePasswordStrength } from "@/lib/utils/college-detection";

interface College {
  id: string;
  name: string;
  code: string;
}

interface Course {
  id: string;
  name: string;
  code: string;
}

interface Branch {
  id: string;
  name: string;
  code: string;
}

interface AcademicYear {
  id: string;
  label: string;
  year_number: number;
}

interface Semester {
  id: string;
  label: string;
  semester_number: number;
}

interface Semester {
  id: string;
  label: string;
  semester_number: number;
}

const steps = [
  { number: 1, title: "Account", description: "Email & password" },
  { number: 2, title: "College", description: "Select your college" },
  { number: 3, title: "Course", description: "Course & branch" },
  { number: 4, title: "Academic", description: "Year & semester" },
];

export default function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    collegeId: "",
    courseId: "",
    branchId: "",
    academicYearId: "",
    semesterId: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [colleges, setColleges] = useState<College[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);

  const [loadingColleges, setLoadingColleges] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [loadingYears, setLoadingYears] = useState(false);
  const [loadingSemesters, setLoadingSemesters] = useState(false);

  const fetchColleges = async () => {
    setLoadingColleges(true);
    try {
      const res = await fetch("/api/colleges");
      const data = await res.json();
      if (data.colleges) setColleges(data.colleges);
    } catch (error) {
      console.error("Failed to fetch colleges:", error);
    } finally {
      setLoadingColleges(false);
    }
  };

  const fetchCourses = async (collegeId: string) => {
    setLoadingCourses(true);
    setCourses([]);
    setBranches([]);
    setAcademicYears([]);
    setSemesters([]);
    setFormData(prev => ({ ...prev, courseId: "", branchId: "", academicYearId: "", semesterId: "" }));
    try {
      const res = await fetch(`/api/courses?college_id=${collegeId}`);
      const data = await res.json();
      if (data.courses) setCourses(data.courses);
    } catch (error) {
      console.error("Failed to fetch courses:", error);
    } finally {
      setLoadingCourses(false);
    }
  };

  const fetchBranches = async (courseId: string) => {
    setLoadingBranches(true);
    setBranches([]);
    setAcademicYears([]);
    setSemesters([]);
    setFormData(prev => ({ ...prev, branchId: "", academicYearId: "", semesterId: "" }));
    try {
      const res = await fetch(`/api/branches?course_id=${courseId}`);
      const data = await res.json();
      if (data.branches) setBranches(data.branches);
    } catch (error) {
      console.error("Failed to fetch branches:", error);
    } finally {
      setLoadingBranches(false);
    }
  };

  const fetchAcademicYears = async (branchId: string) => {
    setLoadingYears(true);
    setAcademicYears([]);
    setSemesters([]);
    setFormData(prev => ({ ...prev, academicYearId: "", semesterId: "" }));
    try {
      const res = await fetch(`/api/academic-years?branch_id=${branchId}`);
      const data = await res.json();
      if (data.academicYears) setAcademicYears(data.academicYears);
    } catch (error) {
      console.error("Failed to fetch academic years:", error);
    } finally {
      setLoadingYears(false);
    }
  };

  const fetchSemesters = async (academicYearId: string) => {
    setLoadingSemesters(true);
    setSemesters([]);
    setFormData(prev => ({ ...prev, semesterId: "" }));
    try {
      const res = await fetch(`/api/semesters?academic_year_id=${academicYearId}`);
      const data = await res.json();
      if (data.semesters) setSemesters(data.semesters);
    } catch (error) {
      console.error("Failed to fetch semesters:", error);
    } finally {
      setLoadingSemesters(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
    // Auto-detect college from email domain
    if (field === "email" && value.includes("@")) {
      const detected = detectCollegeFromEmail(value);
      if (detected) {
        // Find matching college in our list
        const match = colleges.find(c => c.name === detected.name || c.code === detected.code);
        if (match) {
          setFormData(prev => ({ ...prev, collegeId: match.id }));
        }
      }
    }
  };

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
      if (!formData.email) newErrors.email = "Email is required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Invalid email format";
      if (!formData.password) newErrors.password = "Password is required";
      else {
        const strength = validatePasswordStrength(formData.password);
        if (!strength.valid) {
          newErrors.password = "Password must contain: " + strength.errors.join(", ");
        }
      }
      if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    }

    if (step === 2) {
      if (!formData.collegeId) newErrors.collegeId = "Please select your college";
    }

    if (step === 3) {
      if (!formData.courseId) newErrors.courseId = "Please select your course";
      if (!formData.branchId) newErrors.branchId = "Please select your branch";
    }

    if (step === 4) {
      if (!formData.academicYearId) newErrors.academicYearId = "Please select your academic year";
      if (!formData.semesterId) newErrors.semesterId = "Please select your semester";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(currentStep)) return;

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      toast.success("Account created successfully! Please check your email to verify.");
      router.push(redirect);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  if (typeof window !== "undefined" && colleges.length === 0 && !loadingColleges) {
    fetchColleges();
  }

  if (formData.collegeId && courses.length === 0 && !loadingCourses) {
    fetchCourses(formData.collegeId);
  }
  if (formData.courseId && branches.length === 0 && !loadingBranches) {
    fetchBranches(formData.courseId);
  }
  if (formData.branchId && academicYears.length === 0 && !loadingYears) {
    fetchAcademicYears(formData.branchId);
  }
  if (formData.academicYearId && semesters.length === 0 && !loadingSemesters) {
    fetchSemesters(formData.academicYearId);
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <Input
                  id="fullName"
                  placeholder="Your full name"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                  error={errors.fullName}
                  className="pl-10"
                  disabled={isLoading}
                  autoComplete="name"
                  autoFocus
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">College Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <Input
                  id="email"
                  type="email"
                  placeholder="student@college.edu.in"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  error={errors.email}
                  className="pl-10"
                  disabled={isLoading}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  error={errors.password}
                  className="pl-10 pr-10"
                  disabled={isLoading}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {formData.password && (
                <div className="mt-2 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Password Strength</span>
                    <span className={`font-medium ${
                      validatePasswordStrength(formData.password).strength === 'weak' ? 'text-red-500' :
                      validatePasswordStrength(formData.password).strength === 'medium' ? 'text-yellow-500' : 'text-green-500'
                    }`}>
                      {validatePasswordStrength(formData.password).strength.charAt(0).toUpperCase() + validatePasswordStrength(formData.password).strength.slice(1)}
                    </span>
                  </div>
                  <Progress 
                    value={Math.max(0, Math.min(100, 
                      validatePasswordStrength(formData.password).strength === 'weak' ? 25 :
                      validatePasswordStrength(formData.password).strength === 'medium' ? 60 : 100
                    ))} 
                    className="h-1.5" 
                  />
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    {validatePasswordStrength(formData.password).errors.map((err, i) => (
                      <span key={i} className="flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        {err}
                      </span>
                    ))}
                    {validatePasswordStrength(formData.password).valid && (
                      <span className="flex items-center gap-1 text-green-500">
                        <CheckCircle className="h-3 w-3" />
                        Strong password!
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  error={errors.confirmPassword}
                  className="pl-10"
                  disabled={isLoading}
                  autoComplete="new-password"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="collegeId">Select Your College</Label>
              {formData.collegeId && (
                <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <Shield className="h-4 w-4 text-green-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-700 dark:text-green-400">
                      College Auto-Detected
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-500">
                      {colleges.find(c => c.id === formData.collegeId)?.name || "Detected from email domain"}
                    </p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleInputChange("collegeId", "")}
                    className="text-red-500 hover:text-red-700"
                  >
                    Change
                  </Button>
                </div>
              )}
              <Select
                value={formData.collegeId}
                onValueChange={(value) => handleInputChange("collegeId", value)}
                disabled={isLoading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={formData.collegeId ? "Auto-detected - click Change to modify" : "Search and select your college..."} />
                </SelectTrigger>
                <SelectContent position="popper">
                  {loadingColleges ? (
                    <SelectItem value="" disabled>Loading colleges...</SelectItem>
                  ) : (
                    colleges.map((college) => (
                      <SelectItem key={college.id} value={college.id}>
                        <div className="flex flex-col">
                          <span>{college.name}</span>
                          <span className="text-xs text-muted-foreground">{college.code}</span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.collegeId && <p className="text-sm text-red-600" role="alert">{errors.collegeId}</p>}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="courseId">Select Your Course</Label>
              <Select
                value={formData.courseId}
                onValueChange={(value) => handleInputChange("courseId", value)}
                disabled={isLoading || loadingCourses}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select course..." />
                </SelectTrigger>
                <SelectContent position="popper">
                  {loadingCourses ? (
                    <SelectItem value="" disabled>Loading courses...</SelectItem>
                  ) : (
                    courses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.name} ({course.code})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.courseId && <p className="text-sm text-red-600" role="alert">{errors.courseId}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="branchId">Select Your Branch</Label>
              <Select
                value={formData.branchId}
                onValueChange={(value) => handleInputChange("branchId", value)}
                disabled={isLoading || loadingBranches || !formData.courseId}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={formData.courseId ? "Select branch..." : "Select course first"} />
                </SelectTrigger>
                <SelectContent position="popper">
                  {loadingBranches ? (
                    <SelectItem value="" disabled>Loading branches...</SelectItem>
                  ) : !formData.courseId ? (
                    <SelectItem value="" disabled>Please select a course first</SelectItem>
                  ) : (
                    branches.map((branch) => (
                      <SelectItem key={branch.id} value={branch.id}>
                        {branch.name} ({branch.code})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.branchId && <p className="text-sm text-red-600" role="alert">{errors.branchId}</p>}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="academicYearId">Academic Year</Label>
              <Select
                value={formData.academicYearId}
                onValueChange={(value) => handleInputChange("academicYearId", value)}
                disabled={isLoading || loadingYears || !formData.branchId}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={formData.branchId ? "Select year..." : "Select branch first"} />
                </SelectTrigger>
                <SelectContent position="popper">
                  {loadingYears ? (
                    <SelectItem value="" disabled>Loading years...</SelectItem>
                  ) : !formData.branchId ? (
                    <SelectItem value="" disabled>Please select a branch first</SelectItem>
                  ) : (
                    academicYears.map((year) => (
                      <SelectItem key={year.id} value={year.id}>
                        {year.label} (Year {year.year_number})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.academicYearId && <p className="text-sm text-red-600" role="alert">{errors.academicYearId}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="semesterId">Semester</Label>
              <Select
                value={formData.semesterId}
                onValueChange={(value) => handleInputChange("semesterId", value)}
                disabled={isLoading || loadingSemesters || !formData.academicYearId}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={formData.academicYearId ? "Select semester..." : "Select year first"} />
                </SelectTrigger>
                <SelectContent position="popper">
                  {loadingSemesters ? (
                    <SelectItem value="" disabled>Loading semesters...</SelectItem>
                  ) : !formData.academicYearId ? (
                    <SelectItem value="" disabled>Please select a year first</SelectItem>
                  ) : (
                    semesters.map((sem) => (
                      <SelectItem key={sem.id} value={sem.id}>
                        {sem.label} (Semester {sem.semester_number})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.semesterId && <p className="text-sm text-red-600" role="alert">{errors.semesterId}</p>}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-2 mb-6" aria-label="College Academic Hub Home">
          <GraduationCap className="h-10 w-10 text-primary" aria-hidden="true" />
          <span className="text-2xl font-bold text-foreground">Academic Hub</span>
        </Link>
        <h1 className="text-2xl font-bold text-foreground">Create Your Account</h1>
        <p className="text-muted-foreground mt-2">Step {currentStep} of {steps.length}</p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.number} className="flex flex-col items-center flex-1 relative">
              <div
                className={`relative flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-medium transition-all ${
                  index + 1 < currentStep
                    ? "bg-primary border-primary text-primary-foreground"
                    : index + 1 === currentStep
                    ? "border-primary bg-background text-primary"
                    : "border-gray-300 bg-background text-gray-400 dark:border-gray-600"
                }`}
              >
                {index + 1 < currentStep ? (
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  step.number
                )}
              </div>
              <div className="mt-2 text-center">
                <p className={`text-xs font-medium ${index + 1 <= currentStep ? "text-foreground" : "text-muted-foreground"}`}>
                  {step.title}
                </p>
                <p className="text-[10px] text-muted-foreground">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`absolute top-5 left-1/2 w-full h-0.5 -translate-x-1/2 ${
                    index + 1 < currentStep ? "bg-primary" : "bg-gray-300 dark:bg-gray-600"
                  }`}
                  aria-hidden="true"
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader className="text-center">
          <CardTitle>{steps[currentStep - 1].title}</CardTitle>
          <CardDescription>{steps[currentStep - 1].description}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {renderStep()}

            <div className="flex justify-between pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1 || isLoading}
                className="w-full sm:w-auto"
              >
                Back
              </Button>
              <div className="flex gap-2">
                {currentStep < steps.length ? (
                  <Button
                    type="button"
                    onClick={handleNext}
                    disabled={isLoading}
                    className="w-full sm:w-auto"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" aria-hidden="true" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    loading={isLoading}
                    className="w-full sm:w-auto gap-2"
                  >
                    Create Account
                    <ChevronRight className="h-4 w-4" aria-hidden="true" />
                  </Button>
                )}
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Separator className="w-full" />
          <p className="text-sm text-muted-foreground text-center">
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-medium hover:underline">
              Sign In
            </Link>
          </p>
        </CardFooter>
      </Card>

      <div className="text-center text-sm text-muted-foreground">
        <p>By creating an account, you agree to our <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link></p>
      </div>
    </div>
  );
}