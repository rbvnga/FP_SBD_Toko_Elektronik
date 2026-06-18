const rl = require('readline-sync');
const db = require('./config/mysql');
const mongoose = require('mongoose');
require('dotenv').config();

// ─── Schema MongoDB ───────────────────────────────────────────
const SpekProduk = mongoose.model('SpekProduk', new mongoose.Schema({
  id_produk: String,
  supplier: [
    {
      nama_supplier: String,
      kontak: String,
      alamat: String
    }
  ],
  spesifikasi: [mongoose.Schema.Types.Mixed]
}, { collection: 'Spesifikasi_Produk' }));

const Ulasan = mongoose.model('Ulasan', new mongoose.Schema({
  id_pesanan: String,
  id_pelanggan: String,
  id_produk: String,
  rating: Number,
  komentar: String,
  tanggal: Date,
  foto_ulasan: [String],
  balasan_toko: String,
}, { collection: 'Ulasan' }));

// ─── Koneksi ──────────────────────────────────────────────────
async function init() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB terhubung');
  console.log('MySQL terhubung');
  menuUtama();
}

// ══════════════════════════════════════════════════════════════
//  MENU UTAMA
// ══════════════════════════════════════════════════════════════
function menuUtama() {
  console.log('\n╔══════════════════════════════╗');
  console.log('║      SISTEM TOKO ONLINE      ║');
  console.log('╚══════════════════════════════╝');
  console.log('1. Kelola Produk');
  console.log('2. Kelola Pelanggan');
  console.log('3. Kelola Pesanan');
  console.log('4. Kelola Pembayaran');
  console.log('5. Kelola Voucher');
  console.log('6. Kelola Item Pesanan');
  console.log('7. Spek Produk (MongoDB)');
  console.log('8. Ulasan Produk (MongoDB)');
  console.log('0. Keluar');

  const pilih = rl.question('\nPilih menu: ');

  switch (pilih) {
    case '1': menuProduk(); break;
    case '2': menuPelanggan(); break;
    case '3': menuPesanan(); break;
    case '4': menuPembayaran(); break;
    case '5': menuVoucher(); break;
    case '6': menuItemPesanan(); break;
    case '7': menuSpekProduk(); break;
    case '8': menuUlasan(); break;
    case '0': console.log('Sampai jumpa!'); process.exit(0);
    default: console.log('Pilihan tidak valid'); menuUtama();
  }
}

// ══════════════════════════════════════════════════════════════
//  MENU PRODUK (SQL)
// ══════════════════════════════════════════════════════════════
async function menuProduk() {
  console.log('\n── PRODUK ──');
  console.log('1. Tampilkan Semua Produk');
  console.log('2. Tampilkan Produk per Kategori');
  console.log('3. Tampilkan Detail Produk + Ulasan');
  console.log('4. Tambah Produk');
  console.log('5. Update Produk');
  console.log('6. Hapus Produk');
  console.log('0. Kembali');

  const pilih = rl.question('\nPilih: ');

  switch (pilih) {
    case '1': await tampilSemuaProduk(); break;
    case '2': await tampilProdukPerKategori(); break;
    case '3': await tampilProdukDenganUlasan(); break;
    case '4': await tambahProduk(); break;
    case '5': await updateProduk(); break;
    case '6': await hapusProduk(); break;
    case '0': menuUtama(); return;
    default: console.log('Tidak valid');
  }
  menuProduk();
}

// ── Tampil Semua Produk ──
async function tampilSemuaProduk() {
  try {
    const [rows] = await db.query('SELECT * FROM produk');
    console.log('\n DAFTAR SEMUA PRODUK:');
    console.log('─'.repeat(70));
    rows.forEach(p => {
      console.log(`[${p.id_produk}] ${p.nama_produk}`);
      console.log(`    Kategori: ${p.kategori} | Harga: Rp${p.harga.toLocaleString('id-ID')} | Stok: ${p.stok} | Status: ${p.status}`);
    });
    console.log('─'.repeat(70));
    console.log(`Total: ${rows.length} produk`);
  } catch (err) {
    console.error('Error:', err.message);
  }
}

// ── Tampil Produk per Kategori ──
async function tampilProdukPerKategori() {
  try {
    const [kategoriList] = await db.query('SELECT DISTINCT kategori FROM produk');
    console.log('\nKategori yang tersedia:');
    kategoriList.forEach((k, i) => console.log(`${i + 1}. ${k.kategori}`));

    const kategori = rl.question('Masukkan nama kategori: ');
    const [rows] = await db.query('SELECT * FROM produk WHERE kategori = ?', [kategori]);

    if (rows.length === 0) {
      console.log('Tidak ada produk di kategori tersebut');
      return;
    }

    console.log(`\n PRODUK KATEGORI "${kategori}":`);
    console.log('─'.repeat(70));
    rows.forEach(p => {
      console.log(`[${p.id_produk}] ${p.nama_produk} | Harga: Rp${p.harga.toLocaleString('id-ID')} | Stok: ${p.stok}`);
    });
    console.log('─'.repeat(70));
  } catch (err) {
    console.error('Error:', err.message);
  }
}

// ── Tampil Produk + Ulasan (SQL JOIN MongoDB) ──
async function tampilProdukDenganUlasan() {
  try {
    console.log('\nCari produk berdasarkan:');
    console.log('1. Semua produk');
    console.log('2. Produk tertentu (by ID)');
    console.log('3. Kategori tertentu');
    const opsi = rl.question('Pilih: ');

    let produkList = [];

    if (opsi === '1') {
      const [rows] = await db.query('SELECT * FROM produk');
      produkList = rows;
    } else if (opsi === '2') {
      const id = rl.question('Masukkan ID Produk: ');
      const [rows] = await db.query('SELECT * FROM produk WHERE id_produk = ?', [id]);
      produkList = rows;
    } else if (opsi === '3') {
      // Tampilkan daftar kategori yang tersedia terlebih dahulu
      const [kategoriList] = await db.query('SELECT DISTINCT kategori FROM produk');
      console.log('\nKategori yang tersedia di database:');
      kategoriList.forEach((k, i) => console.log(`  ${i + 1}. ${k.kategori}`));

      const kat = rl.question('\nMasukkan nama kategori: ');
      const [rows] = await db.query('SELECT * FROM produk WHERE kategori = ?', [kat]);
      produkList = rows;
    }

    if (produkList.length === 0) {
      console.log('Produk tidak ditemukan');
      return;
    }

    // Tampilkan setiap produk + ulasan dari MongoDB
    for (const p of produkList) {
      console.log('\n' + '═'.repeat(60));
      console.log(`  ${p.nama_produk} [${p.id_produk}]`);
      console.log(`   Kategori : ${p.kategori}`);
      console.log(`   Harga    : Rp${p.harga.toLocaleString('id-ID')}`);
      console.log(`   Stok     : ${p.stok}`);
      console.log(`   Status   : ${p.status}`);

      // Ambil spek dari MongoDB
      const spek = await SpekProduk.findOne({ id_produk: p.id_produk });
      if (spek) {
        console.log(`   Deskripsi: ${spek.deskripsi || '-'}`);
      }

      // Ambil ulasan dari MongoDB
      const ulasanList = await Ulasan.find({ id_produk: p.id_produk });
      if (ulasanList.length === 0) {
        console.log('Belum ada ulasan');
      } else {
        const avgRating = (ulasanList.reduce((a, u) => a + u.rating, 0) / ulasanList.length).toFixed(1);
        console.log(`\n    Rating: ${avgRating}/5 (${ulasanList.length} ulasan)`);
        ulasanList.forEach(u => {
          console.log(`    ┌─ ${u.id_pelanggan} | ⭐${u.rating}`);
          console.log(`    └─ "${u.komentar}"`);
        });
      }
    }
    console.log('═'.repeat(60));
  } catch (err) {
    console.error('Error:', err.message);
  }
}

// ── Tambah Produk ──
async function tambahProduk() {
  console.log('\n TAMBAH PRODUK BARU');
  const id_produk = rl.question('ID Produk (contoh P016)  : ');
  const nama_produk = rl.question('Nama Produk              : ');
  const kategori = rl.question('Kategori                 : ');
  const harga = rl.questionInt('Harga (angka)            : ');
  const stok = rl.questionInt('Stok                     : ');
  const status = rl.question('Status (aktif/nonaktif)  : ');

  try {
    await db.query(
      'INSERT INTO produk (id_produk, nama_produk, kategori, harga, stok, status) VALUES (?, ?, ?, ?, ?, ?)',
      [id_produk, nama_produk, kategori, harga, stok, status]
    );
    console.log(' Produk berhasil ditambahkan!');

    // Tanya apakah mau tambah spek di MongoDB juga
    const tambahSpek = rl.keyInYNStrict('Tambah spesifikasi produk di MongoDB?');
    if (tambahSpek) {
      const supplier = {
        nama_supplier: rl.question('Nama Supplier : '),
        kontak: rl.question('Kontak        : '),
        alamat: rl.question('Alamat        : ')
      };

      const input = rl.question(
        'Masukkan spesifikasi (JSON): '
      );

      const spek = new SpekProduk({
        id_produk,

        supplier: [
          supplier
        ],

        spesifikasi: [
          JSON.parse(input)
        ]
      });
      await spek.save();
      console.log(' Spek produk disimpan di MongoDB!');
    }
  } catch (err) {
    console.error(' Gagal menambahkan produk:', err.message);
  }
}

// ── Update Produk ──
async function updateProduk() {
  console.log('\n  UPDATE PRODUK');
  await tampilSemuaProduk();

  const id = rl.question('\nMasukkan ID Produk yang ingin diupdate: ');
  const [rows] = await db.query('SELECT * FROM produk WHERE id_produk = ?', [id]);

  if (rows.length === 0) {
    console.log('Peringatan: Produk tidak ditemukan!');
    return;
  }

  const p = rows[0];
  console.log('(Tekan Enter jika tidak ingin mengubah nilai data awal)\n');

  // Menyamakan posisi titik dua (sejajar vertikal)
  const nama = rl.question(`Nama [${p.nama_produk}]`.padEnd(30) + ' : ') || p.nama_produk;
  const kat = rl.question(`Kategori [${p.kategori}]`.padEnd(30) + ' : ') || p.kategori;
  const hargaInput = rl.question(`Harga [${p.harga}]`.padEnd(30) + ' : ');
  const stokInput = rl.question(`Stok [${p.stok}]`.padEnd(30) + ' : ');
  const status = rl.question(`Status [${p.status}]`.padEnd(30) + ' : ') || p.status;

  const harga = hargaInput === '' ? p.harga : Number(hargaInput);
  const stok = stokInput === '' ? p.stok : Number(stokInput);

  // Error handling jika input sama persis dengan data awal
  if (
    nama.toLowerCase() === p.nama_produk.toLowerCase() &&
    kat.toLowerCase() === p.kategori.toLowerCase() &&
    harga === p.harga &&
    stok === p.stok &&
    status.toLowerCase() === (p.status || '').toLowerCase()
  ) {
    console.log('\nGagal Update, tidak ada perubahan dilakukan.');
    return;
  }

  try {
    await db.query(
      'UPDATE produk SET nama_produk=?, kategori=?, harga=?, stok=?, status=? WHERE id_produk=?',
      [nama, kat, harga, stok, status, id]
    );
    console.log('Produk berhasil diupdate!');
  } catch (err) {
    console.error('Gagal update:', err.message);
  }
}

// ── Hapus Produk ──
async function hapusProduk() {
  console.log('\n  HAPUS PRODUK');
  await tampilSemuaProduk();

  const id = rl.question('\nMasukkan ID Produk yang ingin dihapus: ');

  // Validasi apakah ID produk benar-benar ada sebelum melakukan hapus
  const [cekProduk] = await db.query('SELECT * FROM produk WHERE id_produk = ?', [id]);

  if (cekProduk.length === 0) {
    console.log(`\nError: ID Produk "${id}" tidak ditemukan di database! Proses penghapusan dibatalkan.`);
    return;
  }

  const konfirmasi = rl.keyInYNStrict(`Yakin hapus produk ${id}?`);

  if (!konfirmasi) {
    console.log(' Dibatalkan');
    return;
  }

  try {
    await db.query('DELETE FROM produk WHERE id_produk = ?', [id]);
    await SpekProduk.findOneAndDelete({ id_produk: id }); // hapus juga di MongoDB jika ada
    console.log('   Produk berhasil dihapus dari MySQL dan MongoDB!');
  } catch (err) {
    console.error('Gagal hapus:', err.message);
  }
}

// ══════════════════════════════════════════════════════════════
//  MENU PELANGGAN (SQL) 
// ══════════════════════════════════════════════════════════════
async function menuPelanggan() {
  console.log('\n── PELANGGAN ──');
  console.log('1. Tampilkan Semua Pelanggan');
  console.log('2. Cari Pelanggan by ID');
  console.log('3. Tambah Pelanggan');
  console.log('4. Update Pelanggan');
  console.log('5. Hapus Pelanggan');
  console.log('0. Kembali');

  const pilih = rl.question('\nPilih: ');

  switch (pilih) {
    case '1': {
      try {
        const [rows] = await db.query('SELECT * FROM pelanggan');
        console.log('\nDAFTAR PELANGGAN:');
        console.log('─'.repeat(70));
        rows.forEach(c => console.log(`[${c.id_pelanggan}] ${c.nama_pelanggan} | ${c.no_telepon} | ${c.alamat}`));
        console.log('─'.repeat(70));
        console.log(`Total: ${rows.length} pelanggan`);
      } catch (err) {
        console.error('Error:', err.message);
      }
      break;
    }

    case '2': {
      const id = rl.question('Masukkan ID Pelanggan: ');
      try {
        const [rows] = await db.query('SELECT * FROM pelanggan WHERE id_pelanggan = ?', [id]);
        if (rows.length === 0) {
          console.log(`\nError: ID Pelanggan "${id}" tidak ditemukan!`);
          break;
        }
        const c = rows[0];
        console.log('\n── DETAIL PELANGGAN ──');
        console.log(`Nama     : ${c.nama_pelanggan}`);
        console.log(`Telepon  : ${c.no_telepon}`);
        console.log(`Alamat   : ${c.alamat}`);
      } catch (err) {
        console.error('Error:', err.message);
      }
      break;
    }

    case '3': {
      console.log('\n TAMBAH PELANGGAN BARU');
      const id_pelanggan = rl.question('ID Pelanggan (contoh C001) : ');

      try {
        // Validasi Duplikat ID sebelum meminta input lainnya
        const [cek] = await db.query('SELECT * FROM pelanggan WHERE id_pelanggan = ?', [id_pelanggan]);
        if (cek.length > 0) {
          console.log(`\nGagal Tambah: ID Pelanggan "${id_pelanggan}" sudah terdaftar di database!`);
          break;
        }

        const nama_pelanggan = rl.question('Nama Pelanggan            : ');
        const alamat = rl.question('Alamat                    : ');
        const no_telepon = rl.question('No. Telepon               : ');

        await db.query(
          'INSERT INTO pelanggan (id_pelanggan, nama_pelanggan, alamat, no_telepon) VALUES (?, ?, ?, ?)',
          [id_pelanggan, nama_pelanggan, alamat, no_telepon]
        );
        console.log('Pelanggan berhasil ditambahkan!');
      } catch (err) {
        console.error('Gagal menambahkan pelanggan:', err.message);
      }
      break;
    }

    case '4': {
      console.log('\n  UPDATE PELANGGAN');
      const id = rl.question('Masukkan ID Pelanggan yang diupdate: ');
      try {
        const [rows] = await db.query('SELECT * FROM pelanggan WHERE id_pelanggan = ?', [id]);
        if (rows.length === 0) {
          console.log(`\nPeringatan: ID Pelanggan "${id}" tidak ditemukan!`);
          break;
        }

        const c = rows[0];
        // Tambahkan teks peringatan enter yang seragam dengan produk
        console.log('(Tekan Enter jika tidak ingin mengubah nilai data awal)\n');

        const nama = rl.question(`Nama [${c.nama_pelanggan || '-'}]`.padEnd(30) + ' : ') || c.nama_pelanggan;
        const alamat = rl.question(`Alamat [${c.alamat || '-'}]`.padEnd(30) + ' : ') || c.alamat;
        const telp = rl.question(`Telepon [${c.no_telepon || '-'}]`.padEnd(30) + ' : ') || c.no_telepon;

        // Validasi Case-Insensitive data sama persis
        if (
          nama.toLowerCase() === c.nama_pelanggan.toLowerCase() &&
          alamat.toLowerCase() === c.alamat.toLowerCase() &&
          telp === c.no_telepon
        ) {
          console.log('\nGagal Update, Tidak ada perubahan dilakukan.');
          break;
        }

        await db.query(
          'UPDATE pelanggan SET nama_pelanggan=?, alamat=?, no_telepon=? WHERE id_pelanggan=?',
          [nama, alamat, telp, id]
        );
        console.log('   Pelanggan berhasil diupdate!');
      } catch (err) {
        console.error('Gagal update:', err.message);
      }
      break;
    }

    case '5': {
      console.log('\n  HAPUS PELANGGAN');
      const id = rl.question('Masukkan ID Pelanggan yang ingin dihapus: ');
      try {
        // Peringatan jika ID pelanggan tidak ditemukan di database
        const [cek] = await db.query('SELECT * FROM pelanggan WHERE id_pelanggan = ?', [id]);
        if (cek.length === 0) {
          console.log(`\nError: ID Pelanggan "${id}" tidak ditemukan di database! Proses hapus dibatalkan.`);
          break;
        }

        if (rl.keyInYNStrict(`Yakin hapus pelanggan dengan ID ${id}?`)) {
          await db.query('DELETE FROM pelanggan WHERE id_pelanggan = ?', [id]);
          console.log('   Pelanggan berhasil dihapus!');
        } else {
          console.log('   Penghapusan dibatalkan.');
        }
      } catch (err) {
        // Jinakkan error code ER_ROW_IS_REFERENCED_2 (Foreign Key Constraint)
        if (err.code === 'ER_ROW_IS_REFERENCED_2' || err.errno === 1451) {
          console.log(`\nGagal Hapus: Pelanggan dengan ID "${id}" tidak bisa dihapus karena datanya masih terikat dengan transaksi di tabel Pesanan!`);
        } else {
          console.error('Gagal hapus:', err.message);
        }
      }
      break;
    }

    case '0': menuUtama(); return;
    default: console.log('Pilihan tidak valid');
  }
  menuPelanggan();
}

// ══════════════════════════════════════════════════════════════
//  MENU ULASAN (MongoDB)
// ══════════════════════════════════════════════════════════════
async function menuUlasan() {
  console.log('\n── ULASAN (MongoDB) ──');
  console.log('1. Lihat Semua Ulasan');
  console.log('2. Lihat Ulasan by Produk');
  console.log('3. Tambah Ulasan');
  console.log('4. Update Ulasan');
  console.log('5. Hapus Ulasan');
  console.log('0. Kembali');

  const pilih = rl.question('\nPilih: ');

  switch (pilih) {
    case '1': {
      const data = await Ulasan.find();
      console.log('\nSEMUA ULASAN:');
      data.forEach(u => {
        console.log(`\n[${u._id}] Produk: ${u.id_produk} | Pelanggan: ${u.id_pelanggan}`);
        console.log(`  Rating: ${''.repeat(u.rating)} (${u.rating}/5)`);
        console.log(`  "${u.komentar}"`);
      });
      break;
    }
    case '2': {
      const id_produk = rl.question('ID Produk: ');
      const data = await Ulasan.find({ id_produk });
      if (data.length === 0) { console.log(' Belum ada ulasan'); break; }
      data.forEach(u => {
        console.log(`\n  [${u.id_pelanggan}] ${u.rating} - "${u.komentar}"`);
      });
      break;
    }
    case '3': {
      const id_pelanggan = rl.question('ID Pelanggan: ');
      const id_produk = rl.question('ID Produk   : ');
      const rating = rl.questionInt('Rating (1-5): ');
      const komentar = rl.question('Komentar    : ');

      const ulasan = new Ulasan({
        id_pelanggan, id_produk,
        rating, komentar, tanggal: new Date()
      });
      await ulasan.save();
      console.log(' Ulasan berhasil disimpan!');
      break;
    }
    case '4': {
      const idDoc = rl.question('Masukkan _id ulasan yang diupdate: ');
      const komentar = rl.question('Komentar baru: ');
      const rating = rl.questionInt('Rating baru (1-5): ');
      await Ulasan.findByIdAndUpdate(idDoc, { komentar, rating });
      console.log(' Ulasan diupdate!');
      break;
    }
    case '5': {
      const idDoc = rl.question('Masukkan _id ulasan yang dihapus: ');
      if (rl.keyInYNStrict('Yakin hapus ulasan ini?')) {
        await Ulasan.findByIdAndDelete(idDoc);
        console.log(' Ulasan dihapus!');
      }
      break;
    }
    case '0': menuUtama(); return;
  }
  menuUlasan();
}

// ══════════════════════════════════════════════════════════════
//  MENU PESANAN, PEMBAYARAN, VOUCHER, ITEM PESANAN
//  (pola sama dengan menuPelanggan, tinggal ganti tabel & kolom)
// ══════════════════════════════════════════════════════════════
async function menuPesanan() {
  console.log('\n── PESANAN ──');
  console.log('1. Tampilkan Semua Pesanan');
  console.log('2. Tambah Pesanan');
  console.log('3. Update Status Pesanan');
  console.log('4. Hapus Pesanan');
  console.log('0. Kembali');

  const pilih = rl.question('\nPilih: ');

  switch (pilih) {
    case '1': {
      const [rows] = await db.query(`
        SELECT p.*, pl.nama_pelanggan FROM pesanan p
        LEFT JOIN pelanggan pl ON p.id_pelanggan = pl.id_pelanggan
      `);
      console.log('\n DAFTAR PESANAN:');
      rows.forEach(r => {
        const tanggal = r.tanggal_pesanan
          ? r.tanggal_pesanan.toLocaleDateString('sv-SE')
          : '-';
        console.log(`[${r.id_pesanan}] ${r.nama_pelanggan} | Status: ${r.status_pesanan} | Total: Rp${Number(r.total_harga).toLocaleString('id-ID')} | Tanggal: ${tanggal} | Jasa Kirim: ${r.jasa_kirim}`);
      });
      break;
    }
    case '2': {
      const id_pesanan = rl.question('ID Pesanan      : ');

      const [existing] = await db.query('SELECT id_pesanan FROM pesanan WHERE id_pesanan = ?', [id_pesanan]);
      if (existing.length > 0) {
        console.log(` Pesanan dengan ID "${id_pesanan}" sudah ada!`);
        break;
      }

      const id_pelanggan = rl.question('ID Pelanggan    : ');
      const id_voucher = rl.question('ID Voucher (kosongkan jika tidak ada): ') || null;
      const status_pesanan = rl.question('Status Pesanan  : ');
      const total_harga = rl.questionInt('Total Harga     : ');
      const tanggal = rl.question('Tanggal (YYYY-MM-DD): ');
      const jasa_kirim = rl.question('Jasa Kirim      : ');

      await db.query(
        'INSERT INTO pesanan VALUES (?, ?, ?, ?, ?, ?, ?)',
        [id_pesanan, id_pelanggan, id_voucher, status_pesanan, total_harga, tanggal, jasa_kirim]
      );
      console.log(' Pesanan ditambahkan!');
      break;
    }
    case '3': {
      const id = rl.question('ID Pesanan: ');
      const [rows] = await db.query('SELECT status_pesanan FROM pesanan WHERE id_pesanan = ?', [id]);
      if (rows.length === 0) { console.log(' Pesanan tidak ditemukan'); break; }
      console.log(`Status saat ini: ${rows[0].status_pesanan}`);
      const status = rl.question('Status baru (Selesai/Dikirim/Diproses/Dibatalkan): ');
      await db.query('UPDATE pesanan SET status_pesanan=? WHERE id_pesanan=?', [status, id]);
      console.log(' Status diupdate!');
      break;
    }
    case '4': {
      const id = rl.question('ID Pesanan yang dihapus: ');
      if (rl.keyInYNStrict(`Yakin hapus pesanan ${id}?`)) {
        await db.query('DELETE FROM pesanan WHERE id_pesanan = ?', [id]);
        console.log(' Pesanan dihapus!');
      }
      break;
    }
    case '0': menuUtama(); return;
  }
  menuPesanan();
}

async function menuPembayaran() {
  console.log('\n── PEMBAYARAN ──');
  console.log('1. Tampilkan Semua Pembayaran');
  console.log('2. Tambah Pembayaran');
  console.log('3. Update Status Pembayaran');
  console.log('4. Hapus Pembayaran');
  console.log('0. Kembali');

  const pilih = rl.question('\nPilih: ');
  switch (pilih) {
    case '1': {
      const [rows] = await db.query('SELECT * FROM pembayaran');
      rows.forEach(r => {
        const waktu = r.waktu_pembayaran
          ? r.waktu_pembayaran.toLocaleString('sv-SE')
          : '-';
        console.log(`[${r.id_pembayaran}] Pesanan: ${r.id_pesanan} | Metode: ${r.metode} | Jumlah: Rp${Number(r.jumlah).toLocaleString('id-ID')} | Waktu: ${waktu} | Status: ${r.status_bayar}`);
      });
      break;
    }
    case '2': {
      const id_pembayaran = rl.question('ID Pembayaran : ');


      const [existing] = await db.query('SELECT id_pembayaran FROM pembayaran WHERE id_pembayaran = ?', [id_pembayaran]);
      if (existing.length > 0) {
        console.log(` Pembayaran dengan ID "${id_pembayaran}" sudah ada!`);
        break;
      }

      const id_pesanan = rl.question('ID Pesanan    : ');

      const [cekPesanan] = await db.query('SELECT id_pesanan FROM pesanan WHERE id_pesanan = ?', [id_pesanan]);
      if (cekPesanan.length === 0) {
        console.log(` ID Pesanan ${id_pesanan} tidak ditemukan!`);
        break;
      }

      const metode = rl.question('Metode        : ');
      const jumlah = rl.questionInt('Jumlah        : ');
      const waktu_pembayaran = rl.question('Waktu (YYYY-MM-DD HH:MM:SS): ');
      const status_bayar = rl.question('Status (Lunas/Pending/Dikembalikan): ');
      await db.query(
        'INSERT INTO pembayaran VALUES (?, ?, ?, ?, ?, ?)',
        [id_pembayaran, id_pesanan, metode, jumlah, waktu_pembayaran, status_bayar]
      );
      console.log(' Pembayaran ditambahkan!');
      break;
    }
    case '3': {
      const id = rl.question('ID Pembayaran yang diupdate: ');
      const [rows] = await db.query('SELECT * FROM pembayaran WHERE id_pembayaran = ?', [id]);
      if (rows.length === 0) { console.log(' Tidak ditemukan'); break; }
      const p = rows[0];

      const waktu = p.waktu_pembayaran?.toLocaleString('sv-SE') || '-';
      console.log(`\n[${p.id_pembayaran}] Pesanan: ${p.id_pesanan} | Metode: ${p.metode} | Jumlah: Rp${Number(p.jumlah).toLocaleString('id-ID')} | Waktu: ${waktu}`);
      console.log(`Status saat ini: ${p.status_bayar}\n`);
      const status_bayar = rl.question('Status baru (Lunas/Pending/Dikembalikan): ') || p.status_bayar;
      await db.query(
        'UPDATE pembayaran SET status_bayar=? WHERE id_pembayaran=?',
        [status_bayar, id]
      );
      console.log(' Status pembayaran berhasil diupdate!');
      break;
    }
    case '4': {
      const id = rl.question('ID Pembayaran yang dihapus: ');
      await db.query('DELETE FROM pembayaran WHERE id_pembayaran = ?', [id]);
      console.log('Pembayaran dihapus!');
      break;
    }
    case '0': menuUtama(); return;
  }
  menuPembayaran();
}

async function menuVoucher() {
  console.log('\n── VOUCHER ──');
  console.log('1. Tampilkan Semua Voucher');
  console.log('2. Tambah Voucher');
  console.log('3. Hapus Voucher');
  console.log('4. Update Voucher');
  console.log('0. Kembali');

  const pilih = rl.question('\nPilih: ');
  switch (pilih) {
    case '1': {
      const [rows] = await db.query('SELECT * FROM voucher');
      rows.forEach(r => console.log(`[${r.id_voucher}] ${r.kode_voucher} | Diskon: ${r.diskon}% | Berlaku Sampai: ${r.masa_berlaku}`));
      break;
    }
    case '2': {
      const id_voucher = rl.question('ID Voucher    : ');
      const [cek] = await db.query('SELECT * FROM voucher WHERE id_voucher = ?', [id_voucher]);
      if (cek.length > 0) {
        console.log(`ID Voucher "${id_voucher}" sudah ada! Gunakan ID lain.`);
        break;
      }
      const kode_voucher = rl.question('Kode Voucher  : ');
      const diskon = rl.questionInt('Diskon (%)    : ');
      const masa_berlaku = rl.question('Masa Berlaku (YYYY-MM-DD): ');
      await db.query('INSERT INTO voucher VALUES (?, ?, ?, ?)',
        [id_voucher, kode_voucher, diskon, masa_berlaku]);
      console.log(' Voucher ditambahkan!');
      break;
    }
    case '3': {
      const id = rl.question('ID Voucher yang dihapus: ');
      const [cek] = await db.query('SELECT * FROM voucher WHERE id_voucher = ?', [id]);
      if (cek.length === 0) {
        console.log(`ID Voucher "${id}" tidak ditemukan!`);
        break;
      }
      await db.query('DELETE FROM voucher WHERE id_voucher = ?', [id]);
      console.log(' Voucher dihapus!');
      break;
    }
    case '4': {
      const id = rl.question('ID Voucher yang diupdate: ');
      const [cek] = await db.query('SELECT * FROM voucher WHERE id_voucher = ?', [id]);
      if (cek.length === 0) {
        console.log(`ID Voucher "${id}" tidak ditemukan!`);
        break;
      }

      const lama = cek[0];
      // Input baru, kalau kosong pakai nilai lama
      const kode_voucher = rl.question(`Kode Voucher baru [${lama.kode_voucher}]: `) || lama.kode_voucher;
      const diskonInput = rl.question(`Diskon (%) baru [${lama.diskon}]: `);
      const diskon = diskonInput === '' ? lama.diskon : parseInt(diskonInput);
      const masaInput = rl.question(`Masa Berlaku baru (YYYY-MM-DD) [${lama.masa_berlaku}]: `);
      const masa_berlaku = masaInput === '' ? lama.masa_berlaku : masaInput;

      await db.query(
        'UPDATE voucher SET kode_voucher = ?, diskon = ?, masa_berlaku = ? WHERE id_voucher = ?',
        [kode_voucher, diskon, masa_berlaku, id]
      );
      console.log(' Voucher berhasil diupdate!');
      break;
    }
    case '0': menuUtama(); return;
  }
  menuVoucher();
}

async function menuItemPesanan() {
  console.log('\n── ITEM PESANAN ──');
  console.log('1. Tampilkan Semua Item');
  console.log('2. Tampilkan Item by ID Pesanan');
  console.log('3. Tambah Item Pesanan');
  console.log('4. Hapus Item Pesanan');
  console.log('5. Update Item Pesanan');
  console.log('0. Kembali');

  const pilih = rl.question('\nPilih: ');
  switch (pilih) {
    case '1': {
      const [rows] = await db.query(`
        SELECT ip.*, pr.nama_produk FROM item_pesanan ip
        LEFT JOIN produk pr ON ip.id_produk = pr.id_produk
      `);
      rows.forEach(r => console.log(`[${r.id_itemPesanan}] Pesanan: ${r.id_pesanan} | ${r.nama_produk} | Qty: ${r.jumlah} | Harga: Rp${Number(r.harga_satuan).toLocaleString('id-ID')}`));
      break;
    }
    case '2': {
      const id_pesanan = rl.question('ID Pesanan (Contoh IP001): ');
      const [rows] = await db.query('SELECT * FROM item_pesanan WHERE id_pesanan = ?', [id_pesanan]);
      rows.forEach(r => console.log(`  - ${r.id_produk} | Qty: ${r.jumlah} | Rp${Number(r.harga_satuan).toLocaleString('id-ID')}`));
      break;
    }
    case '3': {
      // tambah item pesanan
      const id_item = rl.question('ID Item Pesanan (Contoh IP001): ');
      const [cek] = await db.query('SELECT * FROM item_pesanan WHERE id_itemPesanan = ?', [id_item]);
      if (cek.length > 0) {
        console.log(`ID Item Pesanan "${id_item}" sudah ada! Gunakan ID lain.`);
        break;
      }
      const id_pesanan = rl.question('ID Pesanan (Contoh ORD001): ');
      const id_produk = rl.question('ID Produk (Contoh P001): ');
      const jumlah = rl.questionInt('Jumlah          : ');
      const harga_satuan = rl.questionInt('Harga Satuan    : ');
      await db.query('INSERT INTO item_pesanan VALUES (?, ?, ?, ?, ?)',
        [id_item, id_pesanan, id_produk, jumlah, harga_satuan]);
      console.log(' Item pesanan ditambahkan!');
      break;
    }
    case '4': {
      const id = rl.question('ID Item yang dihapus: ');
      await db.query('DELETE FROM item_pesanan WHERE id_itemPesanan = ?', [id]);
      console.log('Item dihapus!');
      break;
    }
    case '5': {
      const id_item = rl.question('ID Item Pesanan yang diupdate: ');
      const [cek] = await db.query('SELECT * FROM item_pesanan WHERE id_itemPesanan = ?', [id_item]);
      if (cek.length === 0) {
        console.log(`ID Item Pesanan "${id_item}" tidak ditemukan!`);
        break;
      }
      const jumlah = rl.questionInt('Jumlah baru       : ');

      // Update hanya kolom jumlah
      await db.query(
        'UPDATE item_pesanan SET jumlah = ? WHERE id_itemPesanan = ?',
        [jumlah, id_item]
      );
      console.log('Item pesanan berhasil diupdate!');
      break;
    }
    case '0': menuUtama(); return;
  }
  menuItemPesanan();
}

async function menuSpekProduk() {
  console.log('\n── SPEK PRODUK (MongoDB) ──');
  console.log('1. Lihat Semua Spek');
  console.log('2. Lihat Spek by ID Produk');
  console.log('3. Tambah Spek');
  console.log('4. Hapus Spek');
  console.log('5. Update Spek');
  console.log('0. Kembali');

  const pilih = rl.question('\nPilih: ');
  switch (pilih) {
    case '1': {
      const data = await SpekProduk.find();
      data.forEach(s =>
        console.log(
          `[${s.id_produk}] Supplier: ${s.supplier?.[0]?.nama_supplier || '-'} | Spek: ${JSON.stringify(s.spesifikasi)}`
        )
      );
      break;
    }
    case '2': {
      const id = rl.question('ID Produk: ');
      const s = await SpekProduk.findOne({ id_produk: id });
      if (!s) { console.log(' Tidak ditemukan'); break; }
      console.log(JSON.stringify(s, null, 2));
      break;
    }
    case '3': {

      const id_produk = rl.question('ID Produk : ');

      // CEK PRODUK ADA DI MYSQL
      const [produk] = await db.query(
        'SELECT * FROM produk WHERE id_produk=?',
        [id_produk]
      );

      if (produk.length === 0) {
        console.log('Produk belum ada, tambah produk dulu!');
        break;
      }

      const supplier = {
        nama_supplier: rl.question('Nama Supplier : '),
        kontak: rl.question('Kontak : '),
        alamat: rl.question('Alamat : ')
      };


      const input = rl.question(
        'Masukkan spesifikasi (JSON): '
      );

      try {

        const spek = new SpekProduk({
          id_produk,

          supplier: [
            supplier
          ],

          spesifikasi: [
            JSON.parse(input)
          ]

        });


        await spek.save();

        console.log('Spek + Supplier berhasil disimpan!');

      } catch (err) {

        console.log('Format JSON salah!');

      }

      break;
    }
    case '4': {
      const id = rl.question('ID Produk yang speknya dihapus: ');
      await SpekProduk.findOneAndDelete({ id_produk: id });
      console.log('Spek dihapus!');
      break;
    }
    case '5': {

      const id = rl.question('ID Produk: ');

      const cek = await SpekProduk.findOne({
        id_produk: id
      });

      if (!cek) {
        console.log('Spek belum ada, gunakan tambah spek dulu');
        break;
      }

      const spekBaru = rl.question(
        'Masukkan spesifikasi baru (format JSON): '
      );

      try {

        const update = {
          spesifikasi: JSON.parse(spekBaru)
        };

        await SpekProduk.findOneAndUpdate(
          { id_produk: id },
          update,
          { returnDocument: 'after' }
        );

        console.log('Spek berhasil diupdate!');

      } catch (err) {
        console.log('Format JSON salah');
      }

      break;
    }
    case '0': menuUtama(); return;
  }
  menuSpekProduk();
}

// ─── Jalankan ─────────────────────────────────────────────────
init().catch(console.error);