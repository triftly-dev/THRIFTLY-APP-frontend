import api from './api'

export const messageService = {
  /**
   * Mengambil jumlah pesan unread dari API
   */
  async getUnreadCount() {
    try {
      const response = await api.get('/messages/unread/count')
      return response.data.unread_count || 0
    } catch (error) {
      console.error("Error fetching unread count:", error)
      return 0
    }
  },

  /**
   * Mengambil daftar percakapan (Inbox)
   * Mengembalikan semua pesan yang melibatkan user (grouping dilakukan di frontend jika perlu)
   */
  async getConversationsList() {
    try {
      const response = await api.get('/messages')
      // Handle Laravel data wrapper
      return Array.isArray(response.data) ? response.data : (response.data?.data || [])
    } catch (error) {
      console.error("Error fetching conversations list:", error)
      return []
    }
  },

  /**
   * Mengambil detail chat berdasarkan PRODUK dan LAWAN BICARA
   */
  async getConversation(productId, otherUserId) {
    try {
      const response = await api.get(`/messages/${productId}/${otherUserId}`)
      // Handle Laravel data wrapper
      return Array.isArray(response.data) ? response.data : (response.data?.data || [])
    } catch (error) {
      console.error("Error fetching conversation detail:", error)
      return []
    }
  },

  /**
   * Mengirim pesan baru
   */
  async createMessage(messageData) {
    try {
      const response = await api.post('/messages', {
        receiver_id: messageData.receiverId,
        message: messageData.message,
        product_id: messageData.productId
      })
      return response.data
    } catch (error) {
      console.error("Error creating message:", error)
      throw error
    }
  },

  /**
   * Tandai pesan sudah dibaca
   */
  async markAsRead(productId, senderId) {
    try {
      const response = await api.post('/messages/read', {
        product_id: productId,
        sender_id: senderId
      })
      return response.data
    } catch (error) {
      console.error("Error marking messages as read:", error)
    }
  }
}
