import { useState, useEffect } from 'react'
import { getAllUserDrinks } from '../api/drinks'
import type { Drink } from '../api/drinks'
import { useAuth } from './useAuth'

interface UserStats {
  totalSpent: number
  favoriteDrink: string
  mostFrequentLocation: string
  peakDrinkingDay: string
  totalDrinks: number
  averageWeeklyCost: number
}

export const useUserStats = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const calculateStats = (drinks: Drink[]): UserStats => {
    if (drinks.length === 0) {
      return {
        totalSpent: 0,
        favoriteDrink: 'Nessun drink registrato',
        mostFrequentLocation: 'Nessuna location registrata',
        peakDrinkingDay: 'Nessun dato disponibile',
        totalDrinks: 0,
        averageWeeklyCost: 0
      }
    }

    // Total spent
    const totalSpent = drinks.reduce((sum, drink) => sum + drink.cost, 0)

    // Favorite drink (most frequent type)
    const drinkTypeCounts = drinks.reduce((acc, drink) => {
      acc[drink.type] = (acc[drink.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const favoriteDrink = Object.entries(drinkTypeCounts)
      .sort(([, a], [, b]) => b - a)[0]?.[0] || 'Nessun drink registrato'

    // Most frequent location
    const locationCounts = drinks.reduce((acc, drink) => {
      acc[drink.location] = (acc[drink.location] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const mostFrequentLocation = Object.entries(locationCounts)
      .sort(([, a], [, b]) => b - a)[0]?.[0] || 'Nessuna location registrata'

    // Peak drinking day (day of week with most drinks)
    const dayNames = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato']
    const dayCounts = drinks.reduce((acc, drink) => {
      const dayOfWeek = new Date(drink.date).getDay()
      acc[dayOfWeek] = (acc[dayOfWeek] || 0) + 1
      return acc
    }, {} as Record<number, number>)

    const peakDayIndex = Object.entries(dayCounts)
      .sort(([, a], [, b]) => b - a)[0]?.[0]
    const peakDrinkingDay = peakDayIndex !== undefined 
      ? dayNames[parseInt(peakDayIndex)] 
      : 'Nessun dato disponibile'

    // Calculate average weekly cost
    const firstDrinkDate = new Date(drinks[drinks.length - 1]?.date)
    const lastDrinkDate = new Date(drinks[0]?.date)
    const weeksDiff = Math.max(1, Math.ceil((lastDrinkDate.getTime() - firstDrinkDate.getTime()) / (7 * 24 * 60 * 60 * 1000)))
    const averageWeeklyCost = totalSpent / weeksDiff

    return {
      totalSpent,
      favoriteDrink,
      mostFrequentLocation,
      peakDrinkingDay,
      totalDrinks: drinks.length,
      averageWeeklyCost
    }
  }

  useEffect(() => {
    const fetchStats = async () => {
      if (!user?.id) return

      setLoading(true)
      setError(null)

      try {
        const { data: drinks, error: drinksError } = await getAllUserDrinks(user.id)
        
        if (drinksError) {
          setError(drinksError.message)
          return
        }

        const calculatedStats = calculateStats(drinks || [])
        setStats(calculatedStats)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Errore nel caricamento statistiche')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [user?.id])

  return { stats, loading, error }
}