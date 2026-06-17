const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const ulasanSchema = new mongoose.Schema({
  id_pesanan: String,
  id_pelanggan: String,
  id_produk: String,
  rating: Number,        // 1-5
  komentar: String,
  tanggal: Date,
  foto_ulasan: [String], // array URL foto (embedded)
  balasan_toko: String,
}, { collection: 'Ulasan' });

const Ulasan = mongoose.model('Ulasan', ulasanSchema);

router.get('/', async (req, res) => {
  try {
    const data = await Ulasan.find();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET ulasan by id_produk
router.get('/produk/:id_produk', async (req, res) => {
  try {
    const data = await Ulasan.find({ id_produk: req.params.id_produk });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const ulasan = new Ulasan(req.body);
    await ulasan.save();
    res.status(201).json({ message: 'Ulasan berhasil ditambahkan', data: ulasan });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const updated = await Ulasan.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ message: 'Ulasan diupdate', data: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Ulasan.findByIdAndDelete(req.params.id);
    res.json({ message: 'Ulasan dihapus' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;