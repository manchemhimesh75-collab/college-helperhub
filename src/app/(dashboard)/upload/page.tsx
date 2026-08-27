"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FileText, Upload, X, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { createClient } from "@/lib/supabase/client";
import { useSession } from "@/hooks/use-session";
import { getSignedUploadUrl, generateStoragePath } from "@/lib/storage/s3";
import { validateFile, formatFileSize } from "@/lib/utils";
import { toast } from "react-hot-toast";
import type { ResourceType } from "@/lib/types";

interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

const RESOURCE_TYPES: { value: ResourceType; label: string }[] = [
  { value: "practical", label: "Practical" },
  { value: "assignment", label: "Assignment" },
  { value: "notes", label: "Notes" },
  { value: "reference", label: "Reference Material" },
  { value: "question_paper", label: "Question Paper" },
  { value: "syllabus", label: "Syllabus" },
  { value: "other", label: "Other" },
];

export default function UploadPage() {
  const router = useRouter();
  const { profile } = useSession();

  const [step, setStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    subjectId: "",
    practicalNumberId: "",
    resourceType: "practical" as ResourceType,
    tags: "" as string,
    isTemplate: false,
    divisionId: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const [colleges, setColleges] = useState<Array<{id: string; name: string; code: string}>>([]);
  const [courses, setCourses] = useState<Array<{id: string; name: string; code: string}>>([]);
  const [branches, setBranches] = useState<Array<{id: string; name: string; code: string}>>([]);
  const [academicYears, setAcademicYears] = useState<Array<{id: string; label: string; year_number: number}>>([]);
  const [semesters, setSemesters] = useState<Array<{id: string; label: string; semester_number: number}>>([]);
  const [divisions, setDivisions] = useState<Array<{id: string; name: string; code: string}>>([]);
  const [subjects, setSubjects] = useState<Array<{id: string; name: string; short_name?: string; code: string}>>([]);
  const [practicalNumbers, setPracticalNumbers] = useState<Array<{id: string; number: number; title?: string; type: string}>>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  useEffect(() => {
    fetchAcademicHierarchy();
  }, []);

  const fetchAcademicHierarchy = async () => {
    if (!profile) return;
    setLoadingOptions(true);
    try {
      const supabase = createClient();

      // If user has college, fetch courses
      if (profile.college_id) {
        const { data } = await supabase
          .from("courses")
          .select("id, name, code")
          .eq("college_id", profile.college_id)
          .eq("is_active", true)
          .order("name");
        if (data) setCourses(data);
      }

      // If user has course, fetch branches
      if (profile.course_id) {
        const { data } = await supabase
          .from("branches")
          .select("id, name, code")
          .eq("course_id", profile.course_id)
          .eq("is_active", true)
          .order("name");
        if (data) setBranches(data);
      }

      // If user has branch, fetch academic years
      if (profile.branch_id) {
        const { data } = await supabase
          .from("academic_years")
          .select("id, label, year_number")
          .eq("branch_id", profile.branch_id)
          .eq("is_active", true)
          .order("year_number");
        if (data) setAcademicYears(data);
      }

      // If user has academic year, fetch semesters
      if (profile.academic_year_id) {
        const { data } = await supabase
          .from("semesters")
          .select("id, label, semester_number")
          .eq("academic_year_id", profile.academic_year_id)
          .eq("is_active", true)
          .order("semester_number");
        if (data) setSemesters(data);
      }

      // If user has semester, fetch divisions and subjects
      if (profile.semester_id) {
        const [{ data: divs }, { data: subs }] = await Promise.all([
          supabase
            .from("divisions")
            .select("id, name, code")
            .eq("semester_id", profile.semester_id)
            .eq("is_active", true)
            .order("code"),
          supabase
            .from("subjects")
            .select("id, name, short_name, code")
            .eq("semester_id", profile.semester_id)
            .eq("is_active", true)
            .order("name"),
        ]);
        if (divs) setDivisions(divs);
        if (subs) setSubjects(subs);
      }
    } catch (error) {
      console.error("Academic hierarchy fetch error:", error);
    } finally {
      setLoadingOptions(false);
    }
  };

  const fetchPracticalNumbers = async (subjectId: string) => {
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from("practical_numbers")
        .select("id, number, title, type")
        .eq("subject_id", subjectId)
        .eq("is_active", true)
        .order("number");
      if (data) setPracticalNumbers(data);
    } catch (error) {
      console.error("Practical numbers fetch error:", error);
    }
  };

  const handleFileSelect = (selectedFile: File | null) => {
    if (!selectedFile) {
      setFile(null);
      return;
    }

    const validation = validateFile(selectedFile);
    if (!validation.valid) {
      toast.error(validation.error || "Invalid file");
      return;
    }

    setFile(selectedFile);
    if (!formData.title) {
      setFormData(prev => ({ ...prev, title: selectedFile.name.replace(/\.[^/.]+$/, "") }));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    if (!file) newErrors.file = "Please select a file to upload";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.subjectId) newErrors.subjectId = "Subject is required";
    if (!formData.resourceType) newErrors.resourceType = "Resource type is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1) {
      if (validateStep1()) setStep(2);
    } else if (step === 2) {
      if (validateStep2()) setStep(3);
    }
  };

  const handleBack = () => {
    setStep(prev => Math.max(1, prev - 1));
  };

  const uploadFileToStorage = async (file: File): Promise<{ url: string; storagePath: string; fileHash: string }> => {
    const buffer = Buffer.from(await file.arrayBuffer());
    const storagePath = generateStoragePath(profile?.id || "unknown", "resources", file.name);
    
    // Simulate upload progress
    setUploadProgress({ loaded: 0, total: file.size, percentage: 0 });
    
    const uploadUrl = await getSignedUploadUrl(storagePath, file.type);
    
    // Upload with progress simulation
    const xhr = new XMLHttpRequest();
    await new Promise<void>((resolve, reject) => {
      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          setUploadProgress({
            loaded: e.loaded,
            total: e.total,
            percentage: Math.round((e.loaded / e.total) * 100),
          });
        }
      });
      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(new Error("Upload failed"));
        }
      });
      xhr.addEventListener("error", () => reject(new Error("Upload failed")));
      xhr.open("PUT", uploadUrl);
      xhr.setRequestHeader("Content-Type", file.type);
      xhr.send(file);
    });

    const fileHash = require("crypto").createHash("sha256").update(buffer).digest("hex");
    const fileUrl = `${process.env.NEXT_PUBLIC_S3_ENDPOINT}/${process.env.NEXT_PUBLIC_S3_BUCKET_NAME}/${storagePath}`;

    return { url: fileUrl, storagePath, fileHash };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !profile) return;
    if (!validateStep2()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      // Upload to storage
      const { url: fileUrl, storagePath, fileHash } = await uploadFileToStorage(file);

      // Check for duplicates
      const supabase = createClient();
      const { data: existing } = await supabase
        .from("resources")
        .select("id, title, download_count")
        .eq("file_hash", fileHash)
        .eq("status", "approved")
        .single();

      if (existing) {
        toast.error("A similar resource already exists");
        setErrors({ duplicate: `Similar resource "${existing.title}" already exists with ${existing.download_count} downloads` });
        return;
      }

      // Create resource
      const { data: resource, error } = await supabase
        .from("resources")
        .insert({
          title: formData.title,
          description: formData.description,
          college_id: profile.college_id,
          course_id: profile.course_id,
          branch_id: profile.branch_id,
          academic_year_id: profile.academic_year_id,
          semester_id: profile.semester_id,
          division_id: formData.divisionId || profile.division_id,
          subject_id: formData.subjectId,
          practical_number_id: formData.practicalNumberId || null,
          file_url: fileUrl,
          file_name: file.name,
          file_size: file.size,
          file_type: file.type,
          file_extension: file.name.split(".").pop()?.toLowerCase() || "",
          file_hash: fileHash,
          storage_path: storagePath,
          resource_type: formData.resourceType,
          tags: formData.tags.split(",").map(t => t.trim()).filter(Boolean),
          is_template: formData.isTemplate,
          editable_fields: {},
          uploader_id: profile.id,
          status: "pending",
        })
        .select()
        .single();

      if (error) throw error;

      // Create document record
      await supabase
        .from("documents")
        .insert({
          resource_id: resource.id,
          original_file_url: fileUrl,
        });

      // Increment upload count
      await supabase.rpc("increment_upload_count", { user_id: profile.id });

      toast.success("Resource uploaded successfully! It will be visible after host approval.");
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setIsSubmitting(false);
      setUploadProgress(null);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold">Upload Resource</h1>
        <p className="text-muted-foreground">Share your practicals, assignments, and notes with fellow students</p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[
            { number: 1, title: "File", desc: "Select your file" },
            { number: 2, title: "Details", desc: "Add metadata" },
            { number: 3, title: "Submit", desc: "Review & upload" },
          ].map((s, i) => (
            <div key={s.number} className="flex flex-col items-center flex-1 relative">
              <div
                className={`relative flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-medium transition-all ${
                  i + 1 < step
                    ? "bg-primary border-primary text-primary-foreground"
                    : i + 1 === step
                    ? "border-primary bg-background text-primary"
                    : "border-gray-300 bg-background text-gray-400 dark:border-gray-600"
                }`}
              >
                {i + 1 < step ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  s.number
                )}
              </div>
              <div className="mt-2 text-center">
                <p className={`text-xs font-medium ${i + 1 <= step ? "text-foreground" : "text-muted-foreground"}`}>
                  {s.title}
                </p>
                <p className="text-[10px] text-muted-foreground">{s.desc}</p>
              </div>
              {i < 2 && (
                <div
                  className={`absolute top-5 left-1/2 w-full h-0.5 -translate-x-1/2 ${
                    i + 1 < step ? "bg-primary" : "bg-gray-300 dark:bg-gray-600"
                  }`}
                  aria-hidden="true"
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Step {step} of 3</CardTitle>
          <CardDescription>
            {step === 1 && "Select the file you want to upload"}
            {step === 2 && "Add title, description, and categorize your resource"}
            {step === 3 && "Review and submit for approval"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: File Selection */}
          {step === 1 && (
            <div className="space-y-4">
              <div
                className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  file ? "border-primary bg-primary/5" : "border-gray-300 dark:border-gray-600 hover:border-primary/50"
                }`}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  id="file-upload"
                  accept=".pdf,.doc,.docx,.txt,.md,.jpg,.jpeg,.png,.gif,.webp,.svg,.ppt,.pptx,.xls,.xlsx,.csv,.zip,.rar,.7z"
                  onChange={(e) => { const file = e.target.files?.[0]; if (file) handleFileSelect(file); }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={isUploading}
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  {file ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg border">
                        <FileText className="h-10 w-10 text-primary" />
                        <div className="text-left">
                          <p className="font-medium truncate max-w-[200px]">{file.name}</p>
                          <p className="text-sm text-muted-foreground">{formatFileSize(file.size)}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleFileSelect(null); }}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="h-5 w-5" />
                        </Button>
                      </div>
                      <p className="text-sm text-green-600 dark:text-green-400">File selected ✓</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                      <p className="text-lg font-medium">Drag & drop a file here, or click to browse</p>
                      <p className="text-sm text-muted-foreground">
                        Supported: PDF, DOCX, DOC, TXT, MD, JPG, PNG, GIF, PPT, XLS, ZIP (max 50MB)
                      </p>
                    </div>
                  )}
                </label>
              </div>

              {errors.file && (
                <p className="text-sm text-red-600" role="alert">{errors.file}</p>
              )}
            </div>
          )}

          {/* Step 2: Metadata */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="block">Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., DAA Practical 01 - Knapsack Problem"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  error={errors.title}
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of the resource..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="resourceType" className="block">Resource Type *</Label>
                <Select value={formData.resourceType} onValueChange={(v) => setFormData(prev => ({ ...prev, resourceType: v as ResourceType }))} disabled={isSubmitting}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select resource type" />
                  </SelectTrigger>
                  <SelectContent>
                    {RESOURCE_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.resourceType && <p className="text-sm text-red-600" role="alert">{errors.resourceType}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject" className="block">Subject *</Label>
                <Select value={formData.subjectId} onValueChange={(v) => {
                  setFormData(prev => ({ ...prev, subjectId: v, practicalNumberId: "" }));
                  if (v) fetchPracticalNumbers(v);
                }} disabled={isSubmitting || loadingOptions}>
                  <SelectTrigger>
                    <SelectValue placeholder={loadingOptions ? "Loading..." : "Select subject"} />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.short_name || s.name} ({s.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.subjectId && <p className="text-sm text-red-600" role="alert">{errors.subjectId}</p>}
              </div>

              {formData.subjectId && practicalNumbers.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="practicalNumber" className="block">Practical/Assignment Number</Label>
                  <Select value={formData.practicalNumberId} onValueChange={(v) => setFormData(prev => ({ ...prev, practicalNumberId: v }))} disabled={isSubmitting}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select number (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {practicalNumbers.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.type.charAt(0).toUpperCase() + p.type.slice(1)} {p.number}: {p.title || `Practical ${p.number}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="division" className="block">Division</Label>
                <Select value={formData.divisionId} onValueChange={(v) => setFormData(prev => ({ ...prev, divisionId: v }))} disabled={isSubmitting}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select division (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Auto-detect from profile</SelectItem>
                    {divisions.map((d) => (
                      <SelectItem key={d.id} value={d.id}>{d.name} ({d.code})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags" className="block">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  placeholder="Knapsack, Dynamic Programming, DAA"
                  value={formData.tags}
                  onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                  disabled={isSubmitting}
                />
                <p className="text-sm text-muted-foreground">Separate tags with commas</p>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="isTemplate" className="block">Mark as Reusable Template</Label>
                  <p className="text-sm text-muted-foreground">Allow other students to use this as a template with their details</p>
                </div>
                <Switch
                  id="isTemplate"
                  checked={formData.isTemplate}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isTemplate: checked }))}
                  disabled={isSubmitting}
                />
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">File</h4>
                <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <FileText className="h-10 w-10 text-primary" />
                  <div>
                    <p className="font-medium truncate max-w-[200px]">{file?.name}</p>
                    <p className="text-sm text-muted-foreground">{file ? formatFileSize(file.size) : "No file"}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Details</h4>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Title</p>
                    <p className="font-medium">{formData.title || "Not set"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Type</p>
                    <p className="font-medium capitalize">{formData.resourceType.replace("_", " ")}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Subject</p>
                    <p className="font-medium">
                      {subjects.find(s => s.id === formData.subjectId)?.name || "Not selected"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Practical #</p>
                    <p className="font-medium">
                      {practicalNumbers.find(p => p.id === formData.practicalNumberId)?.number ? `Practical ${practicalNumbers.find(p => p.id === formData.practicalNumberId)?.number}` : "Not selected"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Division</p>
                    <p className="font-medium">
                      {divisions.find(d => d.id === formData.divisionId)?.name || "Auto-detect"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Template</p>
                    <p className="font-medium">{formData.isTemplate ? "Yes" : "No"}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-yellow-800 dark:text-yellow-200">Submission for Review</p>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                      Your resource will be reviewed by a host before becoming publicly visible. 
                      You&apos;ll receive a notification once it&apos;s approved or if changes are needed.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Upload Progress */}
          {uploadProgress && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Uploading...</span>
                <span>{uploadProgress.percentage}%</span>
              </div>
              <Progress value={uploadProgress.percentage} className="h-2" />
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={step === 1 || isSubmitting}
            className="w-full sm:w-auto"
          >
            Back
          </Button>
          <div className="flex gap-2">
            {step < 3 ? (
              <Button onClick={handleNext} disabled={isSubmitting || isUploading} className="w-full sm:w-auto">
                Next
              </Button>
            ) : (
              <Button onClick={handleSubmit} loading={isSubmitting} disabled={isUploading} className="w-full sm:w-auto gap-2">
                Submit for Approval
                <Loader2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>

      <div className="text-center text-sm text-muted-foreground">
        <p>By uploading, you agree to our <a href="/terms" className="text-primary hover:underline">Terms of Service</a> and confirm this content doesn&apos;t violate academic integrity policies.</p>
      </div>
    </div>
  );
}