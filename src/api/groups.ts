import { supabase } from '../utils/supabase'

export interface Group {
  id: string
  name: string
  owner_id: string
  weekly_budget?: number
  created_at: string
}

export interface CreateGroupData {
  name: string
  weekly_budget?: number
}

export interface Member {
  id: string
  username: string
}

export const getGroups = async (userId: string) => {
  const { data, error } = await supabase
    .from('group_members')
    .select(`
      groups (
        id,
        name,
        owner_id,
        weekly_budget,
        created_at
      )
    `)
    .eq('user_id', userId)

  const groups = data?.map((item: { groups: Group | Group[] }) => 
    Array.isArray(item.groups) ? item.groups[0] : item.groups
  ).filter(Boolean) || []
  return { data: groups, error }
}

export const createGroup = async (userId: string, groupData: CreateGroupData) => {
  const { data: group, error: groupError } = await supabase
    .from('groups')
    .insert({
      name: groupData.name,
      owner_id: userId,
      weekly_budget: groupData.weekly_budget
    })
    .select()
    .single()

  if (groupError) {
    return { data: null, error: groupError }
  }

  const { error: memberError } = await supabase
    .from('group_members')
    .insert({
      group_id: group.id,
      user_id: userId
    })

  return { data: group, error: memberError }
}

export const joinGroup = async (userId: string, groupId: string) => {
  const { data, error } = await supabase
    .from('group_members')
    .insert({
      group_id: groupId,
      user_id: userId
    })
    .select()

  return { data, error }
}

export const leaveGroup = async (userId: string, groupId: string) => {
  const { data: group, error: groupError } = await supabase
    .from('groups')
    .select('owner_id')
    .eq('id', groupId)
    .single()

  if (groupError) {
    return { error: groupError }
  }

  // If the leaving user is the owner, we need to transfer ownership
  if (group.owner_id === userId) {
    // Get the oldest member who is not the current owner
    const { data: members, error: membersError } = await supabase
      .from('group_members')
      .select('user_id, created_at')
      .eq('group_id', groupId)
      .neq('user_id', userId)
      .order('created_at', { ascending: true })
      .limit(1)

    if (membersError) {
      return { error: membersError }
    }

    if (members && members.length > 0) {
      // Transfer ownership to the oldest member
      const { error: updateError } = await supabase
        .from('groups')
        .update({ owner_id: members[0].user_id })
        .eq('id', groupId)

      if (updateError) {
        return { error: updateError }
      }
    }
    // If no other members exist, the group will be deleted when the last member leaves
  }

  // Remove the user from the group
  const { error } = await supabase
    .from('group_members')
    .delete()
    .eq('group_id', groupId)
    .eq('user_id', userId)

  return { error }
}

export const deleteGroup = async (userId: string, groupId: string) => {
  // First check if the user is the owner
  const { data: group, error: groupError } = await supabase
    .from('groups')
    .select('owner_id')
    .eq('id', groupId)
    .single()

  if (groupError) {
    return { error: groupError }
  }

  if (group.owner_id !== userId) {
    return { error: { message: 'Solo il proprietario può eliminare il gruppo' } }
  }

  // Delete all group members first (due to foreign key constraints)
  const { error: membersError } = await supabase
    .from('group_members')
    .delete()
    .eq('group_id', groupId)

  if (membersError) {
    return { error: membersError }
  }

  // Delete all drinks associated with this group
  const { error: drinksError } = await supabase
    .from('drinks')
    .delete()
    .eq('group_id', groupId)

  if (drinksError) {
    return { error: drinksError }
  }

  // Finally delete the group
  const { error: deleteError } = await supabase
    .from('groups')
    .delete()
    .eq('id', groupId)

  return { error: deleteError }
}

export const getGroupMembers = async (groupId: string): Promise<{ data: Member[] | null, error: Error | null }> => {
  const { data, error } = await supabase
    .from('group_members')
    .select(`
      users!inner (
        id,
        username
      )
    `)
    .eq('group_id', groupId)

  if (error) {
    return { data: null, error }
  }

  if (!data) {
    return { data: [], error: null }
  }

  // Handling the case where users might be an array or single object
  const members: Member[] = data.map((item: { users: Member | Member[] }) => {
    if (Array.isArray(item.users)) {
      return item.users[0] // Take first user if it's an array
    }
    return item.users
  }).filter(Boolean)

  return { data: members, error: null }
}

export const searchUsers = async (query: string, excludeUserId?: string) => {
  if (!query.trim() || query.length < 2) {
    return { data: [], error: null }
  }

  let queryBuilder = supabase
    .from('users')
    .select('id, username')
    .ilike('username', `%${query}%`)

  if (excludeUserId) {
    queryBuilder = queryBuilder.neq('id', excludeUserId)
  }

  const { data, error } = await queryBuilder.limit(10)

  return { data: data || [], error }
}

export const inviteToGroup = async (groupId: string, userId: string) => {
  try {
    // Check if user is already a member
    const { data: existing, error: checkError } = await supabase
      .from('group_members')
      .select('user_id')
      .eq('group_id', groupId)
      .eq('user_id', userId)
      .maybeSingle() // Non fallisce se non trova risultati

    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 = no rows found, che va bene
      return { data: null, error: checkError }
    }

    if (existing) {
      return { data: null, error: { message: 'Utente già nel gruppo' } }
    }

    return joinGroup(userId, groupId)
  } catch (err) {
    console.error('Error in inviteToGroup:', err)
    return { data: null, error: { message: 'Errore nell\'invito' } }
  }
}

export const removeFromGroup = async (groupId: string, userId: string, requesterId: string) => {
  // Check if requester is the group owner
  const { data: group } = await supabase
    .from('groups')
    .select('owner_id')
    .eq('id', groupId)
    .single()

  if (!group || group.owner_id !== requesterId) {
    return { error: { message: 'Solo il proprietario può rimuovere membri' } }
  }

  return leaveGroup(userId, groupId)
}

export const updateGroupBudget = async (groupId: string, weeklyBudget: number, requesterId: string) => {
  // Check if requester is the group owner
  const { data: group } = await supabase
    .from('groups')
    .select('owner_id')
    .eq('id', groupId)
    .single()

  if (!group || group.owner_id !== requesterId) {
    return { error: { message: 'Solo il proprietario può modificare il budget' } }
  }

  const { data, error } = await supabase
    .from('groups')
    .update({ weekly_budget: weeklyBudget })
    .eq('id', groupId)
    .select()
    .single()

  return { data, error }
}

export interface GroupMemberProgress {
  user_id: string
  username: string
  weekly_spent: number
  drinks_count: number
  is_within_budget: boolean
  streak_weeks: number
}

interface UserData {
  id: string
  username: string
}



export const getGroupMembersProgress = async (groupId: string): Promise<{ data: GroupMemberProgress[] | null, error: Error | null }> => {
  try {
    // Get group budget first
    const { data: group, error: groupError } = await supabase
      .from('groups')
      .select('weekly_budget')
      .eq('id', groupId)
      .single()

    if (groupError || !group) {
      return { data: null, error: groupError }
    }

    const groupBudget = group.weekly_budget || 0

    // Get current week dates
    const now = new Date()
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()))
    const endOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 6))
    const startDateStr = startOfWeek.toISOString().split('T')[0]
    const endDateStr = endOfWeek.toISOString().split('T')[0]

    // Get all members
    const { data: membersData, error: membersError } = await supabase
      .from('group_members')
      .select(`
        user_id,
        users!inner (
          id,
          username
        )
      `)
      .eq('group_id', groupId)

    if (membersError) {
      return { data: null, error: membersError }
    }

    if (!membersData || membersData.length === 0) {
      return { data: [], error: null }
    }

    // Get weekly drinks for all members in one query
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
      return { data: null, error: drinksError }
    }

    // Process the data to calculate progress for each member
    const memberProgress: GroupMemberProgress[] = membersData.map((item: { users: UserData | UserData[] }) => {
      const user = Array.isArray(item.users) ? item.users[0] : item.users
      const userDrinks = drinksData?.filter(drink => drink.user_id === user.id) || []
      const weeklySpent = userDrinks.reduce((sum, drink) => sum + drink.cost, 0)
      const drinksCount = userDrinks.length
      const isWithinBudget = groupBudget === 0 || weeklySpent <= groupBudget

      return {
        user_id: user.id,
        username: user.username,
        weekly_spent: weeklySpent,
        drinks_count: drinksCount,
        is_within_budget: isWithinBudget,
        streak_weeks: 0
      }
    })

    return { data: memberProgress, error: null }
  } catch (err) {
    console.error('Error in getGroupMembersProgress:', err)
    return { data: null, error: err as Error }
  }
}

export const calculateUserStreak = async (userId: string, groupId: string): Promise<number> => {
  try {
    // Get group budget
    const { data: group } = await supabase
      .from('groups')
      .select('weekly_budget')
      .eq('id', groupId)
      .single()

    if (!group) return 0

    const groupBudget = group.weekly_budget || 0
    if (groupBudget === 0) return 0

    let streakWeeks = 0
    const currentDate = new Date()

    // Check last 10 weeks
    for (let week = 0; week < 10; week++) {
      const weekStart = new Date(currentDate)
      weekStart.setDate(currentDate.getDate() - (week * 7) - currentDate.getDay())
      
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekStart.getDate() + 6)

      const startDateStr = weekStart.toISOString().split('T')[0]
      const endDateStr = weekEnd.toISOString().split('T')[0]

      const { data: weekDrinks } = await supabase
        .from('drinks')
        .select('cost')
        .eq('user_id', userId)
        .gte('date', startDateStr)
        .lte('date', endDateStr)

      const weeklySpent = weekDrinks?.reduce((sum, drink) => sum + drink.cost, 0) || 0

      if (weeklySpent <= groupBudget) {
        streakWeeks++
      } else {
        break
      }
    }

    return streakWeeks
  } catch (err) {
    console.error('Error calculating streak:', err)
    return 0
  }
}

export interface GroupDrink {
  id: string
  user_id: string
  username: string
  type: string
  cost: number
  date: string
  location: string
  created_at: string
}

export const getGroupRecentDrinks = async (groupId: string, limit: number = 10): Promise<{ data: GroupDrink[] | null, error: Error | null }> => {
  try {
    // Prima cerchiamo i membri del gruppo
    const { data: members, error: membersError } = await supabase
      .from('group_members')
      .select('user_id')
      .eq('group_id', groupId)

    if (membersError) {
      return { data: null, error: membersError }
    }

    if (!members || members.length === 0) {
      return { data: [], error: null }
    }

    const memberIds = members.map(m => m.user_id)

    // Poi prendiamo i drink di questi membri
    const { data, error } = await supabase
      .from('drinks')
      .select(`
        id,
        user_id,
        type,
        cost,
        date,
        location,
        created_at,
        users!inner (
          username
        )
      `)
      .in('user_id', memberIds)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      return { data: null, error }
    }

    if (!data) {
      return { data: [], error: null }
    }

    // Transform the data to match our interface
    const drinks: GroupDrink[] = data.map((item: {
      id: string;
      user_id: string;
      type: string;
      cost: number;
      date: string;
      location: string;
      created_at: string;
      users: { username: string } | { username: string }[];
    }) => ({
      id: item.id,
      user_id: item.user_id,
      username: Array.isArray(item.users) ? item.users[0].username : item.users.username,
      type: item.type,
      cost: item.cost,
      date: item.date,
      location: item.location,
      created_at: item.created_at
    }))

    return { data: drinks, error: null }
  } catch (err) {
    console.error('Error getting group recent drinks:', err)
    return { data: null, error: err as Error }
  }
}