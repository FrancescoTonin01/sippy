import { motion } from 'framer-motion'
import type { GroupDrink } from '../api/groups'
import { formatDateFromUTC } from '../utils/dateHelpers'

interface GroupDrinkHistoryProps {
  drinks: GroupDrink[]
  loading: boolean
  currentUserId?: string
}

export const GroupDrinkHistory = ({ drinks, loading, currentUserId }: GroupDrinkHistoryProps) => {
  const formatDate = (utcDateString: string) => {
    // La data arriva come UTC, ma dobbiamo calcolare la differenza correttamente
    const utcDate = new Date(utcDateString)
    const now = new Date()
    const diffMs = now.getTime() - utcDate.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)
    
    if (diffHours < 1) return 'Ora'
    if (diffHours < 24) return `${diffHours}h fa`
    if (diffDays === 1) return 'Ieri'
    if (diffDays < 7) return `${diffDays}g fa`
    
    return formatDateFromUTC(utcDateString)
  }

  const formatTime = (utcDateString: string) => {
    const normalizedString = utcDateString.endsWith('Z') ? utcDateString : utcDateString + 'Z'
    const utcDate = new Date(normalizedString)
    
    return utcDate.toLocaleString('it-IT', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/Rome'
    })
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          📋 Ultimi Drink del Gruppo
        </h3>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
                </div>
                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-16"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
          📋 Ultimi Drink del Gruppo
        </h3>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {drinks.length} drink{drinks.length !== 1 ? 's' : ''}
        </span>
      </div>

      {drinks.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-2">🍻</div>
          <p className="text-gray-500 dark:text-gray-400">Nessun drink ancora registrato</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {drinks.map((drink, index) => {
            const isCurrentUser = drink.user_id === currentUserId
            
            return (
              <motion.div
                key={drink.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  isCurrentUser ? 'bg-teal-50 dark:bg-teal-900/30 border border-teal-100 dark:border-teal-700' : 'bg-gray-50 dark:bg-gray-700'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  isCurrentUser ? 'bg-teal-100 dark:bg-teal-800 text-teal-600 dark:text-teal-300' : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                }`}>
                  {drink.username.charAt(0).toUpperCase()}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`font-medium ${
                      isCurrentUser ? 'text-teal-800 dark:text-teal-300' : 'text-gray-800 dark:text-white'
                    }`}>
                      {isCurrentUser ? 'Tu' : drink.username}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(drink.created_at)}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-700 dark:text-gray-200 font-medium">
                    {drink.type}
                  </p>
                  
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <span>📍 {drink.location}</span>
                    <span>•</span>
                    <span>{formatTime(drink.created_at)}</span>
                  </div>
                </div>
                
                <div className="text-right">
                  <span className={`text-sm font-semibold ${
                    isCurrentUser ? 'text-teal-600 dark:text-teal-400' : 'text-gray-700 dark:text-gray-200'
                  }`}>
                    €{drink.cost.toFixed(2)}
                  </span>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {drinks.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Aggiornato in tempo reale • {drinks.length}/10 drink mostrati
          </p>
        </div>
      )}
    </motion.div>
  )
}