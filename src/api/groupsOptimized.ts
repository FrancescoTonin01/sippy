import { supabase } from '../utils/supabase'
import type { Group, GroupMemberProgress } from './groups'

export interface LeaderboardEntry {
  user_id: string
  username: string
  drink_count: number
  total_cost: number
}

interface UserData {
  id: string
  username: string
}

// Ultra-optimized single query that gets everything needed for GroupPage
export const getGroupCompleteData = async (groupId: string): Promise<{ 
  group: Group | null;
  progress: GroupMemberProgress[];
  leaderboard: LeaderboardEntry[];
  error: Error | null;
}> => {
  try {
    // Get current week dates
    const now = new Date()
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()))
    const endOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 6))
    const startDateStr = startOfWeek.toISOString().split('T')[0]
    const endDateStr = endOfWeek.toISOString().split('T')[0]

    // Get group info and members in parallel
    const [groupResult, membersResult] = await Promise.all([
      supabase
        .from('groups')
        .select('*')
        .eq('id', groupId)
        .single(),
      supabase
        .from('group_members')
        .select(`
          user_id,
          users!inner (
            id,
            username
          )
        `)
        .eq('group_id', groupId)
    ])

    const { data: group, error: groupError } = groupResult
    const { data: membersData, error: membersError } = membersResult

    if (groupError || !group) {
      return { group: null, progress: [], leaderboard: [], error: groupError }
    }

    if (membersError || !membersData) {
      return { group, progress: [], leaderboard: [], error: membersError }
    }

    if (membersData.length === 0) {
      return { group, progress: [], leaderboard: [], error: null }
    }

    const groupBudget = group.weekly_budget || 0

    // Get weekly drinks for all members
    const memberIds = membersData.map((item: { users: UserData | UserData[] }) => 
      Array.isArray(item.users) ? item.users[0].id : item.users.id
    )

    const { data: drinksData, error: drinksError } = await supabase
      .from('drinks')
      .select('user_id, cost')
      .in('user_id', memberIds)
      .gte('date', startDateStr)
      .lte('date', endDateStr)

    if (drinksError) {
      return { group, progress: [], leaderboard: [], error: drinksError }
    }

    // Process data to create both progress and leaderboard
    const progress: GroupMemberProgress[] = []
    const leaderboard: LeaderboardEntry[] = []
    
    membersData.forEach((item: { users: UserData | UserData[] }) => {
      const user = Array.isArray(item.users) ? item.users[0] : item.users
      const userDrinks = drinksData?.filter(drink => drink.user_id === user.id) || []
      const weeklySpent = userDrinks.reduce((sum, drink) => sum + drink.cost, 0)
      const drinksCount = userDrinks.length
      const isWithinBudget = groupBudget === 0 || weeklySpent <= groupBudget

      // Add to progress
      progress.push({
        user_id: user.id,
        username: user.username,
        weekly_spent: weeklySpent,
        drinks_count: drinksCount,
        is_within_budget: isWithinBudget,
        streak_weeks: 0 // TODO: Calculate streak if needed
      })
      
      // Add to leaderboard
      leaderboard.push({
        user_id: user.id,
        username: user.username,
        drink_count: drinksCount,
        total_cost: weeklySpent
      })
    })
    
    // Sort leaderboard by drink count descending, then by cost descending
    leaderboard.sort((a, b) => {
      if (b.drink_count !== a.drink_count) {
        return b.drink_count - a.drink_count
      }
      return b.total_cost - a.total_cost
    })

    return { group, progress, leaderboard, error: null }
  } catch (err) {
    console.error('Error in getGroupCompleteData:', err)
    return { group: null, progress: [], leaderboard: [], error: err as Error }
  }
}