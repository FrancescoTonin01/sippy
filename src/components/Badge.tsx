import { motion } from 'framer-motion'

interface BadgeData {
  id: string
  title: string
  description: string
  icon: string
  unlocked: boolean
  requirement: string | number
}

interface BadgeProps {
  badge: BadgeData
  delay?: number
}

export const Badge = ({ badge, delay = 0 }: BadgeProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      className={`p-4 rounded-lg border-2 transition-all ${
        badge.unlocked
          ? 'border-teal-200 dark:border-teal-700 bg-teal-50 dark:bg-teal-900/30'
          : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 opacity-60'
      }`}
    >
      <div className="flex items-center gap-4">
        <div className={`text-3xl ${badge.unlocked ? '' : 'grayscale'}`}>
          {badge.icon}
        </div>
        
        <div className="flex-1">
          <h3 className={`font-semibold ${
            badge.unlocked ? 'text-gray-800 dark:text-white' : 'text-gray-500 dark:text-gray-400'
          }`}>
            {badge.title}
          </h3>
          <p className={`text-sm ${
            badge.unlocked ? 'text-gray-600 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500'
          }`}>
            {badge.description}
          </p>
          
          {!badge.unlocked && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Requisito: {badge.requirement}
            </p>
          )}
        </div>

        {badge.unlocked && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: delay + 0.2 }}
            className="text-teal-600 dark:text-teal-400 text-xl"
          >
            ✓
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}