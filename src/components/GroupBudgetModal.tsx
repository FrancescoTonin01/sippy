import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface GroupBudgetModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (budget: number) => Promise<{ success: boolean; error?: string }>
  currentBudget: number
  groupName: string
}

export const GroupBudgetModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  currentBudget, 
  groupName 
}: GroupBudgetModalProps) => {
  const [budget, setBudget] = useState(currentBudget.toString())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const budgetValue = parseFloat(budget)
    if (isNaN(budgetValue) || budgetValue < 0) {
      setError('Inserisci un budget valido')
      return
    }

    setLoading(true)
    setError('')

    try {
      const result = await onSubmit(budgetValue)
      
      if (result.success) {
        onClose()
        setBudget(budgetValue.toString())
      } else {
        setError(result.error || 'Errore nel salvataggio')
      }
    } catch {
      setError('Errore inatteso')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      onClose()
      setError('')
      setBudget(currentBudget.toString())
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Imposta Obiettivo Gruppo
            </h2>
            <p className="text-gray-600 mb-6 text-sm">
              Imposta un budget settimanale per {groupName}. Tutti i membri dovranno rimanere sotto questo limite per mantenere la streak.
            </p>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-2">
                  Budget settimanale (€)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">€</span>
                  <input
                    id="budget"
                    type="number"
                    step="0.01"
                    min="0"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="0.00"
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={loading}
                  className="flex-1 py-2 px-4 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2 px-4 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Salvando...
                    </>
                  ) : (
                    'Salva Obiettivo'
                  )}
                </button>
              </div>
            </form>

            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800 text-xs">
                💡 <strong>Suggerimento:</strong> Un budget di €0 disabilita l'obiettivo gruppo. 
                I membri potranno comunque vedere la classifica settimanale.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}