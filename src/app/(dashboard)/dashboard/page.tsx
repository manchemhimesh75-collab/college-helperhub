"use client";

import { cn, formatRelativeTime, getInitials, getColorForString } from "@/lib/utils";
import { useSession } from "@/hooks/use-session";
import { createClient } from "@/lib/supabase/client";
import type { Resource } from "@/lib/types";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  Clock,
  TrendingUp,
  Bookmark,
  Download,
  Clipboard,
  Search,
  Plus,
  Filter,
  GraduationCap,
  FolderOpen,
  Star,
  ArrowRight,
  ExternalLink,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DashboardData {
  myUploads: Resource[];
  recentResources: Resource[];
  popularResources: Resource[];
  savedResources: Resource[];
  mySubjects: Array<{ id: string; name: string; short_name?: string; code: string }>;
}

export default function DashboardPage() {
  const { profile } = useSession();
  const [data, setData] = useState<DashboardData>({
    myUploads: [],
    recentResources: [],
    popularResources: [],
    savedResources: [],
    mySubjects: [],
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const supabase = createClient();
      
      // Fetch all data in parallel
      const [
        { data: myUploads },
        { data: recentResources },
        { data: popularResources },
        { data: savedResources },
        { data: mySubjects },
      ] = await Promise.all([
        supabase
          .from("resources_with_context")
          .select("*")
          .eq("uploader_id", profile?.id)
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("resources_with_context")
          .select("*")
          .eq("status", "approved")
          .order("created_at", { ascending: false })
          .limit(10),
        supabase
          .from("resources_with_context")
          .select("*")
          .eq("status", "approved")
          .order("download_count", { ascending: false })
          .limit(10),
        supabase
          .from("bookmarks")
          .select("resource:resources_with_context(*)")
          .eq("user_id", profile?.id)
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("subjects")
          .select("id, name, short_name, code")
          .eq("semester_id", profile?.semester_id)
          .eq("is_active", true)
          .order("name"),
      ]);

      setData({
        myUploads: myUploads || [],
        recentResources: recentResources || [],
        popularResources: popularResources || [],
        savedResources: savedResources?.map((b: any) => b.resource).filter(Boolean) || [],
        mySubjects: mySubjects || [],
      });
    } catch (error) {
      console.error("Dashboard fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge variant="success">Approved</Badge>;
      case "pending":
        return <Badge variant="warning">Pending Review</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      case "draft":
        return <Badge variant="secondary">Draft</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const renderResourceCard = (resource: Resource, showActions = true) => (
    <Link
      href={`/resources/${resource.id}`}
      className="group flex items-start gap-4 p-4 rounded-lg border bg-white dark:bg-gray-900 hover:border-primary/50 hover:shadow-md transition-all"
    >
      <div className={cn("flex h-14 w-14 items-center justify-center rounded-lg flex-shrink-0", getColorForString(resource.file_extension))}>
        {resource.file_extension === "pdf" ? (
          <FileText className="h-7 w-7 text-white" />
        ) : resource.file_extension === "docx" ? (
          <FileText className="h-7 w-7 text-white" />
        ) : (
          <FileText className="h-7 w-7 text-white" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-medium text-foreground truncate">{resource.title}</h4>
          {getStatusBadge(resource.status)}
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mb-2">
          <span className="flex items-center gap-1">
            <GraduationCap className="h-3 w-3" />
            {resource.subject_short_name || resource.subject_name}
          </span>
          {resource.practical_number && (
            <span>Practical {resource.practical_number}</span>
          )}
          <span>{resource.year_label}</span>
          <span>{resource.division_name}</span>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Download className="h-3 w-3" />
            {resource.download_count}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatRelativeTime(resource.created_at)}
          </span>
          {resource.uploader_name && (
            <span className="flex items-center gap-1 truncate">
              <Avatar className="h-5 w-5">
                <AvatarImage src={resource.uploader_avatar} alt="" />
                <AvatarFallback>{getInitials(resource.uploader_name)}</AvatarFallback>
              </Avatar>
              {resource.uploader_name}
            </span>
          )}
        </div>
      </div>
      {showActions && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
              <ExternalLink className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/resources/${resource.id}`}>View Details</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/resources/${resource.id}?edit=true`}>Edit & Personalize</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>Save to Collection</DropdownMenuItem>
            <DropdownMenuItem>Download Original</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </Link>
  );

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Loading...</h1>
            <p className="text-muted-foreground">Welcome to your dashboard</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {greeting()}, {profile?.full_name?.split(" ")[0] || "Student"} 👋
          </h1>
          <p className="text-muted-foreground">
            Here&apos;s what&apos;s happening with your academic resources
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative hidden sm:block w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search practicals, assignments, notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Link href="/upload">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Upload
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold">{data.myUploads.length}</p>
              <p className="text-sm text-muted-foreground">My Uploads</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
              <Bookmark className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold">{data.savedResources.length}</p>
              <p className="text-sm text-muted-foreground">Saved Resources</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
              <Clipboard className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold">12</p>
              <p className="text-sm text-muted-foreground">Clipboard Items</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
              <Download className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold">{profile?.download_count || 0}</p>
              <p className="text-sm text-muted-foreground">Total Downloads</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="subjects">My Subjects</TabsTrigger>
          <TabsTrigger value="uploads">My Uploads</TabsTrigger>
          <TabsTrigger value="saved">Saved</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* My Subjects */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold">My Subjects</h2>
                <p className="text-sm text-muted-foreground">
                  {data.mySubjects.length} subjects this semester
                </p>
              </div>
              <Link href="/explore">
                <Button variant="ghost" size="sm" className="gap-1">
                  View All
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <ScrollArea className="h-40">
              <div className="flex gap-3 pb-4">
                {data.mySubjects.length > 0 ? (
                  data.mySubjects.map((subject) => (
                    <Link
                      key={subject.id}
                      href={`/subjects/${subject.id}`}
                      className="flex flex-col items-center gap-2 px-4 py-3 rounded-lg border bg-white dark:bg-gray-900 hover:border-primary/50 hover:shadow-md transition-all min-w-[100px]"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary font-semibold">
                        {subject.short_name || subject.code.slice(0, 3).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium truncate max-w-[100px] text-center">
                        {subject.short_name || subject.name}
                      </span>
                    </Link>
                  ))
                ) : (
                  <div className="flex-1 flex items-center justify-center text-muted-foreground">
                    <p className="text-center">
                      No subjects found for your current semester.<br />
                      <Link href="/settings" className="text-primary underline">
                        Update your academic profile
                      </Link>
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Link href="/upload" className="flex flex-col items-center gap-3 p-6 rounded-lg border bg-white dark:bg-gray-900 hover:border-primary/50 hover:shadow-md transition-all">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Upload className="h-6 w-6" />
                </div>
                <span className="font-medium">Upload File</span>
                <p className="text-xs text-muted-foreground text-center">Share your resources</p>
              </Link>
              <Link href="/clipboard" className="flex flex-col items-center gap-3 p-6 rounded-lg border bg-white dark:bg-gray-900 hover:border-primary/50 hover:shadow-md transition-all">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                  <Clipboard className="h-6 w-6" />
                </div>
                <span className="font-medium">Clipboard</span>
                <p className="text-xs text-muted-foreground text-center">Access saved items</p>
              </Link>
              <Link href="/saved" className="flex flex-col items-center gap-3 p-6 rounded-lg border bg-white dark:bg-gray-900 hover:border-primary/50 hover:shadow-md transition-all">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                  <Bookmark className="h-6 w-6" />
                </div>
                <span className="font-medium">Saved Files</span>
                <p className="text-xs text-muted-foreground text-center">Your bookmarks</p>
              </Link>
              <Link href="/collections" className="flex flex-col items-center gap-3 p-6 rounded-lg border bg-white dark:bg-gray-900 hover:border-primary/50 hover:shadow-md transition-all">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                  <FolderOpen className="h-6 w-6" />
                </div>
                <span className="font-medium">Collections</span>
                <p className="text-xs text-muted-foreground text-center">Browse bundles</p>
              </Link>
            </div>
          </div>

          {/* Popular Resources */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Popular Resources</h2>
              <Link href="/explore?sort=popular">
                <Button variant="ghost" size="sm" className="gap-1">
                  View All
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="space-y-3">
              {data.popularResources.length > 0 ? (
                data.popularResources.map((resource) => renderResourceCard(resource))
              ) : (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    No popular resources found
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Recent Resources */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Recently Added</h2>
              <Link href="/explore?sort=newest">
                <Button variant="ghost" size="sm" className="gap-1">
                  View All
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="space-y-3">
              {data.recentResources.length > 0 ? (
                data.recentResources.map((resource) => renderResourceCard(resource))
              ) : (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    No recent resources found
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Subjects Tab */}
        <TabsContent value="subjects">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.mySubjects.length > 0 ? (
              data.mySubjects.map((subject) => (
                <Card key={subject.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline">{subject.code}</Badge>
                          {subject.short_name && (
                            <Badge variant="secondary">{subject.short_name}</Badge>
                          )}
                        </div>
                        <h3 className="font-semibold">{subject.name}</h3>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Link href={`/subjects/${subject.id}`} className="flex items-center gap-2 text-sm text-primary hover:underline">
                        View Practicals & Assignments
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                      <Link href={`/explore?subject=${subject.id}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                        Browse All Resources
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No subjects found</h3>
                <p className="text-muted-foreground mb-4">
                  Update your academic profile to see subjects for your semester.
                </p>
                <Link href="/settings">
                  <Button>Update Profile</Button>
                </Link>
              </div>
            )}
          </div>
        </TabsContent>

        {/* My Uploads Tab */}
        <TabsContent value="uploads">
          <div className="space-y-3">
            {data.myUploads.length > 0 ? (
              data.myUploads.map((resource) => renderResourceCard(resource, true))
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No uploads yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Share your practicals, assignments, and notes with fellow students.
                  </p>
                  <Link href="/upload">
                    <Button className="gap-2">
                      <Plus className="h-4 w-4" />
                      Upload Your First Resource
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Saved Tab */}
        <TabsContent value="saved">
          <div className="space-y-3">
            {data.savedResources.length > 0 ? (
              data.savedResources.map((resource) => renderResourceCard(resource))
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Bookmark className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No saved resources</h3>
                  <p className="text-muted-foreground mb-4">
                    Bookmark resources you find useful to access them here.
                  </p>
                  <Link href="/explore">
                    <Button variant="outline" className="gap-2">
                      <Search className="h-4 w-4" />
                      Explore Resources
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}