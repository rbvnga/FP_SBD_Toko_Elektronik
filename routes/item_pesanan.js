const express = require('express');
const router = express.Router();
const db = require('../config/mysql');

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT ip.*, pr.nama_produk FROM item_pesanan ip
      LEFT JOIN produk pr ON ip.id_produk = pr.id_produk
    `);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  const { id_itemPesanan, id_pesanan, id_produk, jumlah, harga_satuan } = req.body;
  try {
    await db.query('INSERT INTO item_pesanan VALUES (?, ?, ?, ?, ?)',
      [id_itemPesanan, id_pesanan, id_produk, jumlah, harga_satuan]);
    res.status(201).json({ message: 'Item pesanan ditambahkan' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM item_pesanan WHERE id_itemPesanan = ?', [req.params.id]);
    res.json({ message: 'Item dihapus' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;