import { supabase } from '../utils/supabase'

export interface LeaderboardEntry {
  user_id: string
  username: string
  drink_count: number
  total_cost: number
}

export const getGroupLeaderboard = async (groupId: string): Promise<{ data: LeaderboardEntry[] | null, error: Error | null }> => {
  try {
    const { data, error } = await supabase.functions.invoke('leaderboard', {
      body: { group_id: groupId }
    })

    if (error) {
      return { data: null, error }
    }

    return { data: data.leaderboard || [], error: null }
  } catch (error) {
    console.error('Error calling leaderboard function:', error)
    return { data: null, error: error as Error }
  }
}

export const getWeeklyStats = async (userId: string, groupId?: string) => {
  try {
    const { data, error } = await supabase.functions.invoke('weekly-stats', {
      body: { 
        user_id: userId,
        group_id: groupId 
      }
    })

    if (error) {
      return { data: null, error }
    }

    return { data: data.stats || null, error: null }
  } catch (error) {
    console.error('Error calling weekly-stats function:', error)
    return { data: null, error }
  }
}