import { motion } from 'framer-motion'
import { ProgressBar } from './ProgressBar'
import type { GroupMemberProgress } from '../api/groups'

interface UserProgressCardProps {
  member: GroupMemberProgress
  groupBudget: number
  isCurrentUser?: boolean
  onClick?: (userId: string, username: string) => void
}

export const UserProgressCard = ({ member, groupBudget, isCurrentUser, onClick }: UserProgressCardProps) => {
  const remainingBudget = Math.max(0, groupBudget - member.weekly_spent)
  const progress = groupBudget > 0 ? (remainingBudget / groupBudget) * 100 : 100
  
  const getStreakDisplay = () => {
    if (member.streak_weeks === 0) return null
    if (member.streak_weeks === 1) return '🔥'
    if (member.streak_weeks <= 3) return '🔥🔥'
    return '🔥'
  }

  const getBorderColor = () => {
    if (isCurrentUser) return 'border-teal-500 dark:border-teal-400'
    if (member.is_within_budget) return 'border-green-200 dark:border-green-700'
    return 'border-red-200 dark:border-red-700'
  }

  const getBackgroundColor = () => {
    if (isCurrentUser) return 'bg-teal-50 dark:bg-teal-900/30'
    return 'bg-white dark:bg-gray-800'
  }

  const handleClick = () => {
    if (onClick && !isCurrentUser) {
      onClick(member.user_id, member.username)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={handleClick}
      className={`border-2 ${getBorderColor()} ${getBackgroundColor()} rounded-xl p-4 shadow-sm ${
        onClick && !isCurrentUser ? 'cursor-pointer hover:shadow-md transition-shadow' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            isCurrentUser ? 'bg-teal-100 dark:bg-teal-800' : 'bg-gray-100 dark:bg-gray-700'
          }`}>
            <span className={`font-semibold ${
              isCurrentUser ? 'text-teal-600 dark:text-teal-300' : 'text-gray-600 dark:text-gray-300'
            }`}>
              {member.username.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-white">
              {member.username}
              {isCurrentUser && (
                <span className="ml-2 text-xs bg-teal-100 dark:bg-teal-800 text-teal-800 dark:text-teal-200 px-2 py-1 rounded-full">
                  Tu
                </span>
              )}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {member.drinks_count} drink{member.drinks_count !== 1 ? 's' : ''} • €{member.weekly_spent.toFixed(2)}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {getStreakDisplay() && (
            <div className="flex items-center gap-1">
              <span className="text-lg">{getStreakDisplay()}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">{member.streak_weeks}w</span>
            </div>
          )}
          {member.is_within_budget ? (
            <span className="text-green-600 dark:text-green-400 text-sm font-medium">
              ✅ Nel budget
            </span>
          ) : (
            <span className="text-red-600 dark:text-red-400 text-sm font-medium">
              ❌ Sforato
            </span>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600 dark:text-gray-300">Obiettivo gruppo</span>
          <span className="text-gray-800 dark:text-white font-medium">
            €{remainingBudget.toFixed(2)} rimasti
          </span>
        </div>
        <ProgressBar progress={progress} />
      </div>

      {member.is_within_budget && member.streak_weeks > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-3 text-center"
        >
          <p className="text-xs text-green-700 dark:text-green-300 font-medium">
            {member.streak_weeks === 1 
              ? `🎉 Prima settimana di successo!`
              : `🎉 ${member.streak_weeks} settimane consecutive nel budget!`
            }
          </p>
        </motion.div>
      )}
    </motion.div>
  )
}