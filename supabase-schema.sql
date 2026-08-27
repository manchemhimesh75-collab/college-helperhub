-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- CORE TABLES
-- ============================================

-- Colleges
CREATE TABLE colleges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    domain TEXT, -- e.g., "college.edu.in" for email verification
    logo_url TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    country TEXT DEFAULT 'India',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Courses (B.Tech, BCA, MBA, etc.)
CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    college_id UUID REFERENCES colleges(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    description TEXT,
    duration_years INTEGER DEFAULT 4,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(college_id, code)
);

-- Branches (Computer Engineering, IT, etc.)
CREATE TABLE branches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(course_id, code)
);

-- Academic Years
CREATE TABLE academic_years (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
    year_number INTEGER NOT NULL, -- 1, 2, 3, 4
    label TEXT NOT NULL, -- "1st Year", "2nd Year"
    start_date DATE,
    end_date DATE,
    is_current BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(branch_id, year_number)
);

-- Semesters
CREATE TABLE semesters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    academic_year_id UUID REFERENCES academic_years(id) ON DELETE CASCADE,
    semester_number INTEGER NOT NULL, -- 1, 2, 3, 4, 5, 6, 7, 8
    label TEXT NOT NULL, -- "Semester 1", "Semester 5"
    start_date DATE,
    end_date DATE,
    is_current BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(academic_year_id, semester_number)
);

-- Divisions
CREATE TABLE divisions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    semester_id UUID REFERENCES semesters(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- "A", "B", "Division A"
    code TEXT NOT NULL,
    capacity INTEGER DEFAULT 60,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(semester_id, code)
);

-- Subjects
CREATE TABLE subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    semester_id UUID REFERENCES semesters(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    short_name TEXT, -- "DAA", "DBMS", "OS"
    description TEXT,
    credits INTEGER DEFAULT 3,
    is_practical BOOLEAN DEFAULT false,
    practical_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(semester_id, code)
);

-- Practical/Assignment Numbers
CREATE TABLE practical_numbers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
    number INTEGER NOT NULL,
    title TEXT,
    description TEXT,
    type TEXT CHECK (type IN ('practical', 'assignment', 'project', 'viva', 'other')) DEFAULT 'practical',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(subject_id, number, type)
);

-- ============================================
-- USERS & AUTH
-- ============================================

-- User roles
CREATE TYPE user_role AS ENUM ('student', 'host', 'admin');

-- Profiles (extends Supabase auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    role user_role DEFAULT 'student',
    
    -- Academic info
    college_id UUID REFERENCES colleges(id) ON DELETE SET NULL,
    course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
    branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
    academic_year_id UUID REFERENCES academic_years(id) ON DELETE SET NULL,
    semester_id UUID REFERENCES semesters(id) ON DELETE SET NULL,
    division_id UUID REFERENCES divisions(id) ON DELETE SET NULL,
    
    -- Student identifiers
    enrollment_number TEXT,
    roll_number TEXT,
    student_id_verified BOOLEAN DEFAULT false,
    student_id_document_url TEXT,
    
    -- Personal details for auto-fill
    father_name TEXT,
    mother_name TEXT,
    date_of_birth DATE,
    phone TEXT,
    address TEXT,
    
    -- Preferences
    theme TEXT DEFAULT 'system',
    email_notifications BOOLEAN DEFAULT true,
    push_notifications BOOLEAN DEFAULT true,
    auto_personalize BOOLEAN DEFAULT true,
    
    -- Stats
    upload_count INTEGER DEFAULT 0,
    download_count INTEGER DEFAULT 0,
    reputation_score INTEGER DEFAULT 0,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    is_banned BOOLEAN DEFAULT false,
    ban_reason TEXT,
    banned_at TIMESTAMPTZ,
    banned_by UUID REFERENCES profiles(id),
    
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- RESOURCES
-- ============================================

CREATE TYPE resource_status AS ENUM ('draft', 'pending', 'approved', 'rejected', 'archived');
CREATE TYPE resource_type AS ENUM ('practical', 'assignment', 'notes', 'reference', 'question_paper', 'syllabus', 'other');

CREATE TABLE resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    
    -- Academic categorization
    college_id UUID REFERENCES colleges(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
    academic_year_id UUID REFERENCES academic_years(id) ON DELETE CASCADE,
    semester_id UUID REFERENCES semesters(id) ON DELETE CASCADE,
    division_id UUID REFERENCES divisions(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
    practical_number_id UUID REFERENCES practical_numbers(id) ON DELETE SET NULL,
    
    -- File info
    file_url TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    file_type TEXT NOT NULL, -- mime type
    file_extension TEXT NOT NULL,
    file_hash TEXT, -- SHA256 for duplicate detection
    storage_path TEXT NOT NULL,
    
    -- Metadata
    resource_type resource_type DEFAULT 'practical',
    tags TEXT[],
    is_template BOOLEAN DEFAULT false,
    editable_fields JSONB DEFAULT '{}', -- Fields that can be personalized
    
    -- Ownership
    uploader_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    status resource_status DEFAULT 'pending',
    reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    reject_reason TEXT,
    
    -- Stats
    view_count INTEGER DEFAULT 0,
    download_count INTEGER DEFAULT 0,
    save_count INTEGER DEFAULT 0,
    share_count INTEGER DEFAULT 0,
    rating_avg DECIMAL(3,2) DEFAULT 0,
    rating_count INTEGER DEFAULT 0,
    report_count INTEGER DEFAULT 0,
    
    -- Versioning
    version INTEGER DEFAULT 1,
    parent_resource_id UUID REFERENCES resources(id) ON DELETE SET NULL,
    is_latest_version BOOLEAN DEFAULT true,
    
    -- Timestamps
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Resource versions
CREATE TABLE resource_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resource_id UUID REFERENCES resources(id) ON DELETE CASCADE,
    version INTEGER NOT NULL,
    file_url TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    file_hash TEXT,
    storage_path TEXT NOT NULL,
    changes_summary TEXT,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(resource_id, version)
);

-- ============================================
-- COLLECTIONS
-- ============================================

CREATE TABLE collections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    cover_image_url TEXT,
    subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    is_public BOOLEAN DEFAULT true,
    download_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE collection_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    collection_id UUID REFERENCES collections(id) ON DELETE CASCADE,
    resource_id UUID REFERENCES resources(id) ON DELETE CASCADE,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(collection_id, resource_id)
);

-- ============================================
-- DOCUMENT EDITING
-- ============================================

CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resource_id UUID REFERENCES resources(id) ON DELETE CASCADE,
    original_file_url TEXT NOT NULL,
    parsed_content JSONB, -- Structured document content
    detected_fields JSONB DEFAULT '[]', -- Auto-detected editable fields
    page_count INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE document_edits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    edits JSONB NOT NULL, -- All edits applied
    output_file_url TEXT,
    output_file_type TEXT, -- 'docx' or 'pdf'
    output_file_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CLIPBOARD
-- ============================================

CREATE TYPE clipboard_item_type AS ENUM ('text', 'image', 'pdf', 'document', 'link', 'code', 'table');

CREATE TABLE clipboard_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    type clipboard_item_type NOT NULL,
    title TEXT,
    content TEXT, -- For text, code, links
    file_url TEXT, -- For images, pdfs, documents
    file_name TEXT,
    file_size BIGINT,
    file_type TEXT,
    metadata JSONB DEFAULT '{}', -- Additional data (dimensions, etc.)
    folder_id UUID REFERENCES clipboard_folders(id) ON DELETE SET NULL,
    is_pinned BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE clipboard_folders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    color TEXT DEFAULT '#6366f1',
    icon TEXT DEFAULT 'folder',
    parent_id UUID REFERENCES clipboard_folders(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE clipboard_shares (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_id UUID REFERENCES clipboard_items(id) ON DELETE CASCADE,
    shared_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
    share_token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
    permission TEXT CHECK (permission IN ('view', 'copy', 'download')) DEFAULT 'view',
    access_scope TEXT CHECK (access_scope IN ('private', 'link', 'college', 'course', 'division')) DEFAULT 'link',
    expires_at TIMESTAMPTZ,
    view_count INTEGER DEFAULT 0,
    copy_count INTEGER DEFAULT 0,
    download_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- BOOKMARKS & SAVES
-- ============================================

CREATE TABLE bookmark_folders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    icon TEXT DEFAULT 'folder',
    color TEXT DEFAULT '#6366f1',
    parent_id UUID REFERENCES bookmark_folders(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE bookmarks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    resource_id UUID REFERENCES resources(id) ON DELETE CASCADE,
    folder_id UUID REFERENCES bookmark_folders(id) ON DELETE SET NULL,
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, resource_id)
);

-- ============================================
-- INTERACTIONS
-- ============================================

CREATE TABLE downloads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resource_id UUID REFERENCES resources(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    file_type TEXT NOT NULL, -- 'original', 'docx', 'pdf', 'edited'
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resource_id UUID REFERENCES resources(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(resource_id, user_id)
);

CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resource_id UUID REFERENCES resources(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_helpful BOOLEAN DEFAULT false,
    helpful_count INTEGER DEFAULT 0,
    is_edited BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE comment_votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    is_helpful BOOLEAN NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(comment_id, user_id)
);

CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resource_id UUID REFERENCES resources(id) ON DELETE CASCADE,
    reporter_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    reason TEXT NOT NULL, -- 'wrong_content', 'duplicate', 'inappropriate', 'copyright', 'incorrect_subject', 'misleading', 'other'
    description TEXT,
    status TEXT CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')) DEFAULT 'pending',
    reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    resolution TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- NOTIFICATIONS
-- ============================================

CREATE TYPE notification_type AS ENUM (
    'upload_approved', 'upload_rejected', 'resource_updated', 
    'resource_shared', 'comment_added', 'comment_reply',
    'mention', 'host_announcement', 'new_resource_subject',
    'download_milestone', 'system'
);

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    title TEXT NOT NULL,
    message TEXT,
    data JSONB DEFAULT '{}',
    related_resource_id UUID REFERENCES resources(id) ON DELETE SET NULL,
    related_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- AUDIT LOGS
-- ============================================

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    old_data JSONB,
    new_data JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

-- Resources indexes
CREATE INDEX idx_resources_college_course_branch ON resources(college_id, course_id, branch_id);
CREATE INDEX idx_resources_semester_division_subject ON resources(semester_id, division_id, subject_id);
CREATE INDEX idx_resources_status ON resources(status);
CREATE INDEX idx_resources_uploader ON resources(uploader_id);
CREATE INDEX idx_resources_file_hash ON resources(file_hash);
CREATE INDEX idx_resources_tags ON resources USING GIN(tags);
CREATE INDEX idx_resources_created_at ON resources(created_at DESC);
CREATE INDEX idx_resources_published_at ON resources(published_at DESC);
CREATE INDEX idx_resources_rating ON resources(rating_avg DESC);
CREATE INDEX idx_resources_downloads ON resources(download_count DESC);

-- Search index (using tsvector)
ALTER TABLE resources ADD COLUMN search_vector tsvector;
CREATE INDEX idx_resources_search ON resources USING GIN(search_vector);

-- Other indexes
CREATE INDEX idx_profiles_college ON profiles(college_id);
CREATE INDEX idx_profiles_academic ON profiles(course_id, branch_id, academic_year_id, semester_id, division_id);
CREATE INDEX idx_clipboard_items_user ON clipboard_items(user_id);
CREATE INDEX idx_bookmarks_user ON bookmarks(user_id);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE colleges ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE semesters ENABLE ROW LEVEL SECURITY;
ALTER TABLE divisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE practical_numbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_edits ENABLE ROW LEVEL SECURITY;
ALTER TABLE clipboard_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE clipboard_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE clipboard_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmark_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_comments_votes ON comment_votes(comment_id);
ALTER TABLE comment_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Public read policies for college structure
CREATE POLICY "Public read colleges" ON colleges FOR SELECT USING (is_active = true);
CREATE POLICY "Public read courses" ON courses FOR SELECT USING (is_active = true);
CREATE POLICY "Public read branches" ON branches FOR SELECT USING (is_active = true);
CREATE POLICY "Public read academic_years" ON academic_years FOR SELECT USING (is_active = true);
CREATE POLICY "Public read semesters" ON semesters FOR SELECT USING (is_active = true);
CREATE POLICY "Public read divisions" ON divisions FOR SELECT USING (is_active = true);
CREATE POLICY "Public read subjects" ON subjects FOR SELECT USING (is_active = true);
CREATE POLICY "Public read practical_numbers" ON practical_numbers FOR SELECT USING (is_active = true);

-- Profiles: users can read own, admins/hosts can read all
CREATE POLICY "Users read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins read all profiles" ON profiles FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'host'))
);

-- Resources: approved resources readable by all authenticated users
CREATE POLICY "Authenticated read approved resources" ON resources FOR SELECT USING (
    status = 'approved' AND auth.uid() IS NOT NULL
);
CREATE POLICY "Users read own resources" ON resources FOR SELECT USING (uploader_id = auth.uid());
CREATE POLICY "Hosts/admins read all resources" ON resources FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'host'))
);
CREATE POLICY "Students insert own resources" ON resources FOR INSERT WITH CHECK (
    uploader_id = auth.uid() AND auth.uid() IS NOT NULL
);
CREATE POLICY "Users update own draft/pending resources" ON resources FOR UPDATE USING (
    uploader_id = auth.uid() AND status IN ('draft', 'pending')
);
CREATE POLICY "Hosts/admins update any resource" ON resources FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'host'))
);

-- Document edits: users can create/read own
CREATE POLICY "Users manage own document edits" ON document_edits FOR ALL USING (user_id = auth.uid());

-- Clipboard: users manage own
CREATE POLICY "Users manage own clipboard" ON clipboard_items FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Users manage own clipboard folders" ON clipboard_folders FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Users manage own clipboard shares" ON clipboard_shares FOR ALL USING (shared_by = auth.uid());
CREATE POLICY "Public read shared clipboard" ON clipboard_shares FOR SELECT USING (
    access_scope = 'link' AND (expires_at IS NULL OR expires_at > NOW())
);

-- Bookmarks: users manage own
CREATE POLICY "Users manage own bookmarks" ON bookmarks FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Users manage own bookmark folders" ON bookmark_folders FOR ALL USING (user_id = auth.uid());

-- Ratings: authenticated users can rate, read all
CREATE POLICY "Authenticated read ratings" ON ratings FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users manage own ratings" ON ratings FOR ALL USING (user_id = auth.uid());

-- Comments: authenticated read, users manage own
CREATE POLICY "Authenticated read comments" ON comments FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users manage own comments" ON comments FOR ALL USING (user_id = auth.uid());

-- Comment votes: users manage own
CREATE POLICY "Users manage own votes" ON comment_votes FOR ALL USING (user_id = auth.uid());

-- Reports: users create own, hosts/admins read all
CREATE POLICY "Users create reports" ON reports FOR INSERT WITH CHECK (reporter_id = auth.uid());
CREATE POLICY "Users read own reports" ON reports FOR SELECT USING (reporter_id = auth.uid());
CREATE POLICY "Hosts/admins read all reports" ON reports FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'host'))
);

-- Notifications: users read own
CREATE POLICY "Users read own notifications" ON notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users update own notifications" ON notifications FOR UPDATE USING (user_id = auth.uid());

-- Audit logs: admins only
CREATE POLICY "Admins read audit logs" ON audit_logs FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ============================================
-- TRIGGERS & FUNCTIONS
-- ============================================

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to all tables with updated_at
CREATE TRIGGER update_colleges_updated_at BEFORE UPDATE ON colleges FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_branches_updated_at BEFORE UPDATE ON branches FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_academic_years_updated_at BEFORE UPDATE ON academic_years FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_semesters_updated_at BEFORE UPDATE ON semesters FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_divisions_updated_at BEFORE UPDATE ON divisions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subjects_updated_at BEFORE UPDATE ON subjects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_practical_numbers_updated_at BEFORE UPDATE ON practical_numbers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_resources_updated_at BEFORE UPDATE ON resources FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_collections_updated_at BEFORE UPDATE ON collections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clipboard_items_updated_at BEFORE UPDATE ON clipboard_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clipboard_folders_updated_at BEFORE UPDATE ON clipboard_folders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bookmark_folders_updated_at BEFORE UPDATE ON bookmark_folders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ratings_updated_at BEFORE UPDATE ON ratings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Search vector trigger
CREATE OR REPLACE FUNCTION update_resources_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector :=
        setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(NEW.tags::text, '')), 'C');
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_resources_search_vector_trigger
BEFORE INSERT OR UPDATE ON resources
FOR EACH ROW EXECUTE FUNCTION update_resources_search_vector();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url, role)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'avatar_url', 'student');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Rating average update
CREATE OR REPLACE FUNCTION update_resource_rating()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        UPDATE resources SET
            rating_avg = (SELECT AVG(rating)::decimal(3,2) FROM ratings WHERE resource_id = NEW.resource_id),
            rating_count = (SELECT COUNT(*) FROM ratings WHERE resource_id = NEW.resource_id)
        WHERE id = NEW.resource_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE resources SET
            rating_avg = COALESCE((SELECT AVG(rating)::decimal(3,2) FROM ratings WHERE resource_id = OLD.resource_id), 0),
            rating_count = (SELECT COUNT(*) FROM ratings WHERE resource_id = OLD.resource_id)
        WHERE id = OLD.resource_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_resource_rating
AFTER INSERT OR UPDATE OR DELETE ON ratings
FOR EACH ROW EXECUTE FUNCTION update_resource_rating();

-- Download count increment
CREATE OR REPLACE FUNCTION increment_download_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE resources SET download_count = download_count + 1 WHERE id = NEW.resource_id;
    UPDATE profiles SET download_count = download_count + 1 WHERE id = NEW.user_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_increment_download
AFTER INSERT ON downloads
FOR EACH ROW EXECUTE FUNCTION increment_download_count();

-- Notification trigger for resource approval
CREATE OR REPLACE FUNCTION notify_resource_approval()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status = 'pending' AND NEW.status = 'approved' THEN
        INSERT INTO notifications (user_id, type, title, message, data, related_resource_id)
        VALUES (NEW.uploader_id, 'upload_approved', 'Resource Approved', 
            'Your resource "' || NEW.title || '" has been approved and is now visible to everyone.',
            jsonb_build_object('resource_id', NEW.id), NEW.id);
    ELSIF OLD.status = 'pending' AND NEW.status = 'rejected' THEN
        INSERT INTO notifications (user_id, type, title, message, data, related_resource_id)
        VALUES (NEW.uploader_id, 'upload_rejected', 'Resource Rejected',
            'Your resource "' || NEW.title || '" was rejected. Reason: ' || COALESCE(NEW.reject_reason, 'Not specified'),
            jsonb_build_object('resource_id', NEW.id, 'reason', NEW.reject_reason), NEW.id);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notify_resource_approval
AFTER UPDATE ON resources
FOR EACH ROW EXECUTE FUNCTION notify_resource_approval();

-- Comment notification
CREATE OR REPLACE FUNCTION notify_new_comment()
RETURNS TRIGGER AS $$
DECLARE
    resource_uploader UUID;
BEGIN
    SELECT uploader_id INTO resource_uploader FROM resources WHERE id = NEW.resource_id;
    
    IF resource_uploader IS NOT NULL AND resource_uploader != NEW.user_id THEN
        INSERT INTO notifications (user_id, type, title, message, data, related_resource_id, related_user_id)
        VALUES (resource_uploader, 'comment_added', 'New Comment',
            'Someone commented on your resource',
            jsonb_build_object('comment_id', NEW.id), NEW.resource_id, NEW.user_id);
    END IF;
    
    -- Notify parent comment author for replies
    IF NEW.parent_id IS NOT NULL THEN
        INSERT INTO notifications (user_id, type, title, message, data, related_resource_id, related_user_id)
        SELECT user_id, 'comment_reply', 'Reply to your comment',
            'Someone replied to your comment',
            jsonb_build_object('comment_id', NEW.id), NEW.resource_id, NEW.user_id
        FROM comments WHERE id = NEW.parent_id AND user_id != NEW.user_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notify_new_comment
AFTER INSERT ON comments
FOR EACH ROW EXECUTE FUNCTION notify_new_comment();

-- ============================================
-- HELPER VIEWS
-- ============================================

-- User's academic context view
CREATE VIEW user_academic_context AS
SELECT 
    p.id as user_id,
    p.college_id, c.name as college_name, c.code as college_code,
    p.course_id, cr.name as course_name, cr.code as course_code,
    p.branch_id, b.name as branch_name, b.code as branch_code,
    p.academic_year_id, ay.year_number, ay.label as year_label,
    p.semester_id, s.semester_number, s.label as semester_label,
    p.division_id, d.name as division_name, d.code as division_code
FROM profiles p
LEFT JOIN colleges c ON p.college_id = c.id
LEFT JOIN courses cr ON p.course_id = cr.id
LEFT JOIN branches b ON p.branch_id = b.id
LEFT JOIN academic_years ay ON p.academic_year_id = ay.id
LEFT JOIN semesters s ON p.semester_id = s.id
LEFT JOIN divisions d ON p.division_id = d.id;

-- Resource with full context
CREATE VIEW resources_with_context AS
SELECT 
    r.*,
    c.name as college_name, c.code as college_code,
    cr.name as course_name, cr.code as course_code,
    b.name as branch_name, b.code as branch_code,
    ay.label as year_label, ay.year_number,
    sem.label as semester_label, sem.semester_number,
    div.name as division_name, div.code as division_code,
    sub.name as subject_name, sub.code as subject_code, sub.short_name as subject_short_name,
    pn.number as practical_number, pn.title as practical_title, pn.type as practical_type,
    up.full_name as uploader_name, up.avatar_url as uploader_avatar,
    rv.full_name as reviewer_name
FROM resources r
LEFT JOIN colleges c ON r.college_id = c.id
LEFT JOIN courses cr ON r.course_id = cr.id
LEFT JOIN branches b ON r.branch_id = b.id
LEFT JOIN academic_years ay ON r.academic_year_id = ay.id
LEFT JOIN semesters sem ON r.semester_id = sem.id
LEFT JOIN divisions div ON r.division_id = div.id
LEFT JOIN subjects sub ON r.subject_id = sub.id
LEFT JOIN practical_numbers pn ON r.practical_number_id = pn.id
LEFT JOIN profiles up ON r.uploader_id = up.id
LEFT JOIN profiles rv ON r.reviewed_by = rv.id;