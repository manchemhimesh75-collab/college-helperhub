"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Copy, Download, Edit, MoreHorizontal, FileText, Image, Link2, Code, Table, Search, Filter, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { createClient } from "@/lib/supabase/client";
import { useSession } from "@/hooks/use-session";
import { formatRelativeTime, formatFileSize } from "@/lib/utils";
import { toast } from "react-hot-toast";
import type { ClipboardItem, ClipboardItemType, ClipboardFolder } from "@/lib/types";

const TYPE_ICONS: Record<ClipboardItemType, typeof FileText> = {
  text: FileText,
  image: Image,
  pdf: FileText,
  document: FileText,
  link: Link2,
  code: Code,
  table: Table,
};

function getIconComponent(type: ClipboardItemType) {
  return TYPE_ICONS[type];
}

const TYPE_COLORS: Record<ClipboardItemType, string> = {
  text: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  image: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  pdf: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  document: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  link: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  code: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
  table: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
};

function renderItemContent(item: ClipboardItem) {
  switch (item.type) {
    case "text":
    case "code":
      return (
        <div className="font-mono text-sm bg-gray-100 dark:bg-gray-800 p-3 rounded max-h-32 overflow-auto">
          {item.content}
        </div>
      );
    case "link":
      return (
        <a href={item.content} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline break-all">
          {item.content}
        </a>
      );
    case "image":
      return item.file_url ? (
        <img src={item.file_url} alt={item.title} className="max-h-48 rounded" />
      ) : (
        <div className="text-muted-foreground">No image</div>
      );
    case "pdf":
    case "document":
      return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FileText className="h-4 w-4" />
          <span>{item.file_name || "Document"}</span>
          {item.file_size && <span>({formatFileSize(item.file_size)})</span>}
        </div>
      );
    case "table":
      return <div className="text-sm text-muted-foreground">Table data</div>;
    default:
      return <div className="text-muted-foreground">Unknown type</div>;
  }
}

const TABS: { value: "all" | ClipboardItemType; label: string; icon: any }[] = [
  { value: "all", label: "All", icon: null },
  { value: "text", label: "Text", icon: FileText },
  { value: "image", label: "Images", icon: Image },
  { value: "pdf", label: "PDFs", icon: FileText },
  { value: "document", label: "Docs", icon: FileText },
  { value: "link", label: "Links", icon: Link2 },
  { value: "code", label: "Code", icon: Code },
  { value: "table", label: "Tables", icon: Table },
];

function getDefaultTitle(type: ClipboardItemType) {
  const titles: Record<ClipboardItemType, string> = {
    text: "Text Note",
    image: "Image",
    pdf: "PDF Document",
    document: "Document",
    link: "Link",
    code: "Code Snippet",
    table: "Table",
  };
  return titles[type];
}

function ClipboardContent({ 
  items, 
  onCopy, 
  onDelete, 
  onPin 
}: { 
  items: ClipboardItem[];
  onCopy: (item: ClipboardItem) => void;
  onDelete: (id: string) => void;
  onPin: (item: ClipboardItem) => void;
}) {
  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No items yet</h3>
          <p className="text-muted-foreground">Add your first clipboard item to get started</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => {
        const IconComponent = getIconComponent(item.type);
        return (
          <Card key={item.id} className={item.is_pinned ? "ring-2 ring-primary/50" : ""}>
            <CardHeader className="pb-2 flex items-start justify-between">
              <div className="flex items-center gap-2">
                <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${TYPE_COLORS[item.type]}`}>
                  <IconComponent className="h-4 w-4" />
                </span>
                <div>
                  <h4 className="font-medium truncate">{item.title || "Untitled"}</h4>
                  <Badge variant="outline" className="text-xs capitalize">{item.type}</Badge>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onCopy(item)} className="gap-2">
                    <Copy className="h-4 w-4" />
                    Copy
                  </DropdownMenuItem>
                  {item.file_url && (
                    <DropdownMenuItem asChild>
                      <a href={item.file_url} download={item.file_name} className="gap-2">
                        <Download className="h-4 w-4" />
                        Download
                      </a>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => onPin(item)} className="gap-2" disabled={item.is_pinned}>
                    {item.is_pinned ? "Pinned" : "Pin"}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600 gap-2" onClick={() => onDelete(item.id)}>
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent className="pt-0">
              {renderItemContent(item)}
              <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                <span>{formatRelativeTime(item.created_at)}</span>
                {item.is_pinned && <span className="text-primary">📌 Pinned</span>}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export default function ClipboardPage() {
  const { profile } = useSession();
  const [items, setItems] = useState<ClipboardItem[]>([]);
  const [folders, setFolders] = useState<ClipboardFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ClipboardItemType | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);

  // Dialog states
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [addType, setAddType] = useState<ClipboardItemType>("text");
  const [addContent, setAddContent] = useState("");
  const [addTitle, setAddTitle] = useState("");
  const [addFile, setAddFile] = useState<File | null>(null);
  const [addLink, setAddLink] = useState("");

  const handleTabChange = (value: string) => {
    setActiveTab(value as ClipboardItemType | "all");
  };

  useEffect(() => {
    fetchData();
  }, [profile?.id]);

  const fetchData = async () => {
    if (!profile?.id) return;
    setLoading(true);
    try {
      const supabase = createClient();
      const [{ data: itemsData }, { data: foldersData }] = await Promise.all([
        supabase
          .from("clipboard_items")
          .select("*")
          .eq("user_id", profile.id)
          .order("is_pinned", { ascending: false })
          .order("created_at", { ascending: false }),
        supabase
          .from("clipboard_folders")
          .select("*")
          .eq("user_id", profile.id)
          .order("created_at", { ascending: false }),
      ]);
      if (itemsData) setItems(itemsData);
      if (foldersData) setFolders(foldersData);
    } catch (error) {
      console.error("Clipboard fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = !searchQuery || 
      item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === "all" || item.type === activeTab;
    const matchesFolder = !selectedFolder || item.folder_id === selectedFolder;
    return matchesSearch && matchesTab && matchesFolder;
  });

  const handleAddItem = async () => {
    if (!profile?.id) return;
    
    let fileUrl: string | undefined;
    let fileName: string | undefined;
    let fileSize: number | undefined;
    let fileType: string | undefined;

    if (addFile) {
      fileName = addFile.name;
      fileSize = addFile.size;
      fileType = addFile.type;
      fileUrl = URL.createObjectURL(addFile);
    }

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("clipboard_items")
        .insert({
          user_id: profile.id,
          type: addType,
          title: addTitle || getDefaultTitle(addType),
          content: addType === "link" ? addLink : addContent,
          file_url: fileUrl,
          file_name: fileName,
          file_size: fileSize,
          file_type: fileType,
          folder_id: selectedFolder || null,
        })
        .select()
        .single();

      if (error) throw error;
      setItems(prev => [data, ...prev]);
      toast.success("Added to clipboard");
      resetAddForm();
      setShowAddDialog(false);
    } catch (error) {
      toast.error("Failed to add item");
    }
  };

  const resetAddForm = () => {
    setAddType("text");
    setAddContent("");
    setAddTitle("");
    setAddFile(null);
    setAddLink("");
  };

  const handleCopy = async (item: ClipboardItem) => {
    let textToCopy = "";
    if (item.type === "text" || item.type === "code") {
      textToCopy = item.content || "";
    } else if (item.type === "link") {
      textToCopy = item.content || "";
    } else {
      textToCopy = item.title || "";
    }
    
    await navigator.clipboard.writeText(textToCopy);
    toast.success("Copied to clipboard!");
  };

  const handleDelete = async (id: string) => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("clipboard_items")
        .delete()
        .eq("id", id);
      if (error) throw error;
      setItems(prev => prev.filter(i => i.id !== id));
      toast.success("Item deleted");
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  const handlePin = async (item: ClipboardItem) => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("clipboard_items")
        .update({ is_pinned: !item.is_pinned })
        .eq("id", item.id);
      if (error) throw error;
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, is_pinned: !item.is_pinned } : i));
    } catch (error) {
      toast.error("Failed to update");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Academic Clipboard</h1>
            <p className="text-muted-foreground">Your personal cross-device clipboard for study materials</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse h-64" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Academic Clipboard</h1>
          <p className="text-muted-foreground">Your personal cross-device clipboard for study materials</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>Add to Clipboard</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex gap-2 overflow-x-auto pb-2">
                {TABS.slice(1).map((tab) => (
                  <Button
                    key={tab.value}
                    variant={addType === tab.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAddType(tab.value as ClipboardItemType)}
                    className="gap-1 whitespace-nowrap"
                  >
                    <tab.icon className="h-4 w-4" />
                    {tab.label}
                  </Button>
                ))}
              </div>
   
              <Separator />
   
              {addType === "text" || addType === "code" ? (
                <div className="space-y-2">
                  <Label htmlFor="clipboard-text">Content</Label>
                  <Textarea
                    id="clipboard-text"
                    placeholder={addType === "code" ? "Paste your code here..." : "Enter text..."}
                    value={addContent}
                    onChange={(e) => setAddContent(e.target.value)}
                    rows={8}
                    className="font-mono"
                  />
                </div>
              ) : addType === "link" ? (
                <div className="space-y-2">
                  <Label htmlFor="clipboard-link">URL</Label>
                  <Input
                    id="clipboard-link"
                    placeholder="https://example.com"
                    value={addLink}
                    onChange={(e) => setAddLink(e.target.value)}
                  />
                  <Label htmlFor="clipboard-link-title">Title (optional)</Label>
                  <Input
                    id="clipboard-link-title"
                    placeholder="Link title"
                    value={addTitle}
                    onChange={(e) => setAddTitle(e.target.value)}
                  />
                </div>
              ) : addType === "image" || addType === "pdf" || addType === "document" ? (
                <div className="space-y-2">
                  <Label>File</Label>
                  <div
                    className={`border-2 border-dashed rounded-lg p-6 text-center ${addFile ? "border-primary bg-primary/5" : "border-gray-300 dark:border-gray-600"}`}
                  >
                    <input
                      type="file"
                      accept={addType === "image" ? "image/*" : addType === "pdf" ? ".pdf" : ".pdf,.doc,.docx"}
                      onChange={(e) => { const file = e.target.files?.[0]; if (file) setAddFile(file); }}
                      className="hidden"
                      id="clipboard-file"
                    />
                    <label htmlFor="clipboard-file" className="cursor-pointer">
                      {addFile ? (
                        <div className="flex items-center justify-center gap-3">
                          <FileText className="h-8 w-8 text-primary" />
                          <div>
                            <p className="font-medium">{addFile.name}</p>
                            <p className="text-sm text-muted-foreground">{formatFileSize(addFile.size)}</p>
                          </div>
                          <Button variant="ghost" size="icon" onClick={(e) => { e.preventDefault(); setAddFile(null); }}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div>
                          <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                          <p>Click to upload {addType === "image" ? "an image" : "a file"}</p>
                        </div>
                      )}
                    </label>
                  </div>
                  <Label htmlFor="clipboard-file-title">Title (optional)</Label>
                  <Input
                    id="clipboard-file-title"
                    placeholder="Title"
                    value={addTitle}
                    onChange={(e) => setAddTitle(e.target.value)}
                  />
                </div>
              ) : null}
   
              <Separator />
   
              <div className="flex items-center gap-2">
                <Label htmlFor="clipboard-folder">Folder (optional)</Label>
                <select
                  id="clipboard-folder"
                  value={selectedFolder || ""}
                  onChange={(e) => setSelectedFolder(e.target.value || null)}
                  className="flex-1 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800"
                >
                  <option value="">No Folder</option>
                  {folders.map(f => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>
            </div>
            </DialogContent>
            <DialogFooter>
              <Button variant="outline" onClick={() => { resetAddForm(); setShowAddDialog(false); }}>
                Cancel
              </Button>
              <Button onClick={handleAddItem} disabled={!addContent && !addFile && !addLink}>
                Add to Clipboard
              </Button>
            </DialogFooter>
        </Dialog>
      </div>
   
      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-4 md:grid-cols-8 gap-1">
          {TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="gap-1 text-xs">
              {tab.icon && <tab.icon className="h-3 w-3" />}
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
   
        <TabsContent value="all" className="space-y-4">
          <ClipboardContent items={filteredItems} onCopy={handleCopy} onDelete={handleDelete} onPin={handlePin} />
        </TabsContent>
        {TABS.slice(1).map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className="space-y-4">
            <ClipboardContent 
              items={filteredItems.filter(i => i.type === tab.value)} 
              onCopy={handleCopy} 
              onDelete={handleDelete} 
              onPin={handlePin} 
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}