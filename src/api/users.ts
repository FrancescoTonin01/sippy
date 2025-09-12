import { supabase } from '../utils/supabase'

export interface UserStats {
  totalDrinks: number
  totalSpent: number
  weeklyDrinks: number
  weeklySpent: number
  averageCostPerDrink: number
  joinedDays: number
  groupsCount: number
  maxStreakWeeks: number
  currentStreakWeeks: number
  achievedWeeklyGoals: number
}


export interface UserDrink {
  id: string
  type: string
  cost: number
  date: string
  location: string
  created_at: string
}

export const getUserStats = async (userId: string): Promise<{ data: UserStats | null, error: Error | null }> => {
  try {
    // Get user registration date
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('created_at')
      .eq('id', userId)
      .single()

    if (userError) {
      return { data: null, error: userError }
    }

    // Calculate joined days
    const joinedDate = new Date(userData.created_at)
    const now = new Date()
    const joinedDays = Math.floor((now.getTime() - joinedDate.getTime()) / (1000 * 60 * 60 * 24))

    // Get user groups count
    const { data: userGroups } = await supabase
      .from('group_members')
      .select('group_id')
      .eq('user_id', userId)

    const groupsCount = userGroups?.length || 0

    // Get all user drinks
    const { data: allDrinks, error: drinksError } = await supabase
      .from('drinks')
      .select('cost, date, group_id')
      .eq('user_id', userId)

    if (drinksError) {
      return { data: null, error: drinksError }
    }

    // Get current week dates
    const startOfWeek = new Date()
    const endOfWeek = new Date()
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
    endOfWeek.setDate(endOfWeek.getDate() - endOfWeek.getDay() + 6)
    const startDateStr = startOfWeek.toISOString().split('T')[0]
    const endDateStr = endOfWeek.toISOString().split('T')[0]

    // Calculate basic stats
    const totalDrinks = allDrinks?.length || 0
    const totalSpent = allDrinks?.reduce((sum, drink) => sum + drink.cost, 0) || 0
    
    const weeklyDrinksData = allDrinks?.filter(drink => 
      drink.date >= startDateStr && drink.date <= endDateStr
    ) || []
    const weeklyDrinks = weeklyDrinksData.length
    const weeklySpent = weeklyDrinksData.reduce((sum, drink) => sum + drink.cost, 0)

    const averageCostPerDrink = totalDrinks > 0 ? totalSpent / totalDrinks : 0

    // Calculate streak data
    let maxStreakWeeks = 0
    let currentStreakWeeks = 0
    let achievedWeeklyGoals = 0

    // Get all groups with budgets for this user
    const { data: groupsWithBudgets } = await supabase
      .from('group_members')
      .select(`
        group_id,
        groups!inner (
          weekly_budget
        )
      `)
      .eq('user_id', userId)
      .not('groups.weekly_budget', 'is', null)

    if (groupsWithBudgets && groupsWithBudgets.length > 0) {
      // Calculate streak for the group with the highest budget (most challenging)
      const groupBudgets = groupsWithBudgets.map((item: any) => ({
        groupId: item.group_id,
        budget: item.groups?.weekly_budget || 0
      }))
      
      const highestBudgetGroup = groupBudgets.reduce((max, group) => 
        group.budget > max.budget ? group : max
      )

      // Calculate weekly achievements for the past 20 weeks
      let tempCurrentStreak = 0
      let tempMaxStreak = 0
      let tempAchievedGoals = 0

      for (let week = 0; week < 20; week++) {
        const weekStart = new Date()
        weekStart.setDate(weekStart.getDate() - (week * 7) - weekStart.getDay())
        
        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekStart.getDate() + 6)

        const weekStartStr = weekStart.toISOString().split('T')[0]
        const weekEndStr = weekEnd.toISOString().split('T')[0]

        const weekSpending = allDrinks
          ?.filter(drink => 
            drink.date >= weekStartStr && 
            drink.date <= weekEndStr && 
            drink.group_id === highestBudgetGroup.groupId
          )
          ?.reduce((sum, drink) => sum + drink.cost, 0) || 0

        const achievedGoal = weekSpending <= highestBudgetGroup.budget

        if (achievedGoal) {
          tempAchievedGoals++
          if (week === 0) {
            tempCurrentStreak++
          } else if (tempCurrentStreak === week) {
            tempCurrentStreak++
          }
          
          tempMaxStreak = Math.max(tempMaxStreak, tempCurrentStreak)
        } else {
          if (week === 0) {
            tempCurrentStreak = 0
          }
        }
      }

      achievedWeeklyGoals = tempAchievedGoals
      currentStreakWeeks = tempCurrentStreak
      maxStreakWeeks = tempMaxStreak
    }

    const stats: UserStats = {
      totalDrinks,
      totalSpent,
      weeklyDrinks,
      weeklySpent,
      averageCostPerDrink,
      joinedDays,
      groupsCount,
      maxStreakWeeks,
      currentStreakWeeks,
      achievedWeeklyGoals
    }

    return { data: stats, error: null }
  } catch (err) {
    console.error('Error getting user stats:', err)
    return { data: null, error: err as Error }
  }
}


export const getUserRecentDrinks = async (userId: string, limit: number = 5): Promise<{ data: UserDrink[] | null, error: Error | null }> => {
  try {
    const { data, error } = await supabase
      .from('drinks')
      .select('id, type, cost, date, location, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      return { data: null, error }
    }

    return { data: data || [], error: null }
  } catch (err) {
    console.error('Error getting user recent drinks:', err)
    return { data: null, error: err as Error }
  }
}