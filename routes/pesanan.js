const express = require('express');
const router = express.Router();
const db = require('../config/mysql');

// GET semua pesanan + nama pelanggan (JOIN)
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT p.*, pl.nama_pelanggan, v.kode_voucher
      FROM pesanan p
      LEFT JOIN pelanggan pl ON p.id_pelanggan = pl.id_pelanggan
      LEFT JOIN voucher v ON p.id_voucher = v.id_voucher
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT p.*, pl.nama_pelanggan FROM pesanan p
       LEFT JOIN pelanggan pl ON p.id_pelanggan = pl.id_pelanggan
       WHERE p.id_pesanan = ?`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Pesanan tidak ditemukan' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  const { id_pesanan, id_pelanggan, id_voucher, status_pesanan, total_harga, tanggal_pesanan, jasa_kirim } = req.body;
  try {
    await db.query(
      'INSERT INTO pesanan (id_pesanan, id_pelanggan, id_voucher, status_pesanan, total_harga, tanggal_pesanan, jasa_kirim) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id_pesanan, id_pelanggan, id_voucher, status_pesanan, total_harga, tanggal_pesanan, jasa_kirim]
    );
    res.status(201).json({ message: 'Pesanan berhasil ditambahkan' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  const { status_pesanan, total_harga, jasa_kirim } = req.body;
  try {
    await db.query(
      'UPDATE pesanan SET status_pesanan=?, total_harga=?, jasa_kirim=? WHERE id_pesanan=?',
      [status_pesanan, total_harga, jasa_kirim, req.params.id]
    );
    res.json({ message: 'Pesanan berhasil diupdate' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM pesanan WHERE id_pesanan = ?', [req.params.id]);
    res.json({ message: 'Pesanan berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;