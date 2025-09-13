import { supabase } from '../utils/supabase'

export interface Drink {
  id: string
  user_id: string
  group_id?: string
  type: string
  cost: number
  date: string
  location: string
  created_at: string
}

export interface CreateDrinkData {
  type: string
  cost: number
  date: string
  location: string
  group_id?: string
}

export const getDrinks = async (userId: string, startDate?: string, endDate?: string) => {
  let query = supabase
    .from('drinks')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })

  if (startDate) {
    query = query.gte('date', startDate)
  }
  if (endDate) {
    query = query.lte('date', endDate)
  }

  const { data, error } = await query
  return { data, error }
}

export const createDrink = async (userId: string, drinkData: CreateDrinkData) => {
  const { data, error } = await supabase
    .from('drinks')
    .insert({
      user_id: userId,
      ...drinkData
    })
    .select()
    .single()

  return { data, error }
}

export const updateDrink = async (drinkId: string, updates: Partial<CreateDrinkData>) => {
  const { data, error } = await supabase
    .from('drinks')
    .update(updates)
    .eq('id', drinkId)
    .select()
    .single()

  return { data, error }
}

export const deleteDrink = async (drinkId: string) => {
  const { error } = await supabase
    .from('drinks')
    .delete()
    .eq('id', drinkId)

  return { error }
}

export const getWeeklyDrinks = async (userId: string) => {
  const now = new Date()
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - now.getDay())
  
  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 6)

  return getDrinks(
    userId,
    startOfWeek.toISOString().split('T')[0],
    endOfWeek.toISOString().split('T')[0]
  )
}

export const getAllUserDrinks = async (userId: string) => {
  return getDrinks(userId)
}