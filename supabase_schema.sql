-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. CREATE TABLES
-- Table: Profiles (Extends Supabase Auth users)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'teacher', 'parent')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: Courses
CREATE TABLE public.courses (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL CHECK (category IN ('Physics', 'Math', 'Logic')),
    difficulty TEXT NOT NULL CHECK (difficulty IN ('Basic', 'Intermediate', 'Advanced')),
    cover_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: Modules
CREATE TABLE public.modules (
    id TEXT PRIMARY KEY,
    course_id TEXT NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    order_index INT DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: Videos
CREATE TABLE public.videos (
    id TEXT PRIMARY KEY,
    module_id TEXT NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    duration INT NOT NULL, -- in seconds
    video_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: Progress (Saves student's focus & completion)
CREATE TABLE public.progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    video_id TEXT NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
    course_id TEXT NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    watched_seconds INT DEFAULT 0 NOT NULL,
    completed BOOLEAN DEFAULT FALSE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_user_video UNIQUE (user_id, video_id)
);

-- Table: Enrollments (Handles subscription states & payments for security)
CREATE TABLE public.enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
    status TEXT NOT NULL DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'canceled')),
    stripe_payment_id TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: Notes (Time-indexed student notes)
CREATE TABLE public.notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    video_id TEXT NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
    timestamp INT NOT NULL, -- position in seconds
    text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: Parent Connections (Links parents to their children accounts)
CREATE TABLE public.parent_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_parent_student UNIQUE (parent_id, student_id)
);

-- 3. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_connections ENABLE ROW LEVEL SECURITY;

-- 4. RLS POLICIES
-- Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update their own profiles" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Courses, Modules, Videos (Read-only for authenticated users)
CREATE POLICY "Courses are viewable by authenticated users" ON public.courses
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Modules are viewable by authenticated users" ON public.modules
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Videos are viewable by authenticated users" ON public.videos
    FOR SELECT USING (auth.role() = 'authenticated');

-- Progress Policies
CREATE POLICY "Students can view their own progress" ON public.progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Students can update/insert their own progress" ON public.progress
    FOR ALL USING (auth.uid() = user_id);

-- Enrollments Policies
CREATE POLICY "Students can view their own enrollment status" ON public.enrollments
    FOR SELECT USING (auth.uid() = user_id);

-- Notes Policies
CREATE POLICY "Students can manage their own notes" ON public.notes
    FOR ALL USING (auth.uid() = user_id);

-- Parent Connections Policies
CREATE POLICY "Parents and students can view connections" ON public.parent_connections
    FOR SELECT USING (auth.uid() = parent_id OR auth.uid() = student_id);

-- 5. AUTOMATIC TRIGGER FOR PROFILE & INACTIVE ENROLLMENT
-- Function triggered when new user signs up in auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert profile
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'full_name', 'Estudante'),
        COALESCE(new.raw_user_meta_data->>'role', 'student')
    );

    -- Insert inactive enrollment (forces Stripe/Kiwify checkout)
    INSERT INTO public.enrollments (user_id, status)
    VALUES (new.id, 'inactive');

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger definition
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
