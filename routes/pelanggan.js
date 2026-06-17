const express = require('express');
const router = express.Router();
const db = require('../config/mysql');

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM pelanggan');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM pelanggan WHERE id_pelanggan = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Pelanggan tidak ditemukan' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  const { id_pelanggan, nama_pelanggan, alamat, no_telepon } = req.body;
  try {
    await db.query(
      'INSERT INTO pelanggan (id_pelanggan, nama_pelanggan, alamat, no_telepon) VALUES (?, ?, ?, ?)',
      [id_pelanggan, nama_pelanggan, alamat, no_telepon]
    );
    res.status(201).json({ message: 'Pelanggan berhasil ditambahkan' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  const { nama_pelanggan, alamat, no_telepon } = req.body;
  try {
    await db.query(
      'UPDATE pelanggan SET nama_pelanggan=?, alamat=?, no_telepon=? WHERE id_pelanggan=?',
      [nama_pelanggan, alamat, no_telepon, req.params.id]
    );
    res.json({ message: 'Pelanggan berhasil diupdate' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM pelanggan WHERE id_pelanggan = ?', [req.params.id]);
    res.json({ message: 'Pelanggan berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;