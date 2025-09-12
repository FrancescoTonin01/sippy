import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './useAuth'
import { getDrinks, getWeeklyDrinks, createDrink } from '../api/drinks'
import type { Drink, CreateDrinkData } from '../api/drinks'

export const useDrinks = () => {
  const { user } = useAuth()
  const [drinks, setDrinks] = useState<Drink[]>([])
  const [weeklyDrinks, setWeeklyDrinks] = useState<Drink[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchDrinks = async () => {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      const { data, error: fetchError } = await getDrinks(user.id)
      
      if (fetchError) {
        setError(fetchError.message)
      } else {
        setDrinks(data || [])
      }
    } catch {
      setError('Errore nel caricamento dei drink')
    } finally {
      setLoading(false)
    }
  }

  const fetchWeeklyDrinks = useCallback(async () => {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      const { data, error: fetchError } = await getWeeklyDrinks(user.id)
      
      if (fetchError) {
        setError(fetchError.message)
      } else {
        setWeeklyDrinks(data || [])
      }
    } catch {
      setError('Errore nel caricamento dei drink settimanali')
    } finally {
      setLoading(false)
    }
  }, [user])

  const addDrink = async (drinkData: CreateDrinkData) => {
    if (!user) return { success: false, error: 'Utente non autenticato' }

    try {
      const { data, error: createError } = await createDrink(user.id, drinkData)
      
      if (createError) {
        return { success: false, error: createError.message }
      }

      if (data) {
        setDrinks([data, ...drinks])
        
        const drinkDate = new Date(data.date)
        const now = new Date()
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()))
        
        if (drinkDate >= startOfWeek) {
          setWeeklyDrinks([data, ...weeklyDrinks])
        }
      }

      return { success: true, data }
    } catch {
      return { success: false, error: 'Errore nella creazione del drink' }
    }
  }

  useEffect(() => {
    if (user) {
      fetchWeeklyDrinks()
    }
  }, [user, fetchWeeklyDrinks])

  return {
    drinks,
    weeklyDrinks,
    loading,
    error,
    fetchDrinks,
    fetchWeeklyDrinks,
    addDrink
  }
}