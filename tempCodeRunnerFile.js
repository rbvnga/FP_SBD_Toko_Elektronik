
        'INSERT INTO pesanan VALUES (?, ?, ?, ?, ?, ?, ?)',
        [id_pesanan, id_pelanggan, id_voucher, status_pesanan, total_harga, tanggal, jasa_kirim]
      );
      console.log(' Pesanan ditambahkan!');
      break;
    }
    case '3': {