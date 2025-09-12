import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './useAuth'
import { getGroups, createGroup, getGroupMembers, searchUsers, inviteToGroup, removeFromGroup } from '../api/groups'
import type { Group, CreateGroupData, Member } from '../api/groups'

export const useGroups = () => {
  const { user } = useAuth()
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchGroups = useCallback(async () => {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      const { data, error: fetchError } = await getGroups(user.id)
      
      if (fetchError) {
        setError(fetchError.message)
      } else {
        setGroups(data || [])
      }
    } catch {
      setError('Errore nel caricamento dei gruppi')
    } finally {
      setLoading(false)
    }
  }, [user])

  const addGroup = async (groupData: CreateGroupData) => {
    if (!user) return { success: false, error: 'Utente non autenticato' }

    try {
      const { data, error: createError } = await createGroup(user.id, groupData)
      
      if (createError) {
        return { success: false, error: createError.message }
      }

      if (data) {
        setGroups([data, ...groups])
      }

      return { success: true, data }
    } catch {
      return { success: false, error: 'Errore nella creazione del gruppo' }
    }
  }

  useEffect(() => {
    if (user) {
      fetchGroups()
    }
  }, [user, fetchGroups])

  return {
    groups,
    loading,
    error,
    fetchGroups,
    addGroup
  }
}

export const useGroupMembers = (groupId: string) => {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchMembers = useCallback(async () => {
    if (!groupId) return

    setLoading(true)
    setError(null)

    try {
      const { data, error: fetchError } = await getGroupMembers(groupId)
      
      if (fetchError) {
        setError(fetchError.message)
      } else {
        setMembers(data || [])
      }
    } catch {
      setError('Errore nel caricamento dei membri')
    } finally {
      setLoading(false)
    }
  }, [groupId])

  const inviteMember = async (userId: string) => {
    try {
      const { data, error: inviteError } = await inviteToGroup(groupId, userId)
      
      if (inviteError) {
        return { success: false, error: inviteError.message }
      }

      // Refresh members list
      await fetchMembers()
      return { success: true, data }
    } catch {
      return { success: false, error: 'Errore nell\'invito' }
    }
  }

  const removeMember = async (userId: string, requesterId: string) => {
    try {
      const { error: removeError } = await removeFromGroup(groupId, userId, requesterId)
      
      if (removeError) {
        return { success: false, error: removeError.message }
      }

      // Update local state
      setMembers(members.filter(member => member.id !== userId))
      return { success: true }
    } catch {
      return { success: false, error: 'Errore nella rimozione' }
    }
  }

  useEffect(() => {
    fetchMembers()
  }, [groupId, fetchMembers])

  return {
    members,
    loading,
    error,
    fetchMembers,
    inviteMember,
    removeMember
  }
}

export const useUserSearch = () => {
  const [users, setUsers] = useState<Member[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const search = async (query: string) => {
    setLoading(true)
    setError(null)

    try {
      const { data, error: searchError } = await searchUsers(query)
      
      if (searchError) {
        setError(searchError.message)
      } else {
        setUsers(data || [])
      }
    } catch {
      setError('Errore nella ricerca')
    } finally {
      setLoading(false)
    }
  }

  return {
    users,
    loading,
    error,
    search
  }
}