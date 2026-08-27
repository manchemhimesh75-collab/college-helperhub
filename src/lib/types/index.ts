export type UserRole = 'student' | 'host' | 'admin'
export type ResourceStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'archived'
export type ResourceType = 'practical' | 'assignment' | 'notes' | 'reference' | 'question_paper' | 'syllabus' | 'other'
export type PracticalType = 'practical' | 'assignment' | 'project' | 'viva' | 'other'
export type ClipboardItemType = 'text' | 'image' | 'pdf' | 'document' | 'link' | 'code' | 'table'
export type NotificationType = 
  | 'upload_approved' 
  | 'upload_rejected' 
  | 'resource_updated' 
  | 'resource_shared' 
  | 'comment_added' 
  | 'comment_reply'
  | 'mention' 
  | 'host_announcement' 
  | 'new_resource_subject'
  | 'download_milestone' 
  | 'system'
export type ReportReason = 'wrong_content' | 'duplicate' | 'inappropriate' | 'copyright' | 'incorrect_subject' | 'misleading' | 'other'
export type ReportStatus = 'pending' | 'reviewed' | 'resolved' | 'dismissed'
export type SharePermission = 'view' | 'copy' | 'download'
export type ShareAccessScope = 'private' | 'link' | 'college' | 'course' | 'division'

export interface College {
  id: string
  name: string
  code: string
  domain?: string
  logo_url?: string
  address?: string
  city?: string
  state?: string
  country: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Course {
  id: string
  college_id: string
  name: string
  code: string
  description?: string
  duration_years: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Branch {
  id: string
  course_id: string
  name: string
  code: string
  description?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface AcademicYear {
  id: string
  branch_id: string
  year_number: number
  label: string
  start_date?: string
  end_date?: string
  is_current: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Semester {
  id: string
  academic_year_id: string
  semester_number: number
  label: string
  start_date?: string
  end_date?: string
  is_current: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Division {
  id: string
  semester_id: string
  name: string
  code: string
  capacity: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Subject {
  id: string
  semester_id: string
  name: string
  code: string
  short_name?: string
  description?: string
  credits: number
  is_practical: boolean
  practical_count: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface PracticalNumber {
  id: string
  subject_id: string
  number: number
  title?: string
  description?: string
  type: PracticalType
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string
  email: string
  full_name: string
  avatar_url?: string
  role: UserRole
  college_id?: string
  course_id?: string
  branch_id?: string
  academic_year_id?: string
  semester_id?: string
  division_id?: string
  enrollment_number?: string
  roll_number?: string
  student_id_verified: boolean
  student_id_document_url?: string
  father_name?: string
  mother_name?: string
  date_of_birth?: string
  phone?: string
  address?: string
  theme: 'light' | 'dark' | 'system'
  email_notifications: boolean
  push_notifications: boolean
  auto_personalize: boolean
  upload_count: number
  download_count: number
  reputation_score: number
  is_active: boolean
  is_banned: boolean
  ban_reason?: string
  banned_at?: string
  banned_by?: string
  last_login_at?: string
  created_at: string
  updated_at: string
}

export interface Resource {
  id: string
  title: string
  description?: string
  college_id: string
  course_id: string
  branch_id: string
  academic_year_id: string
  semester_id: string
  division_id: string
  subject_id: string
  practical_number_id?: string
  file_url: string
  file_name: string
  file_size: number
  file_type: string
  file_extension: string
  file_hash?: string
  storage_path: string
  resource_type: ResourceType
  tags: string[]
  is_template: boolean
  editable_fields: Record<string, any>
  uploader_id?: string
  status: ResourceStatus
  reviewed_by?: string
  reviewed_at?: string
  reject_reason?: string
  view_count: number
  download_count: number
  save_count: number
  share_count: number
  rating_avg: number
  rating_count: number
  report_count: number
  version: number
  parent_resource_id?: string
  is_latest_version: boolean
  published_at?: string
  created_at: string
  updated_at: string
  
  // Joined fields
  college_name?: string
  college_code?: string
  course_name?: string
  course_code?: string
  branch_name?: string
  branch_code?: string
  year_label?: string
  year_number?: number
  semester_label?: string
  semester_number?: number
  division_name?: string
  division_code?: string
  subject_name?: string
  subject_code?: string
  subject_short_name?: string
  practical_number?: number
  practical_title?: string
  practical_type?: PracticalType
  uploader_name?: string
  uploader_avatar?: string
  reviewer_name?: string
}

export interface ResourceVersion {
  id: string
  resource_id: string
  version: number
  file_url: string
  file_name: string
  file_size: number
  file_hash?: string
  storage_path: string
  changes_summary?: string
  created_by?: string
  created_at: string
}

export interface Collection {
  id: string
  title: string
  description?: string
  cover_image_url?: string
  subject_id?: string
  created_by?: string
  is_public: boolean
  download_count: number
  created_at: string
  updated_at: string
}

export interface CollectionItem {
  id: string
  collection_id: string
  resource_id: string
  order_index: number
  created_at: string
}

export interface Document {
  id: string
  resource_id: string
  original_file_url: string
  parsed_content?: Record<string, any>
  detected_fields: any[]
  page_count?: number
  created_at: string
  updated_at: string
}

export interface DocumentEdit {
  id: string
  document_id: string
  user_id: string
  edits: Record<string, any>
  output_file_url?: string
  output_file_type?: 'docx' | 'pdf'
  output_file_name?: string
  created_at: string
}

export interface ClipboardItem {
  id: string
  user_id: string
  type: ClipboardItemType
  title?: string
  content?: string
  file_url?: string
  file_name?: string
  file_size?: number
  file_type?: string
  metadata: Record<string, any>
  folder_id?: string
  is_pinned: boolean
  created_at: string
  updated_at: string
}

export interface ClipboardFolder {
  id: string
  user_id: string
  name: string
  color: string
  icon: string
  parent_id?: string
  created_at: string
  updated_at: string
}

export interface ClipboardShare {
  id: string
  item_id: string
  shared_by: string
  share_token: string
  permission: SharePermission
  access_scope: ShareAccessScope
  expires_at?: string
  view_count: number
  copy_count: number
  download_count: number
  created_at: string
}

export interface BookmarkFolder {
  id: string
  user_id: string
  name: string
  icon: string
  color: string
  parent_id?: string
  created_at: string
  updated_at: string
}

export interface Bookmark {
  id: string
  user_id: string
  resource_id: string
  folder_id?: string
  note?: string
  created_at: string
}

export interface Download {
  id: string
  resource_id: string
  user_id?: string
  file_type: string
  ip_address?: string
  user_agent?: string
  created_at: string
}

export interface Rating {
  id: string
  resource_id: string
  user_id: string
  rating: number
  review?: string
  created_at: string
  updated_at: string
}

export interface Comment {
  id: string
  resource_id: string
  user_id: string
  parent_id?: string
  content: string
  is_helpful: boolean
  helpful_count: number
  is_edited: boolean
  created_at: string
  updated_at: string
  user?: Profile
  replies?: Comment[]
}

export interface CommentVote {
  id: string
  comment_id: string
  user_id: string
  is_helpful: boolean
  created_at: string
}

export interface Report {
  id: string
  resource_id: string
  reporter_id: string
  reason: ReportReason
  description?: string
  status: ReportStatus
  reviewed_by?: string
  reviewed_at?: string
  resolution?: string
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  message?: string
  data: Record<string, any>
  related_resource_id?: string
  related_user_id?: string
  is_read: boolean
  read_at?: string
  created_at: string
}

export interface AuditLog {
  id: string
  user_id?: string
  action: string
  entity_type: string
  entity_id?: string
  old_data?: Record<string, any>
  new_data?: Record<string, any>
  ip_address?: string
  user_agent?: string
  created_at: string
}

// Academic context view
export interface UserAcademicContext {
  user_id: string
  college_id?: string
  college_name?: string
  college_code?: string
  course_id?: string
  course_name?: string
  course_code?: string
  branch_id?: string
  branch_name?: string
  branch_code?: string
  academic_year_id?: string
  year_number?: number
  year_label?: string
  semester_id?: string
  semester_number?: number
  semester_label?: string
  division_id?: string
  division_name?: string
  division_code?: string
}

// Form types
export interface UploadResourceForm {
  title: string
  description?: string
  subject_id: string
  practical_number_id?: string
  resource_type: ResourceType
  tags: string[]
  is_template: boolean
  file: File
}

export interface PersonalizeForm {
  student_name: string
  enrollment_number: string
  roll_number: string
  division: string
  course?: string
  subject?: string
  practical_number?: string
  date?: string
  faculty_name?: string
  experiment_name?: string
  [key: string]: string | undefined
}

export interface SearchFilters {
  query?: string
  college_id?: string
  course_id?: string
  branch_id?: string
  academic_year_id?: string
  semester_id?: string
  division_id?: string
  subject_id?: string
  practical_number_id?: string
  resource_type?: ResourceType
  file_extension?: string
  uploader_id?: string
  tags?: string[]
  status?: ResourceStatus
  sort_by?: 'relevance' | 'newest' | 'oldest' | 'popular' | 'rating'
  page?: number
  limit?: number
}

export interface SearchResult {
  resources: Resource[]
  total: number
  page: number
  limit: number
  total_pages: number
  facets?: {
    subjects: { id: string; name: string; count: number }[]
    resource_types: { type: ResourceType; count: number }[]
    file_types: { extension: string; count: number }[]
    years: { year_number: number; count: number }[]
  }
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  total_pages: number
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface UploadProgress {
  loaded: number
  total: number
  percentage: number
}

// Document editing types
export interface EditableField {
  key: string
  label: string
  type: 'text' | 'number' | 'date' | 'select' | 'image'
  value: string
  placeholder?: string
  options?: string[]
  required?: boolean
  page?: number
  position?: { x: number; y: number }
}

export interface DocumentEditState {
  resource_id: string
  original_file_url: string
  editable_fields: EditableField[]
  current_edits: Record<string, any>
  replaced_images: Record<string, string> // key -> new image url
  is_saving: boolean
  preview_url?: string
}

// Batch editing
export interface BatchEditRequest {
  resource_ids: string[]
  personal_details: PersonalizeForm
}

export interface BatchEditResult {
  resource_id: string
  success: boolean
  download_url?: string
  error?: string
}