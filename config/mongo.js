const mongoose = require('mongoose');
require('dotenv').config();

const connectMongo = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB berhasil konek!');
  } catch (err) {
    console.error('MongoDB gagal konek:', err.message);
  }
};

module.exports = connectMongo;