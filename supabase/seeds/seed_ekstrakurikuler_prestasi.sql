-- Seed data for ekstrakurikuler and prestasi
-- This script inserts sample ekstrakurikuler and prestasi rows for up to 5 students.
-- It uses the active `school_settings` values for semester and tahun_pelajaran.
-- Safe to run multiple times: it will skip inserts if the same record already exists.

WITH ss AS (
  SELECT semester, tahun_pelajaran FROM public.school_settings LIMIT 1
), students_list AS (
  SELECT id FROM public.students ORDER BY nama_lengkap LIMIT 5
)

-- Ekstrakurikuler: Paskibra
INSERT INTO public.ekstrakurikuler (student_id, semester, tahun_pelajaran, nama_kegiatan, predikat, keterangan)
SELECT s.id, ss.semester, ss.tahun_pelajaran, 'Paskibra', 'Baik', 'Aktif mengikuti latihan'
FROM students_list s, ss
WHERE NOT EXISTS (
  SELECT 1 FROM public.ekstrakurikuler e
  WHERE e.student_id = s.id
    AND e.nama_kegiatan = 'Paskibra'
    AND e.semester = ss.semester
    AND e.tahun_pelajaran = ss.tahun_pelajaran
);

-- Ekstrakurikuler: Futsal
INSERT INTO public.ekstrakurikuler (student_id, semester, tahun_pelajaran, nama_kegiatan, predikat, keterangan)
SELECT s.id, ss.semester, ss.tahun_pelajaran, 'Futsal', 'Cukup', 'Sering ikut pertandingan antar kelas'
FROM students_list s, ss
WHERE NOT EXISTS (
  SELECT 1 FROM public.ekstrakurikuler e
  WHERE e.student_id = s.id
    AND e.nama_kegiatan = 'Futsal'
    AND e.semester = ss.semester
    AND e.tahun_pelajaran = ss.tahun_pelajaran
);

-- Prestasi: Juara 1 Lomba Matematika (contoh untuk 1 siswa paling atas)
WITH top_student AS (
  SELECT id FROM public.students ORDER BY nama_lengkap LIMIT 1
)
INSERT INTO public.prestasi (student_id, semester, tahun_pelajaran, jenis_prestasi, tingkat, keterangan)
SELECT ts.id, ss.semester, ss.tahun_pelajaran, 'Juara 1 Lomba Matematika', 'Kota/Kabupaten', 'Mewakili sekolah dan meraih juara 1'
FROM top_student ts, ss
WHERE NOT EXISTS (
  SELECT 1 FROM public.prestasi p
  WHERE p.student_id = ts.id
    AND p.jenis_prestasi = 'Juara 1 Lomba Matematika'
    AND p.semester = ss.semester
    AND p.tahun_pelajaran = ss.tahun_pelajaran
);

-- Prestasi: Beasiswa Prestasi (contoh untuk siswa ke-2)
WITH second_student AS (
  SELECT id FROM public.students ORDER BY nama_lengkap OFFSET 1 LIMIT 1
)
INSERT INTO public.prestasi (student_id, semester, tahun_pelajaran, jenis_prestasi, tingkat, keterangan)
SELECT s.id, ss.semester, ss.tahun_pelajaran, 'Beasiswa Prestasi Akademik', 'Sekolah', 'Diberikan berdasarkan nilai dan keaktifan belajar'
FROM second_student s, ss
WHERE EXISTS (SELECT 1 FROM public.students) -- ensure students exist
  AND NOT EXISTS (
    SELECT 1 FROM public.prestasi p
    WHERE p.student_id = s.id
      AND p.jenis_prestasi = 'Beasiswa Prestasi Akademik'
      AND p.semester = ss.semester
      AND p.tahun_pelajaran = ss.tahun_pelajaran
  );

-- You can run this script in Supabase SQL Editor. It will insert up to 5 students' ekstrakurikuler and two prestasi examples.
-- If you want different sample data or more rows, edit the values or increase the LIMIT in students_list.
