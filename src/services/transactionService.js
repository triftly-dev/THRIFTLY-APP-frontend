import api from './api'

export const transactionService = {
  async getAllTransactions() {
    const response = await api.get('/transactions')
    return response.data.data || response.data
  },

  async getAdminTransactions() {
    const response = await api.get('/admin/transactions')
    return response.data
  },

  async getTransactionById(id) {
    const response = await api.get(`/transactions/${id}`)
    return response.data
  },

  async getTransactionByOrderId(orderId) {
    const response = await this.getAllTransactions()
    const transactions = Array.isArray(response) ? response : (response.data || [])
    return transactions.find(t => t.order_id === orderId)
  },

  async charge(data) {
    const response = await api.post('/payment/charge', data)
    return response.data
  },

  async getTransactionsByBuyer(buyerId) {
    const response = await api.get('/transactions')
    return response.data.data || response.data
  },

  async getTransactionsBySeller(sellerId) {
    const response = await api.get('/seller/orders')
    return response.data.data || response.data
  },

  async createTransaction(transactionData) {
    const transactions = this.getAllTransactions()

    const newTransaction = {
      id: generateId(),
      productId: transactionData.productId,
      buyerId: transactionData.buyerId,
      sellerId: transactionData.sellerId,
      hargaFinal: transactionData.hargaFinal,
      ongkir: transactionData.ongkir || 0,
      ongkirDitanggung: transactionData.ongkirDitanggung || 'buyer',
      alamatPengiriman: transactionData.alamatPengiriman,
      status: 'pending',
      videoPacking: '',
      videoUnboxing: '',
      createdAt: new Date().toISOString(),
      paidAt: null,
      shippedAt: null,
      completedAt: null
    }

    transactions.push(newTransaction)
    storage.set(STORAGE_KEYS.TRANSACTIONS, transactions)

    // Update status produk menjadi terjual di server
    try {
      await productService.markAsSold(transactionData.productId)
    } catch (e) {
      console.warn("Gagal mengubah status produk di server, tapi transaksi tetap dicatat lokal.")
    }

    // Catatan: Update saldo penjual SEHARUSNYA dilakukan oleh backend.
    // Di sini kita abaikan karena buyer tidak punya akses 403 ke saldo seller.
    return newTransaction
  },


  updateTransaction(id, updates) {
    const transactions = this.getAllTransactions()
    const index = transactions.findIndex(transaction => transaction.id === id)
    
    if (index === -1) {
      throw new Error('Transaksi tidak ditemukan')
    }

    transactions[index] = {
      ...transactions[index],
      ...updates,
      updatedAt: new Date().toISOString()
    }

    storage.set(STORAGE_KEYS.TRANSACTIONS, transactions)
    return transactions[index]
  },

  markAsPaid(id) {
    const transactions = this.getAllTransactions()
    const index = transactions.findIndex(transaction => transaction.id === id)
    
    if (index === -1) {
      throw new Error('Transaksi tidak ditemukan')
    }

    transactions[index].status = 'paid'
    transactions[index].paidAt = new Date().toISOString()

    storage.set(STORAGE_KEYS.TRANSACTIONS, transactions)
    return transactions[index]
  },

  async markAsShipped(id, videoPacking = '') {
    const response = await api.post(`/transactions/${id}/status`, {
      status: 'shipped',
      video_packing: videoPacking
    })
    return response.data
  },

  async markAsCompleted(id) {
    const response = await api.post(`/transactions/${id}/status`, {
      status: 'completed'
    })
    return response.data
  },


  markAsRetur(id, videoUnboxing = '') {
    const transactions = this.getAllTransactions()
    const index = transactions.findIndex(transaction => transaction.id === id)
    
    if (index === -1) {
      throw new Error('Transaksi tidak ditemukan')
    }

    const transaction = transactions[index]
    transactions[index].status = 'retur'
    transactions[index].videoUnboxing = videoUnboxing
    transactions[index].returAt = new Date().toISOString()

    storage.set(STORAGE_KEYS.TRANSACTIONS, transactions)

    const seller = userService.getUserById(transaction.sellerId)
    if (seller) {
      const newKetahan = (seller.saldo?.ketahan || 0) - transaction.hargaFinal
      
      userService.updateSaldo(transaction.sellerId, {
        ketahan: Math.max(0, newKetahan)
      })
    }

    return transactions[index]
  },

  deleteTransaction(id) {
    const transactions = this.getAllTransactions()
    const filtered = transactions.filter(transaction => transaction.id !== id)
    storage.set(STORAGE_KEYS.TRANSACTIONS, filtered)
    return true
  },

  getReturTransactions() {
    const transactions = this.getAllTransactions()
    return transactions.filter(transaction => transaction.status === 'retur')
  }
}
