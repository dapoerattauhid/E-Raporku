import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import {
  useStudents,
  useSchoolSettings,
  useEkstrakurikuler,
  usePrestasi,
  useUpsertEkstrakurikuler,
  useDeleteEkstrakurikuler,
  useUpsertPrestasi,
  useDeletePrestasi,
} from "@/hooks/useSupabaseData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Save, Trash2, Plus, BookOpen, Award, Loader2 } from "lucide-react";

export default function EkstrakurikulerPrestasi() {
  const { data: students = [] } = useStudents();
  const { data: schoolSettings } = useSchoolSettings();
  const { data: ekstrakurikuler = [] } = useEkstrakurikuler();
  const { data: prestasi = [] } = usePrestasi();
  const upsertEkstrakurikuler = useUpsertEkstrakurikuler();
  const deleteEkstrakurikuler = useDeleteEkstrakurikuler();
  const upsertPrestasi = useUpsertPrestasi();
  const deletePrestasi = useDeletePrestasi();

  // Ekstrakurikuler form state
  const [selectedKelas, setSelectedKelas] = useState<string>("");
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"ekstrakurikuler" | "prestasi">("ekstrakurikuler");

  // Ekstrakurikuler fields
  const [namaKegiatan, setNamaKegiatan] = useState<string>("");
  const [predikat, setPredikat] = useState<string>("");
  const [keteranganEkstra, setKeteranganEkstra] = useState<string>("");

  // Prestasi fields
  const [jenisPrestasi, setJenisPrestasi] = useState<string>("");
  const [tingkat, setTingkat] = useState<string>("");
  const [keteranganPrestasi, setKeteranganPrestasi] = useState<string>("");

  const kelasList = [...new Set(students.map((s) => s.kelas))];
  const filteredStudents = students.filter((s) => s.kelas === selectedKelas);
  const currentStudent = students.find((s) => s.id === selectedStudent);

  // Get ekstrakurikuler for selected student
  const studentEkstrakurikuler = ekstrakurikuler.filter(
    (e) =>
      e.student_id === selectedStudent &&
      e.semester === schoolSettings?.semester &&
      e.tahun_pelajaran === schoolSettings?.tahun_pelajaran
  );

  // Get prestasi for selected student
  const studentPrestasi = prestasi.filter(
    (p) =>
      p.student_id === selectedStudent &&
      p.semester === schoolSettings?.semester &&
      p.tahun_pelajaran === schoolSettings?.tahun_pelajaran
  );

  const handleAddEkstrakurikuler = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!schoolSettings || !selectedStudent || !namaKegiatan) {
      toast({
        title: "Error",
        description: "Lengkapi semua field yang diperlukan",
        variant: "destructive",
      });
      return;
    }

    try {
      await upsertEkstrakurikuler.mutateAsync({
        student_id: selectedStudent,
        nama_kegiatan: namaKegiatan,
        predikat: predikat || null,
        keterangan: keteranganEkstra || null,
        semester: schoolSettings.semester,
        tahun_pelajaran: schoolSettings.tahun_pelajaran,
      });

      toast({
        title: "Berhasil",
        description: "Ekstrakurikuler berhasil disimpan",
      });

      // Reset form
      setNamaKegiatan("");
      setPredikat("");
      setKeteranganEkstra("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleAddPrestasi = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!schoolSettings || !selectedStudent || !jenisPrestasi) {
      toast({
        title: "Error",
        description: "Lengkapi semua field yang diperlukan",
        variant: "destructive",
      });
      return;
    }

    try {
      await upsertPrestasi.mutateAsync({
        student_id: selectedStudent,
        jenis_prestasi: jenisPrestasi,
        tingkat: tingkat || null,
        keterangan: keteranganPrestasi || null,
        semester: schoolSettings.semester,
        tahun_pelajaran: schoolSettings.tahun_pelajaran,
      });

      toast({
        title: "Berhasil",
        description: "Prestasi berhasil disimpan",
      });

      // Reset form
      setJenisPrestasi("");
      setTingkat("");
      setKeteranganPrestasi("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteEkstrakurikuler = async (id: string) => {
    try {
      await deleteEkstrakurikuler.mutateAsync(id);
      toast({
        title: "Berhasil",
        description: "Ekstrakurikuler berhasil dihapus",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeletePrestasi = async (id: string) => {
    try {
      await deletePrestasi.mutateAsync(id);
      toast({
        title: "Berhasil",
        description: "Prestasi berhasil dihapus",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <MainLayout>
      <div className="max-w-6xl animate-slide-in">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold lg:text-3xl">Ekstrakurikuler & Prestasi</h1>
          <p className="mt-1 text-muted-foreground">
            Input data ekstrakurikuler dan prestasi siswa
          </p>
        </div>

        {/* Selection */}
        <div className="mb-6 rounded-xl border border-border bg-card p-6 animate-fade-in">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Kelas</Label>
              <Select value={selectedKelas} onValueChange={setSelectedKelas}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kelas" />
                </SelectTrigger>
                <SelectContent>
                  {kelasList.map((kelas) => (
                    <SelectItem key={kelas} value={kelas}>
                      {kelas}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Siswa</Label>
              <Select
                value={selectedStudent}
                onValueChange={setSelectedStudent}
                disabled={!selectedKelas}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih siswa" />
                </SelectTrigger>
                <SelectContent>
                  {filteredStudents.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.nama_lengkap}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {selectedStudent && currentStudent && (
          <>
            {/* Tab Navigation */}
            <div className="mb-6 flex gap-2 border-b border-border">
              <button
                onClick={() => setActiveTab("ekstrakurikuler")}
                className={`px-4 py-2 font-medium transition-colors ${
                  activeTab === "ekstrakurikuler"
                    ? "border-b-2 border-primary text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <BookOpen className="mr-2 inline h-4 w-4" />
                Ekstrakurikuler
              </button>
              <button
                onClick={() => setActiveTab("prestasi")}
                className={`px-4 py-2 font-medium transition-colors ${
                  activeTab === "prestasi"
                    ? "border-b-2 border-primary text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Award className="mr-2 inline h-4 w-4" />
                Prestasi
              </button>
            </div>

            {/* Ekstrakurikuler Tab */}
            {activeTab === "ekstrakurikuler" && (
              <div className="space-y-6">
                {/* Form */}
                <form onSubmit={handleAddEkstrakurikuler} className="rounded-xl border border-border bg-card p-6">
                  <h3 className="mb-4 text-lg font-semibold">Tambah Ekstrakurikuler</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="namaKegiatan">Nama Kegiatan *</Label>
                      <Input
                        id="namaKegiatan"
                        value={namaKegiatan}
                        onChange={(e) => setNamaKegiatan(e.target.value)}
                        placeholder="Contoh: Paskibra, Futsal, Musik, dll"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="predikat">Predikat</Label>
                      <Select value={predikat} onValueChange={setPredikat}>
                        <SelectTrigger id="predikat">
                          <SelectValue placeholder="Pilih predikat" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Sangat Baik">Sangat Baik</SelectItem>
                          <SelectItem value="Baik">Baik</SelectItem>
                          <SelectItem value="Cukup">Cukup</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="keteranganEkstra">Keterangan</Label>
                      <Textarea
                        id="keteranganEkstra"
                        value={keteranganEkstra}
                        onChange={(e) => setKeteranganEkstra(e.target.value)}
                        placeholder="Deskripsi atau catatan tentang ekstrakurikuler ini"
                        rows={2}
                      />
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <Button
                      type="submit"
                      disabled={
                        !namaKegiatan || upsertEkstrakurikuler.isPending
                      }
                    >
                      {upsertEkstrakurikuler.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      <Plus className="mr-2 h-4 w-4" />
                      Tambah Ekstrakurikuler
                    </Button>
                  </div>
                </form>

                {/* Table */}
                <div className="rounded-xl border border-border bg-card overflow-hidden">
                  <div className="p-6 pb-0">
                    <h3 className="font-semibold mb-4">Daftar Ekstrakurikuler</h3>
                  </div>
                  {studentEkstrakurikuler.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nama Kegiatan</TableHead>
                          <TableHead>Predikat</TableHead>
                          <TableHead>Keterangan</TableHead>
                          <TableHead className="w-[100px] text-center">Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {studentEkstrakurikuler.map((e) => (
                          <TableRow key={e.id}>
                            <TableCell>{e.nama_kegiatan}</TableCell>
                            <TableCell>{e.predikat || "-"}</TableCell>
                            <TableCell className="max-w-xs truncate">{e.keterangan || "-"}</TableCell>
                            <TableCell className="text-center">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteEkstrakurikuler(e.id)}
                                disabled={deleteEkstrakurikuler.isPending}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="p-6 text-center text-muted-foreground">
                      Belum ada data ekstrakurikuler
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Prestasi Tab */}
            {activeTab === "prestasi" && (
              <div className="space-y-6">
                {/* Form */}
                <form onSubmit={handleAddPrestasi} className="rounded-xl border border-border bg-card p-6">
                  <h3 className="mb-4 text-lg font-semibold">Tambah Prestasi</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="jenisPrestasi">Jenis Prestasi *</Label>
                      <Input
                        id="jenisPrestasi"
                        value={jenisPrestasi}
                        onChange={(e) => setJenisPrestasi(e.target.value)}
                        placeholder="Contoh: Juara Lomba Matematika, Beasiswa, dll"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="tingkat">Tingkat</Label>
                      <Select value={tingkat} onValueChange={setTingkat}>
                        <SelectTrigger id="tingkat">
                          <SelectValue placeholder="Pilih tingkat" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Sekolah">Sekolah</SelectItem>
                          <SelectItem value="Kota/Kabupaten">Kota/Kabupaten</SelectItem>
                          <SelectItem value="Provinsi">Provinsi</SelectItem>
                          <SelectItem value="Nasional">Nasional</SelectItem>
                          <SelectItem value="Internasional">Internasional</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="keteranganPrestasi">Keterangan</Label>
                      <Textarea
                        id="keteranganPrestasi"
                        value={keteranganPrestasi}
                        onChange={(e) => setKeteranganPrestasi(e.target.value)}
                        placeholder="Deskripsi atau catatan tentang prestasi ini"
                        rows={2}
                      />
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <Button
                      type="submit"
                      disabled={
                        !jenisPrestasi || upsertPrestasi.isPending
                      }
                    >
                      {upsertPrestasi.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      <Plus className="mr-2 h-4 w-4" />
                      Tambah Prestasi
                    </Button>
                  </div>
                </form>

                {/* Table */}
                <div className="rounded-xl border border-border bg-card overflow-hidden">
                  <div className="p-6 pb-0">
                    <h3 className="font-semibold mb-4">Daftar Prestasi</h3>
                  </div>
                  {studentPrestasi.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Jenis Prestasi</TableHead>
                          <TableHead>Tingkat</TableHead>
                          <TableHead>Keterangan</TableHead>
                          <TableHead className="w-[100px] text-center">Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {studentPrestasi.map((p) => (
                          <TableRow key={p.id}>
                            <TableCell>{p.jenis_prestasi}</TableCell>
                            <TableCell>{p.tingkat || "-"}</TableCell>
                            <TableCell className="max-w-xs truncate">{p.keterangan || "-"}</TableCell>
                            <TableCell className="text-center">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeletePrestasi(p.id)}
                                disabled={deletePrestasi.isPending}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="p-6 text-center text-muted-foreground">
                      Belum ada data prestasi
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {!selectedStudent && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/50 py-16">
            <BookOpen className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">
              Pilih kelas dan siswa untuk mengelola data ekstrakurikuler dan prestasi
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
