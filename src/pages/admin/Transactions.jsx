import AdminLayout from '../../components/layout/AdminLayout'
import DataTable from '../../components/common/DataTable'
import { transactionService } from '../../services/transactionService'
import { useEffect, useState } from 'react'
import { Eye } from 'lucide-react'
import { formatCurrency, formatDate } from '../../utils/helpers'

const Transactions = () => {
  const [transactions, setTransactions] = useState([])

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        const data = await transactionService.getAdminTransactions()
        setTransactions(data || [])
      } catch (error) {
        console.error('Failed to load transactions:', error)
        setTransactions([])
      }
    }
    loadTransactions()
  }, [])

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-amber-100 text-amber-700 border-amber-200',
      paid: 'bg-blue-100 text-blue-700 border-blue-200',
      shipped: 'bg-indigo-100 text-indigo-700 border-indigo-200',
      completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      retur: 'bg-rose-100 text-rose-700 border-rose-200'
    }

    return (
      <span className={`px-2.5 py-1 text-xs font-medium rounded-full border capitalize ${styles[status] || styles.pending}`}>
        {status}
      </span>
    )
  }

  const columns = [
    {
      header: 'TRX ID',
      accessor: 'order_id',
      className: 'font-mono text-xs text-gray-500',
      render: (row) => String(row.order_id || row.id).substring(0, 15).toUpperCase()
    },
    {
      header: 'Date',
      accessor: 'created_at',
      render: (row) => <span className="text-gray-600">{formatDate(row.created_at || row.createdAt)}</span>
    },
    {
      header: 'Amount',
      accessor: 'harga_final',
      render: (row) => <span className="font-medium text-gray-900">{formatCurrency(row.harga_final || row.hargaFinal)}</span>
    },
    {
      header: 'Shipping',
      accessor: 'ongkir',
      render: (row) => <span className="capitalize text-gray-600">{formatCurrency(row.ongkir || 0)}</span>
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => getStatusBadge(row.status)
    },
    {
      header: 'Actions',
      accessor: 'actions',
      className: 'text-right',
      render: () => (
        <div className="flex items-center justify-end gap-2">
          <button className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="View Details">
            <Eye size={18} />
          </button>
        </div>
      )
    }
  ]

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Transactions</h1>
        <p className="text-gray-500 mt-1">Monitor all marketplace transactions and middle-man payments.</p>
      </div>

      <DataTable 
        title="All Transactions"
        columns={columns}
        data={transactions}
        itemsPerPage={10}
      />
    </AdminLayout>
  )
}

export default Transactions
