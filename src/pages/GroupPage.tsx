import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'
import { getGroupMembersProgress, updateGroupBudget, getGroupRecentDrinks } from '../api/groups'
import { getGroupLeaderboard } from '../api/functions'
import { UserProgressCard } from '../components/UserProgressCard'
import { Leaderboard } from '../components/Leaderboard'
import { GroupBudgetModal } from '../components/GroupBudgetModal'
import { GroupDrinkHistory } from '../components/GroupDrinkHistory'
import { UserProfileModal } from '../components/UserProfileModal'
import type { GroupMemberProgress, Group, GroupDrink } from '../api/groups'
import type { LeaderboardEntry } from '../api/functions'
import { supabase } from '../utils/supabase'

export const GroupPage = () => {
  const { groupId } = useParams()
  const { user } = useAuth()
  const [group, setGroup] = useState<Group | null>(null)
  const [membersProgress, setMembersProgress] = useState<GroupMemberProgress[]>([])
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [leaderboardError, setLeaderboardError] = useState<string | null>(null)
  const [recentDrinks, setRecentDrinks] = useState<GroupDrink[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [showBudgetModal, setShowBudgetModal] = useState(false)
  const [showUserProfile, setShowUserProfile] = useState(false)
  const [selectedUser, setSelectedUser] = useState<{ id: string; username: string } | null>(null)
  const [activeTab, setActiveTab] = useState<'progress' | 'leaderboard' | 'drinks'>('progress')
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  const loadGroupData = useCallback(async () => {
    if (!groupId || !user) return

    try {
      setLoading(true)
      
      // Get group info
      const { data: groupData } = await supabase
        .from('groups')
        .select('*')
        .eq('id', groupId)
        .single()

      if (groupData) {
        setGroup(groupData)
      }

      // Get members progress
      const { data: progressData } = await getGroupMembersProgress(groupId)
      
      if (progressData) {
        setMembersProgress(progressData)
      }

      // Get leaderboard for the toggle view
      setLeaderboardError(null)
      const { data: leaderboardData, error: leaderboardErr } = await getGroupLeaderboard(groupId)
      if (leaderboardErr) {
        setLeaderboardError('Errore nel caricamento della classifica')
        setLeaderboard([])
      } else if (leaderboardData) {
        setLeaderboard(leaderboardData)
      }

      // Get recent drinks
      const { data: drinksData } = await getGroupRecentDrinks(10)
      if (drinksData) {
        setRecentDrinks(drinksData)
      }

    } catch (error) {
      console.error('Error loading group data:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
      setLastUpdate(new Date())
    }
  }, [groupId, user])

  const handleUpdateBudget = async (newBudget: number) => {
    if (!user || !groupId || !group) {
      return { success: false, error: 'Dati mancanti' }
    }

    try {
      const result = await updateGroupBudget(groupId, newBudget, user.id)
      
      if (result.error) {
        return { success: false, error: result.error.message }
      }

      if (result.data) {
        setGroup(result.data)
        // Reload group data to refresh progress
        await loadGroupData()
      }

      return { success: true }
    } catch {
      return { success: false, error: 'Errore nel salvataggio' }
    }
  }

  useEffect(() => {
    loadGroupData()
  }, [loadGroupData])

  // Auto-refresh every 2 minutes when page is visible
  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        loadGroupData()
      }
    }, 120000)

    return () => clearInterval(interval)
  }, [loadGroupData])

  // Refresh when page becomes visible again
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadGroupData()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [loadGroupData])

  const handleManualRefresh = () => {
    setRefreshing(true)
    loadGroupData()
  }

  const handleUserClick = (userId: string, username: string) => {
    setSelectedUser({ id: userId, username })
    setShowUserProfile(true)
  }

  const handleCloseUserProfile = () => {
    setShowUserProfile(false)
    setSelectedUser(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento gruppo...</p>
        </div>
      </div>
    )
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Gruppo non trovato</p>
        </div>
      </div>
    )
  }

  const groupBudget = group.weekly_budget || 0
  const isOwner = group.owner_id === user?.id

  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-20">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-6"
        >
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold text-gray-800">
              {group.name}
            </h1>
            <div className="flex items-center gap-2">
              <button
                onClick={handleManualRefresh}
                disabled={refreshing}
                className="text-gray-600 hover:text-gray-700 text-sm hover:bg-gray-50 p-2 rounded-lg transition-colors disabled:opacity-50"
                title="Aggiorna dati"
              >
                <span className={`text-lg ${refreshing ? 'animate-spin' : ''}`}>
                  🔄
                </span>
              </button>
              {isOwner && (
                <button
                  onClick={() => setShowBudgetModal(true)}
                  className="text-teal-600 hover:text-teal-700 text-sm font-medium hover:bg-teal-50 px-3 py-1 rounded-lg transition-colors"
                >
                  ⚙️ Obiettivo
                </button>
              )}
            </div>
          </div>
          <div className="mb-4">
            <p className="text-gray-600 mb-1">
              {groupBudget > 0 
                ? `Obiettivo settimanale: €${groupBudget.toFixed(2)}`
                : 'Nessun obiettivo impostato'
              }
            </p>
            {lastUpdate && (
              <p className="text-xs text-gray-500">
                Ultimo aggiornamento: {lastUpdate.toLocaleTimeString('it-IT', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </p>
            )}
          </div>

          {/* Tab Navigation */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('progress')}
              className={`flex-1 py-2 px-2 rounded-md text-xs font-medium transition-colors ${
                activeTab === 'progress'
                  ? 'bg-white text-teal-600 shadow-sm'
                  : 'text-gray-600'
              }`}
            >
              📊 Progresso
            </button>
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`flex-1 py-2 px-2 rounded-md text-xs font-medium transition-colors ${
                activeTab === 'leaderboard'
                  ? 'bg-white text-teal-600 shadow-sm'
                  : 'text-gray-600'
              }`}
            >
              🏆 Classifica
            </button>
            <button
              onClick={() => setActiveTab('drinks')}
              className={`flex-1 py-2 px-2 rounded-md text-xs font-medium transition-colors ${
                activeTab === 'drinks'
                  ? 'bg-white text-teal-600 shadow-sm'
                  : 'text-gray-600'
              }`}
            >
              🍻 Attività
            </button>
          </div>
        </motion.div>

        {/* Content */}
        {activeTab === 'leaderboard' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">
                🏆 Classifica Settimanale
              </h2>
              {refreshing && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-teal-600"></div>
              )}
            </div>
            
            {leaderboardError ? (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                <p className="text-red-800 font-medium">❌ {leaderboardError}</p>
                <button 
                  onClick={handleManualRefresh}
                  className="text-red-600 hover:text-red-700 text-sm font-medium mt-2 hover:underline"
                >
                  Riprova
                </button>
              </div>
            ) : (
              <Leaderboard data={leaderboard} currentUserId={user?.id} />
            )}
          </motion.div>
        )}

        {activeTab === 'progress' && (
          <div className="space-y-4">
            {groupBudget === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center"
              >
                <p className="text-yellow-800 font-medium">
                  ⚠️ Nessun obiettivo gruppo impostato
                </p>
                <p className="text-yellow-700 text-sm mt-1">
                  Il proprietario del gruppo deve impostare un budget settimanale
                </p>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center"
              >
                <p className="text-blue-800 font-medium">
                  🎯 Obiettivo gruppo: €{groupBudget.toFixed(2)} a settimana
                </p>
                <p className="text-blue-700 text-sm mt-1">
                  Mantieniti sotto questo limite per rimanere in streak! 🔥
                </p>
              </motion.div>
            )}
            
            {membersProgress.map((member) => (
              <UserProgressCard
                key={member.user_id}
                member={member}
                groupBudget={groupBudget}
                isCurrentUser={member.user_id === user?.id}
                onClick={handleUserClick}
              />
            ))}
          </div>
        )}

        {activeTab === 'drinks' && (
          <GroupDrinkHistory 
            drinks={recentDrinks}
            loading={loading}
            currentUserId={user?.id}
          />
        )}
      </div>

      <GroupBudgetModal
        isOpen={showBudgetModal}
        onClose={() => setShowBudgetModal(false)}
        onSubmit={handleUpdateBudget}
        currentBudget={groupBudget}
        groupName={group.name}
      />

      {selectedUser && (
        <UserProfileModal
          isOpen={showUserProfile}
          onClose={handleCloseUserProfile}
          userId={selectedUser.id}
          username={selectedUser.username}
        />
      )}
    </div>
  )
}