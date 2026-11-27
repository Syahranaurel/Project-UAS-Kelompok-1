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
