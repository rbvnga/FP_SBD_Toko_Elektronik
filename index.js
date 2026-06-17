const express = require('express');
const connectMongo = require('./config/mongo');
require('dotenv').config();

const app = express();
app.use(express.json()); // agar bisa baca request body JSON

// Koneksi MongoDB
connectMongo();

// Import semua routes
app.use('/api/produk',       require('./routes/produk'));
app.use('/api/pelanggan',    require('./routes/pelanggan'));
app.use('/api/pesanan',      require('./routes/pesanan'));
app.use('/api/item-pesanan', require('./routes/item_Pesanan'));
app.use('/api/pembayaran',   require('./routes/pembayaran'));
app.use('/api/voucher',      require('./routes/voucher'));
app.use('/api/spesifikasi-produk',  require('./routes/spesifikasi_produk'));   // MongoDB 
app.use('/api/ulasan',       require('./routes/ulasan'));       // MongoDB

// Route default
app.get('/', (req, res) => {
  res.json({ message: ' API FP SBD berjalan!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});