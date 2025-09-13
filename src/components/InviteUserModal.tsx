import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useUserSearch } from '../hooks/useGroups'
import { useAuth } from '../hooks/useAuth'

interface InviteUserModalProps {
  isOpen: boolean
  onClose: () => void
  onInvite: (userId: string) => Promise<{ success: boolean; error?: string }>
}

export const InviteUserModal = ({ isOpen, onClose, onInvite }: InviteUserModalProps) => {
  const { user } = useAuth()
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { users, search, loading: searchLoading } = useUserSearch(user?.id)

  useEffect(() => {
    if (query.trim().length >= 2) {
      const timeoutId = setTimeout(() => {
        search(query)
      }, 300)
      
      return () => clearTimeout(timeoutId)
    } else {
      search('')
    }
  }, [query, search])

  const handleInvite = async (userId: string) => {
    setLoading(true)
    setError('')

    try {
      console.log('Inviting user:', userId)
      const result = await onInvite(userId)
      console.log('Invite result:', result)
      
      if (result.success) {
        setQuery('')
        onClose()
      } else {
        setError(result.error || 'Errore nell\'invito')
      }
    } catch (err) {
      console.error('Invite error:', err)
      setError('Errore imprevisto')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setQuery('')
    setError('')
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={handleClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Invita utente
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cerca utente per username
                  </label>
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="Inserisci username..."
                  />
                </div>

                {error && (
                  <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                    {error}
                  </div>
                )}

                <div className="max-h-60 overflow-y-auto">
                  {searchLoading ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600 mx-auto"></div>
                    </div>
                  ) : users.length > 0 ? (
                    <div className="space-y-2">
                      {users.map((user) => (
                        <div
                          key={user.id}
                          className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                        >
                          <div>
                            <p className="font-medium text-gray-800">
                              {user.username}
                            </p>
                          </div>
                          <button
                            onClick={() => handleInvite(user.id)}
                            disabled={loading}
                            className="px-3 py-1 text-sm bg-teal-600 text-white rounded hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {loading ? 'Invito...' : 'Invita'}
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : query.trim().length >= 2 ? (
                    <p className="text-gray-500 text-center py-4">
                      Nessun utente trovato
                    </p>
                  ) : (
                    <p className="text-gray-500 text-center py-4">
                      Inserisci almeno 2 caratteri per cercare
                    </p>
                  )}
                </div>

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Chiudi
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}