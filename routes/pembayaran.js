const express = require('express');
const router = express.Router();
const db = require('../config/mysql');

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM pembayaran');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  const { id_pembayaran, id_pesanan, metode, jumlah, waktu_pembayaran, status_bayar } = req.body;
  try {
    await db.query('INSERT INTO pembayaran VALUES (?, ?, ?, ?, ?, ?)',
      [id_pembayaran, id_pesanan, metode, jumlah, waktu_pembayaran, status_bayar]);
    res.status(201).json({ message: 'Pembayaran ditambahkan' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', async (req, res) => {
  const { status_bayar } = req.body;
  try {
    await db.query('UPDATE pembayaran SET status_bayar=? WHERE id_pembayaran=?',
      [status_bayar, req.params.id]);
    res.json({ message: 'Pembayaran diupdate' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM pembayaran WHERE id_pembayaran = ?', [req.params.id]);
    res.json({ message: 'Pembayaran dihapus' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;