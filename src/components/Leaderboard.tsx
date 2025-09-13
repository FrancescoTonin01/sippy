import { motion } from 'framer-motion'

interface LeaderboardEntry {
  user_id: string
  username: string
  drink_count: number
  total_cost: number
}

interface LeaderboardProps {
  data: LeaderboardEntry[]
  currentUserId?: string
}

export const Leaderboard = ({ data, currentUserId }: LeaderboardProps) => {
  // Sort data by drink count descending
  const sortedData = [...data].sort((a, b) => b.drink_count - a.drink_count)

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0: return '🥇'
      case 1: return '🥈'
      case 2: return '🥉'
      default: return `${index + 1}°`
    }
  }

  const getRankColor = (index: number) => {
    switch (index) {
      case 0: return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/30'
      case 1: return 'text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700'
      case 2: return 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30'
      default: return 'text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700'
    }
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">Nessun dato disponibile</p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
          Inizia a registrare i tuoi drink per vedere la classifica!
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {sortedData.map((entry, index) => (
        <motion.div
          key={entry.user_id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className={`flex items-center p-4 rounded-lg border-2 transition-colors ${
            entry.user_id === currentUserId
              ? 'border-teal-200 dark:border-teal-700 bg-teal-50 dark:bg-teal-900/30'
              : 'border-gray-100 dark:border-gray-600 bg-white dark:bg-gray-700'
          }`}
        >
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${getRankColor(index)}`}>
            {getRankIcon(index)}
          </div>
          
          <div className="flex-1 ml-3">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-800 dark:text-white">
                {entry.username}
              </span>
              {entry.user_id === currentUserId && (
                <span className="text-xs bg-teal-100 dark:bg-teal-800 text-teal-800 dark:text-teal-200 px-2 py-1 rounded-full font-medium">
                  Tu
                </span>
              )}
              {index === 0 && entry.drink_count > 0 && (
                <span className="text-xs bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded-full font-medium">
                  Leader
                </span>
              )}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              €{entry.total_cost.toFixed(2)} spesi
              {entry.drink_count > 0 && (
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                  (€{(entry.total_cost / entry.drink_count).toFixed(1)} per drink)
                </span>
              )}
            </div>
          </div>

          <div className="text-right">
            <div className="text-2xl font-bold text-gray-800 dark:text-white">
              {entry.drink_count}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">drink</div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}