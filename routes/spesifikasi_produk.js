const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Schema (sesuaikan dengan struktur collection kamu di Compass)
const spekSchema = new mongoose.Schema({
  id_produk: String,
  nama_produk: String,
  spesifikasi: {
    berat: String,
    dimensi: String,
    warna: [String],
    material: String,
    // tambah field lain sesuai data kamu
  },
  gambar: [String], // array URL gambar
  deskripsi: String,
}, { collection: 'Spesifikasi_Produk' }); // nama collection di MongoDB

const SpekProduk = mongoose.model('SpekProduk', spekSchema);

// GET semua spek produk
router.get('/', async (req, res) => {
  try {
    const data = await SpekProduk.find();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET spek by id_produk
router.get('/:id_produk', async (req, res) => {
  try {
    const data = await SpekProduk.findOne({ id_produk: req.params.id_produk });
    if (!data) return res.status(404).json({ message: 'Spek produk tidak ditemukan' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST tambah spek produk
router.post('/', async (req, res) => {
  try {
    const spek = new SpekProduk(req.body);
    await spek.save();
    res.status(201).json({ message: 'Spek produk berhasil ditambahkan', data: spek });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update
router.put('/:id_produk', async (req, res) => {
  try {
    const updated = await SpekProduk.findOneAndUpdate(
      { id_produk: req.params.id_produk },
      req.body,
      { new: true }
    );
    res.json({ message: 'Spek produk diupdate', data: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE
router.delete('/:id_produk', async (req, res) => {
  try {
    await SpekProduk.findOneAndDelete({ id_produk: req.params.id_produk });
    res.json({ message: 'Spek produk dihapus' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;