# Cara Menjalankan Migration Database

Untuk membuat tabel `ekstrakurikuler` dan `prestasi` di Supabase, ikuti langkah berikut:

## Langkah 1: Buka Supabase Console
1. Buka https://app.supabase.com
2. Login dengan akun Anda
3. Pilih project: **rapor-cepat** (Project ID: knpoeteunmefpfxrrsup)

## Langkah 2: Buka SQL Editor
1. Di sidebar kiri, klik **SQL Editor**
2. Klik tombol **New Query** atau **+ New**

## Langkah 3: Jalankan SQL Script
Copy dan paste semua SQL code di bawah ini ke SQL Editor, kemudian klik **Run**:

```sql
-- Create ekstrakurikuler (extracurricular) table
CREATE TABLE public.ekstrakurikuler (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    student_id uuid NOT NULL,
    semester text NOT NULL,
    tahun_pelajaran text NOT NULL,
    nama_kegiatan text NOT NULL,
    predikat text,
    keterangan text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE
);

-- Create prestasi (achievement) table
CREATE TABLE public.prestasi (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    student_id uuid NOT NULL,
    semester text NOT NULL,
    tahun_pelajaran text NOT NULL,
    jenis_prestasi text NOT NULL,
    tingkat text,
    keterangan text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE
);

-- Enable Row Level Security
ALTER TABLE public.ekstrakurikuler ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prestasi ENABLE ROW LEVEL SECURITY;

-- Create update trigger for ekstrakurikuler
CREATE TRIGGER update_ekstrakurikuler_updated_at BEFORE UPDATE ON public.ekstrakurikuler FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create update trigger for prestasi
CREATE TRIGGER update_prestasi_updated_at BEFORE UPDATE ON public.prestasi FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Add RLS Policies for ekstrakurikuler
CREATE POLICY "Admins can manage all ekstrakurikuler" ON public.ekstrakurikuler USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Users can manage ekstrakurikuler for students in their assigned classes" ON public.ekstrakurikuler 
USING ((EXISTS (SELECT 1 FROM public.students s WHERE ((s.id = ekstrakurikuler.student_id) AND public.has_class_access(auth.uid(), s.kelas)))));

-- Add RLS Policies for prestasi
CREATE POLICY "Admins can manage all prestasi" ON public.prestasi USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Users can manage prestasi for students in their assigned classes" ON public.prestasi 
USING ((EXISTS (SELECT 1 FROM public.students s WHERE ((s.id = prestasi.student_id) AND public.has_class_access(auth.uid(), s.kelas)))));
```

## Langkah 4: Verifikasi
Setelah query selesai dijalankan dengan sukses:
1. Buka tab **Table Editor** di sidebar
2. Pastikan tabel `ekstrakurikuler` dan `prestasi` muncul di daftar tabel
3. Refresh aplikasi di browser

Selesai! Sekarang Anda sudah bisa menggunakan fitur Ekstrakurikuler dan Prestasi.
