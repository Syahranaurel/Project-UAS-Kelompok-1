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

// Menampilkan pertanyaan lalu menunggu satu baris jawaban dari user
function Tanya(Pertanyaan: string): Promise<string> {
  process.stdout.write(Pertanyaan);
  return new Promise<string>((Selesai) => {
    const Jawab = (Baris: string): void => {
      // Jika input berasal dari file/pipe (bukan keyboard), jawaban ikut ditampilkan
      if (!process.stdin.isTTY) console.log(Baris);
      Selesai(Baris);
    };
    const Baris = Antrian.shift();
    if (Baris !== undefined) {
      Jawab(Baris);
    } else if (InputSelesai) {
      Jawab("0");
    } else {
      Penunggu.push(Jawab);
    }
  });
}

// Mengubah teks menjadi angka; teks kosong dianggap tidak valid (NaN)
function keAngka(Teks: string): number {
  return Teks.trim() === "" ? NaN : Number(Teks);
}

// ===================== FUNGSI PERHITUNGAN =====================
// Menghitung persentase kehadiran dari jumlah yang hadir terhadap total pertemuan
function hitungKehadiran(Hadir: number): number {
  let Persen: number = Hadir;
  Persen /= TotalPertemuan;
  Persen *= 100;
  return Persen;
}

// Rumus nilai akhir berdasarkan bobot: kehadiran, tugas, UTS, dan UAS
function hitungNilaiAkhir(Tugas: number, UTS: number, UAS: number, Hadir: number, Aktif: boolean): number {
  const Kehadiran: number = hitungKehadiran(Hadir);
  let Nilai: number = Kehadiran * 0.5;
  Nilai += Tugas * 0.2;
  Nilai += UTS * 0.15;
  Nilai += UAS * 0.15;

  // Jika mahasiswa aktif dan hadir sangat tinggi, nilai ditambah
  if (Aktif && Kehadiran >= 90) {
    Nilai += 2;
  } else if (!Aktif && Kehadiran < BatasHadir) {
    // Jika tidak aktif dan kehadiran kurang, nilai dikurangi
    Nilai -= 5;
  }
  return Nilai;
}
// Menentukan huruf berdasarkan nilai akhir
function tentukanHuruf(Nilai: number): string {
  let Huruf: string = "E"; // default jika nilai di bawah 50
  if (Nilai >= 80) {
    Huruf = "A";
  } else if (Nilai >= 70) {
    Huruf = "B";
  } else if (Nilai >= 60) {
    Huruf = "C";
  } else if (Nilai >= 50) {
    Huruf = "D";
  }
  return Huruf;
}
// Menentukan apakah mahasiswa lulus atau tidak serta catatan khusus
function tentukanStatus(Huruf: string, Kehadiran: number, UAS: number, Remedi: number): Status {
  let Lulus: boolean = false;
  let Catatan: string = "";

  switch (Huruf) {
    case "A":
      Lulus = true;
      Catatan = "Sangat Baik";
      break;
    case "B":
      Lulus = true;
      Catatan = "Baik";
      break;
    case "C":
      Lulus = true;
      Catatan = "Cukup";
      break;
    case "D":
      // Jika nilai D, perlu pengecekan tambahan untuk remidi
      if (Kehadiran >= BatasHadir) {
        if (UAS >= 40) {
          switch (Remedi) {
            case 0: Catatan = "Berhak remidi pertama."; break;
            case 1: Catatan = "Berhak remidi kedua."; break;
            case 2: Catatan = "Berhak remidi terakhir."; break;
            default: Catatan = "remidi habis, wajib mengulang."; break;
          }
        } else {
          Catatan = "Nilai UAS terlalu rendah, tidak berhak remidi.";
        }
      } else {
        Catatan = "Kehadiran kurang, tidak berhak remedi.";
      }
      break;
    default:
      Catatan = "Wajib mengulang mata kuliah.";
      break;
  }
  return { lulus: Lulus, catatan: Catatan };
}
// Validasi input: jika ada angka yang tidak valid atau melebihi range, kembalikan false
function validasiInput(Tugas: number, UTS: number, UAS: number, Hadir: number, Remedi: number): boolean {
  if (isNaN(Tugas + UTS + UAS + Hadir + Remedi) || Tugas < 0 || Tugas > 100 ||
    UTS < 0 || UTS > 100 || UAS < 0 || UAS > 100 || Hadir < 0 || Hadir > TotalPertemuan || Remedi < 0) {
    return false;
  }
  return true;
}
// Membentuk objek Mahasiswa lengkap beserta hasil perhitungannya
function buatMahasiswa(Id: string, Data: InputMahasiswa): Mahasiswa {
  const Kehadiran: number = hitungKehadiran(Data.hadir);
  const NilaiAkhir: number = hitungNilaiAkhir(Data.tugas, Data.uts, Data.uas, Data.hadir, Data.aktif);
  const Huruf: string = tentukanHuruf(NilaiAkhir);
  const Status: Status = tentukanStatus(Huruf, Kehadiran, Data.uas, Data.remidi);
  return {
    id: Id,
    nama: Data.nama,
    tugas: Data.tugas,
    uts: Data.uts,
    uas: Data.uas,
    hadir: Data.hadir,
    remidi: Data.remidi,
    aktif: Data.aktif,
    nilaiAkhir: NilaiAkhir,
    huruf: Huruf,
    lulus: Status.lulus,
    catatan: Status.catatan,
  };
}
// ===================== DATA AWAL (SEED) =====================
const dataMahasiswa: Mahasiswa[] = [
  buatMahasiswa("263140707111001", { nama: "Andi Pratama", tugas: 85, uts: 80, uas: 90, hadir: 8, remidi: 0, aktif: true }),
  buatMahasiswa("263140707111002", { nama: "Budi Santoso", tugas: 70, uts: 65, uas: 60, hadir: 7, remidi: 0, aktif: false }),
  buatMahasiswa("263140707111003", { nama: "Citra Lestari", tugas: 60, uts: 50, uas: 45, hadir: 6, remidi: 0, aktif: false }),
  buatMahasiswa("263140707111004", { nama: "Dewi Anggraini", tugas: 20, uts: 30, uas: 40, hadir: 7, remidi: 1, aktif: false }),
  buatMahasiswa("263140707111005", { nama: "Eko Saputra", tugas: 10, uts: 10, uas: 10, hadir: 4, remidi: 0, aktif: false }),
];

// ===================== FUNGSI TAMPILAN =====================
// Menampilkan seluruh data satu mahasiswa
function tampilDetail(M: Mahasiswa): void {
  console.log(`NIM            : ${M.id}`);
  console.log(`Nama           : ${M.nama}`);
  console.log(`Tugas/UTS/UAS  : ${M.tugas} / ${M.uts} / ${M.uas}`);
  console.log(`Hadir          : ${M.hadir}/${TotalPertemuan} (${hitungKehadiran(M.hadir).toFixed(1)}%)`);
  console.log(`Remidi diambil : ${M.remidi} | Aktif: ${M.aktif ? "iya" : "tidak"}`);
  console.log(`Nilai Akhir    : ${M.nilaiAkhir.toFixed(2)} | Huruf: ${M.huruf}`);
  console.log(`Status         : ${M.lulus ? "Lulus" : "Tidak Lulus"} | Catatan: ${M.catatan}`);
}

// Menampilkan ringkasan satu mahasiswa dalam satu baris
function tampilBaris(M: Mahasiswa): void {
  console.log(`${M.id} | ${M.nama} | Nilai: ${M.nilaiAkhir.toFixed(2)} | ${M.huruf} | ${M.lulus ? "Lulus" : "Tidak Lulus"}`);
}