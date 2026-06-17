const express = require('express');
const router = express.Router();
const db = require('../config/mysql');

// GET semua produk
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM produk');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET produk by ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM produk WHERE id_produk = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Produk tidak ditemukan' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST tambah produk
router.post('/', async (req, res) => {
  const { id_produk, nama_produk, kategori, harga, stok, status } = req.body;
  try {
    await db.query(
      'INSERT INTO produk (id_produk, nama_produk, kategori, harga, stok, status) VALUES (?, ?, ?, ?, ?, ?)',
      [id_produk, nama_produk, kategori, harga, stok, status]
    );
    res.status(201).json({ message: 'Produk berhasil ditambahkan' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update produk
router.put('/:id', async (req, res) => {
  const { nama_produk, kategori, harga, stok, status } = req.body;
  try {
    await db.query(
      'UPDATE produk SET nama_produk=?, kategori=?, harga=?, stok=?, status=? WHERE id_produk=?',
      [nama_produk, kategori, harga, stok, status, req.params.id]
    );
    res.json({ message: 'Produk berhasil diupdate' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE produk
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM produk WHERE id_produk = ?', [req.params.id]);
    res.json({ message: 'Produk berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;