import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './useAuth'
import { getUserObjective, createObjective, updateObjective } from '../api/objectives'
import type { Objective, CreateObjectiveData } from '../api/objectives'

export const useObjectives = () => {
  const { user } = useAuth()
  const [objective, setObjective] = useState<Objective | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchObjective = useCallback(async () => {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      const { data, error: fetchError } = await getUserObjective(user.id)
      
      if (fetchError && fetchError.code !== 'PGRST116') {
        setError(fetchError.message)
      } else {
        setObjective(data)
      }
    } catch {
      setError('Errore nel caricamento dell\'obiettivo')
    } finally {
      setLoading(false)
    }
  }, [user])

  const setWeeklyBudget = async (weeklyBudget: number) => {
    if (!user) return { success: false, error: 'Utente non autenticato' }

    try {
      const objectiveData: CreateObjectiveData = { weekly_budget: weeklyBudget }
      
      if (objective) {
        const { data, error: updateError } = await updateObjective(objective.id, objectiveData)
        
        if (updateError) {
          return { success: false, error: updateError.message }
        }
        
        setObjective(data)
      } else {
        const { data, error: createError } = await createObjective(user.id, objectiveData)
        
        if (createError) {
          return { success: false, error: createError.message }
        }
        
        setObjective(data)
      }

      return { success: true }
    } catch {
      return { success: false, error: 'Errore nell\'impostazione dell\'obiettivo' }
    }
  }

  useEffect(() => {
    if (user) {
      fetchObjective()
    }
  }, [user, fetchObjective])

  return {
    objective,
    loading,
    error,
    fetchObjective,
    setWeeklyBudget
  }
}