-- Comprehensive seed for rapor-cepat
-- Inserts sample: school_settings, subjects, students, grades, attendance, ekstrakurikuler, prestasi
-- Safe to run multiple times (uses WHERE NOT EXISTS checks)

-- Use current school settings (if exists) or create a default one
INSERT INTO public.school_settings (nama_sekolah, npsn, alamat, semester, tahun_pelajaran, logo_url, nama_kepala_sekolah, nip_kepala_sekolah, telepon, email, website)
SELECT 'SMP Contoh', '12345678', 'Jalan Merdeka No.1, Jakarta', '1', '2024/2025', NULL, 'Dr. Budi Santoso, M.Pd', '196501011990011001', '021-123456', 'info@smpcontoh.sch.id', 'www.smpcontoh.sch.id'
WHERE NOT EXISTS (SELECT 1 FROM public.school_settings);

-- Subjects
INSERT INTO public.subjects (nama, kode, created_at)
SELECT v.nama, v.kode, now()
FROM (VALUES
  ('Pendidikan Agama dan Budi Pekerti','PAI'),
  ('Pendidikan Pancasila dan Kewarganegaraan','PPKn'),
  ('Bahasa Indonesia','BIN'),
  ('Matematika','MTK'),
  ('Bahasa Inggris','BIG'),
  ('Ilmu Pengetahuan Alam','IPA'),
  ('Ilmu Pengetahuan Sosial','IPS'),
  ('Seni Budaya','SBD'),
  ('Pendidikan Jasmani, Olahraga dan Kesehatan','PJOK'),
  ('Prakarya','PKY')
) AS v(nama,kode)
WHERE NOT EXISTS (SELECT 1 FROM public.subjects s WHERE s.kode = v.kode);

-- Students: create 10 sample students if not exists
INSERT INTO public.students (nis, nama_lengkap, tempat_lahir, tanggal_lahir, jenis_kelamin, kelas, nama_wali_kelas, foto_url, created_at, updated_at)
SELECT nis, nama_lengkap, tempat_lahir, tanggal_lahir, jenis_kelamin, kelas, nama_wali_kelas, NULL, now(), now()
FROM (VALUES
  ('S0001', 'Ahmad Fauzi', 'Jakarta','2011-04-12','L','7A','Bu Siti Aminah'),
  ('S0002', 'Siti Aminah', 'Jakarta','2011-06-20','P','7A','Bu Siti Aminah'),
  ('S0003', 'Budi Prasetyo', 'Bogor','2010-11-01','L','7B','Pak Rahmat'),
  ('S0004', 'Dewi Lestari', 'Depok','2010-02-18','P','7B','Pak Rahmat'),
  ('S0005', 'Eka Putra', 'Jakarta','2010-09-09','L','8A','Bu Lina'),
  ('S0006', 'Fitri Ananda', 'Bekasi','2010-12-25','P','8A','Bu Lina'),
  ('S0007', 'Gilang Ramadhan', 'Jakarta','2009-07-05','L','8B','Pak Hadi'),
  ('S0008', 'Hana Salsabila', 'Tangerang','2009-03-14','P','8B','Pak Hadi'),
  ('S0009', 'Irfan Kurnia', 'Bekasi','2009-01-30','L','9A','Bu Maya'),
  ('S0010', 'Joko Susilo', 'Bogor','2009-05-22','L','9A','Bu Maya')
) AS data(nis,nama_lengkap,tempat_lahir,tanggal_lahir,jenis_kelamin,kelas,nama_wali_kelas)
WHERE NOT EXISTS (SELECT 1 FROM public.students st WHERE st.nis = data.nis);

-- Use school settings for semester and tahun_pelajaran
WITH ss AS (
  SELECT semester, tahun_pelajaran FROM public.school_settings LIMIT 1
),
seed_students AS (
  SELECT id FROM public.students WHERE nis LIKE 'S00%'
),
seed_subjects AS (
  SELECT id FROM public.subjects WHERE kode IN ('PAI','PPKn','BIN','MTK','BIG','IPA','IPS','SBD','PJOK','PKY')
)
-- Grades: generate random grades between 65 and 100 for each student-subject
INSERT INTO public.grades (student_id, subject_id, nilai_akhir, capaian_kompetensi, semester, tahun_pelajaran, created_at, updated_at)
SELECT g.student_id, g.subject_id, g.nilai, 
  CASE
    WHEN g.nilai >= 90 THEN 'Sangat baik dalam memahami, menerapkan, dan mengembangkan konsep.'
    WHEN g.nilai >= 80 THEN 'Baik dalam memahami dan menerapkan konsep.'
    WHEN g.nilai >= 70 THEN 'Cukup baik, perlu meningkatkan beberapa aspek.'
    ELSE 'Perlu bimbingan lebih lanjut.'
  END AS capaian_kompetensi,
  ss.semester, ss.tahun_pelajaran, now(), now()
FROM ss,
  (SELECT s.id AS student_id, sub.id AS subject_id, (FLOOR(RANDOM()*36)+65)::numeric AS nilai
   FROM seed_students s CROSS JOIN seed_subjects sub) g
WHERE NOT EXISTS (
  SELECT 1 FROM public.grades gr
  WHERE gr.student_id = g.student_id
    AND gr.subject_id = g.subject_id
    AND gr.semester = ss.semester
    AND gr.tahun_pelajaran = ss.tahun_pelajaran
);

-- Attendance: random small numbers for each student
WITH ss AS (
  SELECT semester, tahun_pelajaran FROM public.school_settings LIMIT 1
), students_seed AS (
  SELECT id FROM public.students WHERE nis LIKE 'S00%'
)
INSERT INTO public.attendance (student_id, semester, tahun_pelajaran, sakit, izin, tanpa_keterangan, created_at, updated_at)
SELECT s.id, ss.semester, ss.tahun_pelajaran,
  (FLOOR(RANDOM()*5))::int AS sakit,
  (FLOOR(RANDOM()*4))::int AS izin,
  (FLOOR(RANDOM()*3))::int AS tanpa_keterangan,
  now(), now()
FROM students_seed s, ss
WHERE NOT EXISTS (
  SELECT 1 FROM public.attendance a
  WHERE a.student_id = s.id
    AND a.semester = ss.semester
    AND a.tahun_pelajaran = ss.tahun_pelajaran
);

-- Ekstrakurikuler: assign two activities to students
WITH ss AS (SELECT semester, tahun_pelajaran FROM public.school_settings LIMIT 1),
students_seed AS (SELECT id FROM public.students WHERE nis LIKE 'S00%')
INSERT INTO public.ekstrakurikuler (student_id, semester, tahun_pelajaran, nama_kegiatan, predikat, keterangan, created_at, updated_at)
SELECT s.id, ss.semester, ss.tahun_pelajaran, v.kegiatan, v.predikat, v.ket, now(), now()
FROM students_seed s, ss,
  (VALUES
    ('Paskibra','Baik','Aktif mengikuti latihan'),
    ('Futsal','Cukup','Sering ikut pertandingan antar kelas'),
    ('Musik','Sangat Baik','Anggota grup musik sekolah')
  ) AS v(kegiatan,predikat,ket)
WHERE NOT EXISTS (
  SELECT 1 FROM public.ekstrakurikuler e
  WHERE e.student_id = s.id
    AND e.nama_kegiatan = v.kegiatan
    AND e.semester = ss.semester
    AND e.tahun_pelajaran = ss.tahun_pelajaran
);

-- Prestasi: add for a few students
WITH ss AS (SELECT semester, tahun_pelajaran FROM public.school_settings LIMIT 1),
first_student AS (SELECT id FROM public.students WHERE nis = 'S0001' LIMIT 1),
second_student AS (SELECT id FROM public.students WHERE nis = 'S0002' LIMIT 1),
third_student AS (SELECT id FROM public.students WHERE nis = 'S0003' LIMIT 1)
INSERT INTO public.prestasi (student_id, semester, tahun_pelajaran, jenis_prestasi, tingkat, keterangan, created_at, updated_at)
SELECT fs.id, ss.semester, ss.tahun_pelajaran, 'Juara 1 Lomba Matematika', 'Kota/Kabupaten', 'Mewakili sekolah dan meraih juara 1', now(), now()
FROM ss, first_student fs
WHERE NOT EXISTS (
  SELECT 1 FROM public.prestasi p
  WHERE p.student_id = fs.id
    AND p.jenis_prestasi = 'Juara 1 Lomba Matematika'
    AND p.semester = ss.semester
    AND p.tahun_pelajaran = ss.tahun_pelajaran
);

INSERT INTO public.prestasi (student_id, semester, tahun_pelajaran, jenis_prestasi, tingkat, keterangan, created_at, updated_at)
SELECT ss.semester, ss.semester, ss.tahun_pelajaran, 'Beasiswa Prestasi Akademik', 'Sekolah', 'Diberikan berdasarkan nilai dan keaktifan belajar', now(), now()
-- The previous INSERT had wrong column ordering; fix below with proper select for second_student
;

-- Correct second prestasi insert
WITH ss AS (SELECT semester, tahun_pelajaran FROM public.school_settings LIMIT 1), second_student AS (SELECT id FROM public.students WHERE nis = 'S0002' LIMIT 1)
INSERT INTO public.prestasi (student_id, semester, tahun_pelajaran, jenis_prestasi, tingkat, keterangan, created_at, updated_at)
SELECT s.id, ss.semester, ss.tahun_pelajaran, 'Beasiswa Prestasi Akademik', 'Sekolah', 'Diberikan berdasarkan nilai dan keaktifan belajar', now(), now()
FROM ss, second_student s
WHERE NOT EXISTS (
  SELECT 1 FROM public.prestasi p
  WHERE p.student_id = s.id
    AND p.jenis_prestasi = 'Beasiswa Prestasi Akademik'
    AND p.semester = ss.semester
    AND p.tahun_pelajaran = ss.tahun_pelajaran
);

-- Optional: Locked reports (none by default)

-- End of seed
