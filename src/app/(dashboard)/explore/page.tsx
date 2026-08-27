"use client";

import { useState, useEffect, useCallback } from "react";
import { formatRelativeTime, formatFileSize } from "@/lib/utils";
import {
  Search,
  Filter,
  ChevronDown,
  FileText,
  Download,
  Bookmark,
  Star,
  Clock,
  Eye,
  Edit,
  Share2,
  Flag,
  MoreHorizontal,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { useSession } from "@/hooks/use-session";
import type { Resource, SearchFilters, SearchResult } from "@/lib/types";

const getFileIcon = (extension: string) => {
  const icons: Record<string, any> = {
    pdf: FileText,
    docx: FileText,
    doc: FileText,
    jpg: FileText,
    png: FileText,
  };
  return icons[extension] || FileText;
};

export default function ExplorePage() {
  const { profile } = useSession();
  const [results, setResults] = useState<SearchResult>({
    resources: [],
    total: 0,
    page: 1,
    limit: 20,
    total_pages: 0,
  });
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    query: "",
    status: "approved",
    sort_by: "newest",
    page: 1,
    limit: 20,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [colleges, setColleges] = useState<Array<{id: string; name: string; code: string}>>([]);
  const [courses, setCourses] = useState<Array<{id: string; name: string; code: string}>>([]);
  const [branches, setBranches] = useState<Array<{id: string; name: string; code: string}>>([]);
  const [subjects, setSubjects] = useState<Array<{id: string; name: string; short_name?: string; code: string}>>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  const fetchResources = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== "" && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v));
          } else {
            params.set(key, String(value));
          }
        }
      });

      const res = await fetch(`/api/resources?${params.toString()}`);
      const data = await res.json();
      
      if (data.data) {
        setResults({
          resources: data.data,
          total: data.total,
          page: data.page,
          limit: data.limit,
          total_pages: data.totalPages,
        });
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchFilterOptions = async () => {
    setLoadingOptions(true);
    try {
      const supabase = createClient();
      
      // Fetch colleges
      const { data: collegesData } = await supabase
        .from("colleges")
        .select("id, name, code")
        .eq("is_active", true)
        .order("name");
      if (collegesData) setColleges(collegesData);

      // If user has a college, fetch courses for that college
      if (profile?.college_id) {
        const { data: coursesData } = await supabase
          .from("courses")
          .select("id, name, code")
          .eq("college_id", profile.college_id)
          .eq("is_active", true)
          .order("name");
        if (coursesData) setCourses(coursesData);
      }

      // If user has a course, fetch branches
      if (profile?.course_id) {
        const { data: branchesData } = await supabase
          .from("branches")
          .select("id, name, code")
          .eq("course_id", profile.course_id)
          .eq("is_active", true)
          .order("name");
        if (branchesData) setBranches(branchesData);
      }

      // If user has a semester, fetch subjects
      if (profile?.semester_id) {
        const { data: subjectsData } = await supabase
          .from("subjects")
          .select("id, name, short_name, code")
          .eq("semester_id", profile.semester_id)
          .eq("is_active", true)
          .order("name");
        if (subjectsData) setSubjects(subjectsData);
      }
    } catch (error) {
      console.error("Filter options fetch error:", error);
    } finally {
      setLoadingOptions(false);
    }
  };

  useEffect(() => {
    fetchResources();
    fetchFilterOptions();
  }, [fetchResources]);

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      query: "",
      status: "approved",
      sort_by: "newest",
      page: 1,
      limit: 20,
    });
  };

  const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
    if (key === "status" && value === "approved") return false;
    if (key === "sort_by" && value === "newest") return false;
    if (key === "page" || key === "limit") return false;
    if (value === undefined || value === "" || value === null) return false;
    if (Array.isArray(value) && value.length === 0) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Explore Resources</h1>
          <p className="text-muted-foreground">
            Find practicals, assignments, notes, and more
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="gap-2">
            <Filter className="h-4 w-4" />
            Filters
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-1">
                {Object.entries(filters).filter(([k, v]) => 
                  k !== "status" && k !== "sort_by" && k !== "page" && k !== "limit" && 
                  v !== undefined && v !== "" && v !== null && (!Array.isArray(v) || v.length > 0)
                ).length}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      {/* Filters Sidebar/Drawer */}
      {(showFilters || !loadingOptions) && (
        <Card className={showFilters ? "" : "hidden"}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Filters</h3>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
                  Clear All
                  <Filter className="h-3 w-3" />
                </Button>
              )}
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {/* Search */}
              <div className="md:col-span-2">
                <Label htmlFor="search" className="block text-sm font-medium mb-1">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search by title, description, tags..."
                    value={filters.query || ""}
                    onChange={(e) => handleFilterChange("query", e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* College */}
              <div>
                <Label htmlFor="college" className="block text-sm font-medium mb-1">College</Label>
                <Select value={filters.college_id || ""} onValueChange={(v) => handleFilterChange("college_id", v || undefined)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Colleges" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Colleges</SelectItem>
                    {colleges.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name} ({c.code})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Course */}
              <div>
                <Label htmlFor="course" className="block text-sm font-medium mb-1">Course</Label>
                <Select value={filters.course_id || ""} onValueChange={(v) => handleFilterChange("course_id", v || undefined)} disabled={!profile?.college_id || loadingOptions}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Courses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Courses</SelectItem>
                    {courses.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name} ({c.code})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Branch */}
              <div>
                <Label htmlFor="branch" className="block text-sm font-medium mb-1">Branch</Label>
                <Select value={filters.branch_id || ""} onValueChange={(v) => handleFilterChange("branch_id", v || undefined)} disabled={!profile?.course_id || loadingOptions}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Branches" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Branches</SelectItem>
                    {branches.map((b) => (
                      <SelectItem key={b.id} value={b.id}>{b.name} ({b.code})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Subject */}
              <div>
                <Label htmlFor="subject" className="block text-sm font-medium mb-1">Subject</Label>
                <Select value={filters.subject_id || ""} onValueChange={(v) => handleFilterChange("subject_id", v || undefined)} disabled={!profile?.semester_id || loadingOptions}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Subjects" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Subjects</SelectItem>
                    {subjects.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.short_name || s.name} ({s.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Resource Type */}
              <div>
                <Label htmlFor="resource_type" className="block text-sm font-medium mb-1">Type</Label>
                <Select value={filters.resource_type || ""} onValueChange={(v) => handleFilterChange("resource_type", v || undefined)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Types</SelectItem>
                    <SelectItem value="practical">Practical</SelectItem>
                    <SelectItem value="assignment">Assignment</SelectItem>
                    <SelectItem value="notes">Notes</SelectItem>
                    <SelectItem value="reference">Reference</SelectItem>
                    <SelectItem value="question_paper">Question Paper</SelectItem>
                    <SelectItem value="syllabus">Syllabus</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sort */}
              <div>
                <Label htmlFor="sort" className="block text-sm font-medium mb-1">Sort By</Label>
                <Select value={filters.sort_by} onValueChange={(v) => handleFilterChange("sort_by", v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="popular">Most Downloaded</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      <div className="space-y-4">
        {/* Results Info */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {results.total} resource{results.total !== 1 ? "s" : ""} found
            {filters.query && <span className="ml-2">for "{filters.query}"</span>}
          </p>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="capitalize">{filters.sort_by}</Badge>
          </div>
        </div>

        {/* Resources Grid */}
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse h-64" />
            ))}
          </div>
        ) : results.resources.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {results.resources.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-16 text-center">
              <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No resources found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search or filters to find what you&apos;re looking for.
              </p>
              <Button variant="outline" onClick={clearFilters} className="gap-2">
                <Filter className="h-4 w-4" />
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Pagination */}
        {results.total_pages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleFilterChange("page", results.page - 1)}
              disabled={results.page === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {results.page} of {results.total_pages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleFilterChange("page", results.page + 1)}
              disabled={results.page === results.total_pages}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function ResourceCard({ resource }: { resource: Resource }) {
  const FileIcon = getFileIcon(resource.file_extension);

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
      <div className="relative aspect-video bg-gray-100 dark:bg-gray-800">
        <div className="absolute inset-0 flex items-center justify-center">
          <FileIcon className="h-16 w-16 text-muted-foreground/50" />
        </div>
        <div className="absolute top-2 right-2 flex gap-1">
          <Badge variant="secondary" className="capitalize">{resource.resource_type}</Badge>
          {resource.is_template && <Badge variant="outline">Template</Badge>}
        </div>
        {resource.status !== "approved" && (
          <div className="absolute bottom-2 left-2">
            <Badge variant={resource.status === "pending" ? "warning" : resource.status === "rejected" ? "destructive" : "secondary"}>
              {resource.status}
            </Badge>
          </div>
        )}
      </div>
      <CardContent className="flex-1 flex flex-col p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h4 className="font-medium text-foreground line-clamp-2 flex-1">{resource.title}</h4>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <a href={`/resources/${resource.id}`}>View Details</a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href={`/resources/${resource.id}?edit=true`}>Edit & Personalize</a>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Save</DropdownMenuItem>
              <DropdownMenuItem>Share</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">Report</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3 flex-1">{resource.description || "No description"}</p>
        
        <div className="flex flex-wrap gap-2 mb-3">
          {resource.subject_short_name && (
            <Badge variant="outline">{resource.subject_short_name}</Badge>
          )}
          {resource.practical_number && (
            <Badge variant="secondary">Practical {resource.practical_number}</Badge>
          )}
          {resource.year_label && (
            <Badge variant="outline">{resource.year_label}</Badge>
          )}
          {resource.division_name && (
            <Badge variant="outline">{resource.division_name}</Badge>
          )}
          {resource.tags?.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
          ))}
        </div>

        <Separator />
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Avatar className="h-6 w-6">
                <AvatarImage src={resource.uploader_avatar} alt="" />
                <AvatarFallback className="text-xs">{resource.uploader_name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <span>{resource.uploader_name}</span>
            </div>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatRelativeTime(resource.created_at)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Download className="h-3 w-3" />
              {resource.download_count}
            </span>
            <span className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-current text-yellow-400" />
              {resource.rating_avg.toFixed(1)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}