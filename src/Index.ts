// Mengimpor modul readline agar program bisa menerima input dari user lewat terminal
import * as readline from "readline";

// Membuat interface input-output untuk membaca dan menampilkan data di console
const r1 = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Aturan umum yang dipakai dalam perhitungan nilai
const TotalPertemuan: number = 8; // total pertemuan yang ada
const BatasHadir: number = 80; // presentase minimal kehadiran agar masuk kategori tertentu

// Struktur data satu mahasiswa (property sama seperti yang dipakai di kode sebelumnya)
interface Mahasiswa {
  id: string; // NIM
  nama: string;
  tugas: number;
  uts: number;
  uas: number;
  hadir: number;
  remidi: number;
  aktif: boolean;
  nilaiAkhir: number; // hasil perhitungan otomatis
  huruf: string; // hasil perhitungan otomatis
  lulus: boolean; // hasil perhitungan otomatis
  catatan: string; // hasil perhitungan otomatis
}

// Data yang diinput user (belum ada hasil perhitungan)
interface InputMahasiswa {
  nama: string;
  tugas: number;
  uts: number;
  uas: number;
  hadir: number;
  remidi: number;
  aktif: boolean;
}

// Hasil penentuan status kelulusan
interface Status {
  lulus: boolean;
  catatan: string;
}

// ===================== INPUT TERMINAL =====================
// Input dibaca per baris lewat antrian agar bisa dipakai di dalam async/await.
// Dengan cara ini pertanyaan tetap berurutan seperti versi callback sebelumnya.
const Antrian: string[] = [];
const Penunggu: ((Baris: string) => void)[] = [];
let InputSelesai: boolean = false;

r1.on("line", (Baris: string) => {
  const Menunggu = Penunggu.shift();
  if (Menunggu) {
    Menunggu(Baris);
  } else {
    Antrian.push(Baris);
  }
});

r1.on("close", () => {
  // Jika input habis, semua pertanyaan yang menunggu dijawab "0" agar program berhenti
  InputSelesai = true;
  while (Penunggu.length > 0) {
    const Menunggu = Penunggu.shift();
    if (Menunggu) Menunggu("0");
  }
});
