const express = require('express');
const router = express.Router();
const db = require('../config/mysql');

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM voucher');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  const { id_voucher, kode_voucher, diskon, masa_berlaku } = req.body;
  try {
    await db.query('INSERT INTO voucher VALUES (?, ?, ?, ?)',
      [id_voucher, kode_voucher, diskon, masa_berlaku]);
    res.status(201).json({ message: 'Voucher ditambahkan' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM voucher WHERE id_voucher = ?', [req.params.id]);
    res.json({ message: 'Voucher dihapus' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;