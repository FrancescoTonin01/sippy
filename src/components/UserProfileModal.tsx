import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getUserStats, getUserRecentDrinks } from '../api/users'
import { getUserObjective } from '../api/objectives'
import { getUserBadges, getBadgesByCategory, getCategoryDisplayName } from '../utils/badges'
import { Badge } from './Badge'
import type { UserStats, UserDrink } from '../api/users'
import type { Objective } from '../api/objectives'

interface UserProfileModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string
  username: string
}

export const UserProfileModal = ({ isOpen, onClose, userId, username }: UserProfileModalProps) => {
  const [stats, setStats] = useState<UserStats | null>(null)
  const [objective, setObjective] = useState<Objective | null>(null)
  const [badges, setBadges] = useState<any[]>([])
  const [recentDrinks, setRecentDrinks] = useState<UserDrink[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'stats' | 'badges' | 'drinks'>('stats')

  useEffect(() => {
    if (isOpen && userId) {
      loadUserProfile()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, userId])

  const loadUserProfile = async () => {
    setLoading(true)
    try {
      const [statsResult, objectiveResult, drinksResult] = await Promise.all([
        getUserStats(userId),
        getUserObjective(userId),
        getUserRecentDrinks(userId, 5)
      ])

      if (statsResult.data) {
        setStats(statsResult.data)
        // Calculate badges using the new system
        const hasObjective = !!objectiveResult.data
        const userBadges = getUserBadges(statsResult.data, hasObjective)
        setBadges(userBadges)
      }
      
      if (objectiveResult.data) setObjective(objectiveResult.data)
      if (drinksResult.data) setRecentDrinks(drinksResult.data)
    } catch (error) {
      console.error('Error loading user profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setStats(null)
    setObjective(null)
    setBadges([])
    setRecentDrinks([])
    setActiveTab('stats')
    onClose()
  }

  const unlockedBadges = badges.filter(badge => badge.unlocked)
  const lockedBadges = badges.filter(badge => !badge.unlocked)
  const badgesByCategory = stats ? getBadgesByCategory(stats, !!objective) : null

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
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col">
              {/* Header */}
              <div className="bg-teal-600 text-white p-6 pb-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                      <span className="font-bold text-lg">
                        {username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">{username}</h2>
                      <p className="text-teal-100 text-sm">Profilo utente</p>
                    </div>
                  </div>
                  <button
                    onClick={handleClose}
                    className="text-white hover:bg-white hover:bg-opacity-20 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                  >
                    ✕
                  </button>
                </div>

                {/* Tab Navigation */}
                <div className="flex bg-white bg-opacity-20 rounded-lg p-1">
                  <button
                    onClick={() => setActiveTab('stats')}
                    className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                      activeTab === 'stats'
                        ? 'bg-white text-teal-600 shadow-sm'
                        : 'text-white hover:bg-white hover:bg-opacity-10'
                    }`}
                  >
                    📊 Statistiche
                  </button>
                  <button
                    onClick={() => setActiveTab('badges')}
                    className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                      activeTab === 'badges'
                        ? 'bg-white text-teal-600 shadow-sm'
                        : 'text-white hover:bg-white hover:bg-opacity-10'
                    }`}
                  >
                    🏆 Badge ({unlockedBadges.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('drinks')}
                    className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                      activeTab === 'drinks'
                        ? 'bg-white text-teal-600 shadow-sm'
                        : 'text-white hover:bg-white hover:bg-opacity-10'
                    }`}
                  >
                    🍻 Drinks
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6" style={{ minHeight: 0 }}>
                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Caricamento profilo...</p>
                  </div>
                ) : (
                  <>
                    {/* Stats Tab */}
                    {activeTab === 'stats' && stats && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                      >
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-gray-50 rounded-xl p-4">
                            <p className="text-2xl font-bold text-teal-600">{stats.totalDrinks}</p>
                            <p className="text-sm text-gray-600">Drink totali</p>
                          </div>
                          <div className="bg-gray-50 rounded-xl p-4">
                            <p className="text-2xl font-bold text-teal-600">€{stats.totalSpent.toFixed(2)}</p>
                            <p className="text-sm text-gray-600">Spesa totale</p>
                          </div>
                          <div className="bg-gray-50 rounded-xl p-4">
                            <p className="text-2xl font-bold text-orange-600">{stats.weeklyDrinks}</p>
                            <p className="text-sm text-gray-600">Questa settimana</p>
                          </div>
                          <div className="bg-gray-50 rounded-xl p-4">
                            <p className="text-2xl font-bold text-orange-600">€{stats.weeklySpent.toFixed(2)}</p>
                            <p className="text-sm text-gray-600">Spesa settimanale</p>
                          </div>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-lg font-semibold text-gray-800">€{stats.averageCostPerDrink.toFixed(2)}</p>
                              <p className="text-sm text-gray-600">Costo medio</p>
                            </div>
                            <div>
                              <p className="text-lg font-semibold text-gray-800">{stats.joinedDays}</p>
                              <p className="text-sm text-gray-600">Giorni nell'app</p>
                            </div>
                            <div>
                              <p className="text-lg font-semibold text-gray-800">{stats.groupsCount}</p>
                              <p className="text-sm text-gray-600">Gruppi</p>
                            </div>
                            <div>
                              <p className="text-lg font-semibold text-gray-800">{stats.achievedWeeklyGoals}</p>
                              <p className="text-sm text-gray-600">Obiettivi raggiunti</p>
                            </div>
                          </div>
                        </div>

                        {(stats.currentStreakWeeks > 0 || stats.maxStreakWeeks > 0) && (
                          <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4 border border-orange-200">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-2xl">🔥</span>
                                  <p className="text-lg font-semibold text-gray-800">
                                    {stats.currentStreakWeeks} settimane
                                  </p>
                                </div>
                                <p className="text-sm text-gray-600">Streak corrente</p>
                              </div>
                              <div className="text-right">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-2xl">⚡</span>
                                  <p className="text-lg font-semibold text-gray-800">
                                    {stats.maxStreakWeeks} settimane
                                  </p>
                                </div>
                                <p className="text-sm text-gray-600">Record streak</p>
                              </div>
                            </div>
                            {stats.currentStreakWeeks > 0 && (
                              <div className="mt-3 text-center">
                                <p className="text-sm text-orange-700 font-medium">
                                  🎉 In streak da {stats.currentStreakWeeks} settimana{stats.currentStreakWeeks !== 1 ? 'e' : ''}!
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </motion.div>
                    )}

                    {/* Badges Tab */}
                    {activeTab === 'badges' && badgesByCategory && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                      >
                        {/* Summary stats */}
                        <div className="bg-gradient-to-r from-teal-50 to-orange-50 rounded-xl p-4 border border-teal-200">
                          <div className="flex justify-between items-center">
                            <div className="text-center">
                              <p className="text-2xl font-bold text-teal-600">{unlockedBadges.length}</p>
                              <p className="text-sm text-gray-600">Sbloccati</p>
                            </div>
                            <div className="text-center">
                              <p className="text-2xl font-bold text-orange-600">{lockedBadges.length}</p>
                              <p className="text-sm text-gray-600">Da sbloccare</p>
                            </div>
                            <div className="text-center">
                              <p className="text-2xl font-bold text-gray-800">{badges.length}</p>
                              <p className="text-sm text-gray-600">Totali</p>
                            </div>
                          </div>
                        </div>

                        {/* Badge categories - with proper scrolling */}
                        <div className="space-y-6 max-h-[40vh] overflow-y-auto pr-2">
                          {Object.entries(badgesByCategory).map(([categoryKey, categoryBadges]) => {
                            const unlockedInCategory = categoryBadges.filter((b: any) => b.unlocked)
                            const lockedInCategory = categoryBadges.filter((b: any) => !b.unlocked)
                            
                            if (categoryBadges.length === 0) return null

                            return (
                              <div key={categoryKey} className="space-y-4">
                                <div className="sticky top-0 bg-white/90 backdrop-blur-sm py-2 -mx-2 px-2 border-b border-gray-100">
                                  <h3 className="font-semibold text-gray-800 flex items-center justify-between">
                                    {getCategoryDisplayName(categoryKey)}
                                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                      {unlockedInCategory.length}/{categoryBadges.length}
                                    </span>
                                  </h3>
                                </div>

                                {/* Unlocked badges in this category */}
                                {unlockedInCategory.length > 0 && (
                                  <div className="space-y-3">
                                    {unlockedInCategory.map((badge: any, index: number) => (
                                      <Badge key={badge.id} badge={badge} delay={index * 0.05} />
                                    ))}
                                  </div>
                                )}

                                {/* Locked badges in this category */}
                                {lockedInCategory.length > 0 && (
                                  <div className="space-y-3">
                                    {lockedInCategory.slice(0, 3).map((badge: any, index: number) => (
                                      <Badge key={badge.id} badge={badge} delay={index * 0.05} />
                                    ))}
                                    {lockedInCategory.length > 3 && (
                                      <div className="text-center py-2">
                                        <p className="text-sm text-gray-500">
                                          +{lockedInCategory.length - 3} altri badge da sbloccare
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>

                        {badges.length === 0 && (
                          <p className="text-gray-500 text-center py-8">
                            Nessun badge disponibile
                          </p>
                        )}
                      </motion.div>
                    )}

                    {/* Recent Drinks Tab */}
                    {activeTab === 'drinks' && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                      >
                        {recentDrinks.length > 0 ? (
                          recentDrinks.map((drink) => (
                            <div
                              key={drink.id}
                              className="bg-gray-50 rounded-xl p-4"
                            >
                              <div className="flex justify-between items-center">
                                <div>
                                  <p className="font-semibold text-gray-800">{drink.type}</p>
                                  <p className="text-sm text-gray-600">
                                    {new Date(drink.date).toLocaleDateString('it-IT')} • {drink.location}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="font-semibold text-teal-600">€{drink.cost.toFixed(2)}</p>
                                  <p className="text-xs text-gray-500">
                                    {new Date(drink.created_at).toLocaleTimeString('it-IT', {
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-500 text-center py-8">
                            Nessun drink registrato di recente
                          </p>
                        )}
                      </motion.div>
                    )}
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}