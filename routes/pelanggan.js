const express = require('express');
const router = express.Router();
const db = require('../config/mysql');

// 1. GET semua produk
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM produk');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. GET produk by ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM produk WHERE id_produk = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Produk tidak ditemukan' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. POST tambah produk (Kategori ikut dimasukkan sesuai ERD baru)
router.post('/', async (req, res) => {
  const { id_produk, nama_produk, kategori, harga, stok, status } = req.body;
  try {
    await db.query(
      'INSERT INTO produk (id_produk, nama_produk, kategori, harga, stok, status) VALUES (?, ?, ?, ?, ?, ?)',
      [id_produk, nama_produk, kategori, harga, stok, status]
    );
    res.status(201).json({ message: 'Produk berhasil ditambahkan ke MySQL' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. PUT update produk (Validasi affectedRows + Kategori aman)
router.put('/:id', async (req, res) => {
  const { nama_produk, kategori, harga, stok, status } = req.body;
  try {
    const [result] = await db.query(
      'UPDATE produk SET nama_produk=?, kategori=?, harga=?, stok=?, status=? WHERE id_produk=?',
      [nama_produk, kategori, harga, stok, status, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Gagal update, ID produk tidak ditemukan' });
    }

    res.json({ message: 'Produk berhasil diupdate' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. DELETE produk (Validasi affectedRows)
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM produk WHERE id_produk = ?', [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Gagal menghapus, ID produk tidak ditemukan' });
    }

    res.json({ message: 'Produk berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;