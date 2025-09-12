import { supabase } from '../utils/supabase'

export interface Objective {
  id: string
  user_id: string
  weekly_budget: number
  created_at: string
}

export interface CreateObjectiveData {
  weekly_budget: number
}

export const getUserObjective = async (userId: string) => {
  const { data, error } = await supabase
    .from('objectives')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle() // Non fallisce se non ci sono risultati

  return { data, error }
}

export const createObjective = async (userId: string, objectiveData: CreateObjectiveData) => {
  const { data, error } = await supabase
    .from('objectives')
    .insert({
      user_id: userId,
      ...objectiveData
    })
    .select()
    .single()

  return { data, error }
}

export const updateObjective = async (objectiveId: string, updates: CreateObjectiveData) => {
  const { data, error } = await supabase
    .from('objectives')
    .update(updates)
    .eq('id', objectiveId)
    .select()
    .single()

  return { data, error }
}