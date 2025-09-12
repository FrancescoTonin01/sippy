import { supabase } from '../utils/supabase'

export interface LeaderboardEntry {
  user_id: string
  username: string
  drink_count: number
  total_cost: number
}

export const getGroupLeaderboard = async (groupId: string): Promise<{ data: LeaderboardEntry[] | null, error: Error | null }> => {
  try {
    // Try to call the edge function first
    const { data, error } = await supabase.functions.invoke('leaderboard', {
      body: { group_id: groupId }
    })

    if (error) {
      // If edge function fails, fallback to direct query
      return await getGroupLeaderboardFallback(groupId)
    }

    return { data: data.leaderboard || [], error: null }
  } catch (error) {
    console.error('Error calling leaderboard function:', error)
    // Fallback to direct query
    return await getGroupLeaderboardFallback(groupId)
  }
}

// Fallback function that queries the database directly
const getGroupLeaderboardFallback = async (groupId: string): Promise<{ data: LeaderboardEntry[] | null, error: Error | null }> => {
  try {
    // Get current week dates
    const now = new Date()
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()))
    const endOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 6))
    const startDateStr = startOfWeek.toISOString().split('T')[0]
    const endDateStr = endOfWeek.toISOString().split('T')[0]

    // Get group members with their weekly drinks
    const { data, error } = await supabase
      .from('group_members')
      .select(`
        user_id,
        users!inner (
          id,
          username
        )
      `)
      .eq('group_id', groupId)

    if (error) {
      return { data: null, error }
    }

    if (!data || data.length === 0) {
      return { data: [], error: null }
    }

    // Get weekly drinks for all members
    const memberIds = data.map((item: any) => 
      Array.isArray(item.users) ? item.users[0].id : item.users.id
    )

    const { data: drinks, error: drinksError } = await supabase
      .from('drinks')
      .select('user_id, cost')
      .in('user_id', memberIds)
      .gte('date', startDateStr)
      .lte('date', endDateStr)

    if (drinksError) {
      return { data: null, error: drinksError }
    }

    // Calculate leaderboard data
    const leaderboard: LeaderboardEntry[] = data.map((item: any) => {
      const user = Array.isArray(item.users) ? item.users[0] : item.users
      const userDrinks = drinks?.filter(drink => drink.user_id === user.id) || []
      
      return {
        user_id: user.id,
        username: user.username,
        drink_count: userDrinks.length,
        total_cost: userDrinks.reduce((sum, drink) => sum + drink.cost, 0)
      }
    })

    return { data: leaderboard, error: null }
  } catch (err) {
    console.error('Error in leaderboard fallback:', err)
    return { data: null, error: err as Error }
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