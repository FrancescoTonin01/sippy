import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'
import { getDrinks } from '../api/drinks'
import { getUserObjective } from '../api/objectives'
import { Badge } from '../components/Badge'
import type { Objective } from '../api/objectives'

export const Achievements = () => {
  const { user } = useAuth()
  const [totalDrinks, setTotalDrinks] = useState(0)
  const [objective, setObjective] = useState<Objective | null>(null)
  const [loading, setLoading] = useState(true)

  const loadAchievementData = useCallback(async () => {
    if (!user) return

    try {
      const [drinksResult, objectiveResult] = await Promise.all([
        getDrinks(user.id),
        getUserObjective(user.id)
      ])

      if (drinksResult.data) {
        setTotalDrinks(drinksResult.data.length)
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

  const badges = [
    {
      id: 'first-drink',
      title: 'Primo Sorso',
      description: 'Registra il tuo primo drink',
      icon: '🥃',
      unlocked: totalDrinks >= 1,
      requirement: 1
    },
    {
      id: 'ten-drinks',
      title: 'Decina Dorata',
      description: 'Registra 10 drink in totale',
      icon: '🏆',
      unlocked: totalDrinks >= 10,
      requirement: 10
    },
    {
      id: 'fifty-drinks',
      title: 'Mezzo Secolo',
      description: 'Registra 50 drink in totale',
      icon: '🎉',
      unlocked: totalDrinks >= 50,
      requirement: 50
    },
    {
      id: 'hundred-drinks',
      title: 'Centuria',
      description: 'Registra 100 drink in totale',
      icon: '💯',
      unlocked: totalDrinks >= 100,
      requirement: 100
    },
    {
      id: 'goal-setter',
      title: 'Obiettivi Chiari',
      description: 'Imposta il tuo primo obiettivo settimanale',
      icon: '🎯',
      unlocked: !!objective,
      requirement: 'Imposta obiettivo'
    }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento achievements...</p>
        </div>
      </div>
    )
  }

  const unlockedBadges = badges.filter(badge => badge.unlocked)
  const lockedBadges = badges.filter(badge => !badge.unlocked)

  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-20">
      <div className="max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-6"
        >
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            🏅 I tuoi Achievement
          </h1>
          
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-teal-600">{totalDrinks}</div>
              <div className="text-sm text-gray-600">Drink totali</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{unlockedBadges.length}</div>
              <div className="text-sm text-gray-600">Badge sbloccati</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">{objective?.weekly_goal || '-'}</div>
              <div className="text-sm text-gray-600">Obiettivo settimanale</div>
            </div>
          </div>
        </motion.div>

        {unlockedBadges.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-lg p-6 mb-6"
          >
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Badge Sbloccati ✨
            </h2>
            
            <div className="space-y-3">
              {unlockedBadges.map((badge, index) => (
                <Badge
                  key={badge.id}
                  badge={badge}
                  delay={index * 0.1}
                />
              ))}
            </div>
          </motion.div>
        )}

        {lockedBadges.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Da Sbloccare 🔒
            </h2>
            
            <div className="space-y-3">
              {lockedBadges.map((badge, index) => (
                <Badge
                  key={badge.id}
                  badge={badge}
                  delay={index * 0.1}
                />
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}