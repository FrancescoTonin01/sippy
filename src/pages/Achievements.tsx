import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'
import { getUserStats } from '../api/users'
import { getUserObjective } from '../api/objectives'
import { getUserBadges, getBadgesByCategory, getCategoryDisplayName } from '../utils/badges'
import { Badge } from '../components/Badge'
import type { UserStats } from '../api/users'
import type { Objective } from '../api/objectives'

export const Achievements = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState<UserStats | null>(null)
  const [objective, setObjective] = useState<Objective | null>(null)
  const [badges, setBadges] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadAchievementData = useCallback(async () => {
    if (!user) return

    try {
      const [statsResult, objectiveResult] = await Promise.all([
        getUserStats(user.id),
        getUserObjective(user.id)
      ])

      if (statsResult.data) {
        setStats(statsResult.data)
        // Calculate badges using the new system
        const hasObjective = !!objectiveResult.data
        const userBadges = getUserBadges(statsResult.data, hasObjective)
        setBadges(userBadges)
      }

      if (objectiveResult.data) {
        setObjective(objectiveResult.data)
      }
    } catch (error) {
      console.error('Error loading achievements:', error)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    loadAchievementData()
  }, [loadAchievementData])

  const unlockedBadges = badges.filter(badge => badge.unlocked)
  const badgesByCategory = stats ? getBadgesByCategory(stats, !!objective) : null

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Caricamento achievements...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 pb-20">
      <div className="max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6"
        >
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            🏅 I tuoi Achievement
          </h1>
          
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-teal-600">{stats?.totalDrinks || 0}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Drink totali</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{unlockedBadges.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Badge sbloccati</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">{objective?.weekly_budget || '-'}€</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Spesa massima settimanale</div>
            </div>
          </div>

          {/* Additional stats */}
          {stats && (
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100 dark:border-gray-700">
              <div className="text-center">
                <div className="text-lg font-semibold text-teal-600">€{stats.totalSpent.toFixed(2)}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Spesa totale</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-orange-600">{stats.groupsCount}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Gruppi</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-green-600">{stats.achievedWeeklyGoals}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Obiettivi raggiunti</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-red-600">{stats.maxStreakWeeks}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Record streak</div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Badge categories */}
        {badgesByCategory && Object.entries(badgesByCategory).map(([categoryKey, categoryBadges], categoryIndex) => {
          const unlockedInCategory = categoryBadges.filter((b: any) => b.unlocked)
          const lockedInCategory = categoryBadges.filter((b: any) => !b.unlocked)
          
          if (categoryBadges.length === 0) return null

          return (
            <motion.div
              key={categoryKey}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + categoryIndex * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                  {getCategoryDisplayName(categoryKey)}
                </h2>
                <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                  {unlockedInCategory.length}/{categoryBadges.length}
                </span>
              </div>

              {/* Unlocked badges in this category */}
              {unlockedInCategory.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-green-700 dark:text-green-400 mb-3 flex items-center">
                    <span className="mr-2">✨</span>
                    Sbloccati ({unlockedInCategory.length})
                  </h3>
                  <div className="space-y-3">
                    {unlockedInCategory.map((badge: any, index: number) => (
                      <Badge key={badge.id} badge={badge} delay={index * 0.05} />
                    ))}
                  </div>
                </div>
              )}

              {/* Locked badges in this category */}
              {lockedInCategory.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-3 flex items-center">
                    <span className="mr-2">🔒</span>
                    Da sbloccare ({lockedInCategory.length})
                  </h3>
                  <div className="space-y-3">
                    {lockedInCategory.slice(0, 3).map((badge: any, index: number) => (
                      <Badge key={badge.id} badge={badge} delay={index * 0.05} />
                    ))}
                    {lockedInCategory.length > 3 && (
                      <div className="text-center py-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          +{lockedInCategory.length - 3} altri badge da sbloccare
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          Continua a raggiungere obiettivi per vederli tutti!
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )
        })}

        {badges.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center"
          >
            <div className="text-4xl mb-4">🏅</div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
              Nessun badge disponibile
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Inizia a registrare i tuoi drink per sbloccare i primi badge!
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}