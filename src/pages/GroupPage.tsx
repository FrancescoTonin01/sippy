import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'
import { useGroups } from '../hooks/useGroups'
import { updateGroupBudget, getGroupRecentDrinks } from '../api/groups'
import { getGroupCompleteData, type LeaderboardEntry } from '../api/groupsOptimized'
import { UserProgressCard } from '../components/UserProgressCard'
import { Leaderboard } from '../components/Leaderboard'
import { GroupBudgetModal } from '../components/GroupBudgetModal'
import { GroupDrinkHistory } from '../components/GroupDrinkHistory'
import { UserProfileModal } from '../components/UserProfileModal'
import { GroupHeaderSkeleton, UserProgressSkeleton, LeaderboardSkeleton, DrinkHistorySkeleton } from '../components/SkeletonLoader'
import type { GroupMemberProgress, Group, GroupDrink } from '../api/groups'

export const GroupPage = () => {
  const { groupId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const { leaveGroup, removeGroup } = useGroups()
  const [group, setGroup] = useState<Group | null>(null)
  const [membersProgress, setMembersProgress] = useState<GroupMemberProgress[]>([])
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [leaderboardError, setLeaderboardError] = useState<string | null>(null)
  const [recentDrinks, setRecentDrinks] = useState<GroupDrink[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [tabLoading] = useState<Record<string, boolean>>({})
  
  const [showBudgetModal, setShowBudgetModal] = useState(false)
  const [showUserProfile, setShowUserProfile] = useState(false)
  const [selectedUser, setSelectedUser] = useState<{ id: string; username: string } | null>(null)
  const [activeTab, setActiveTab] = useState<'progress' | 'leaderboard' | 'drinks'>('progress')
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  const loadGroupData = useCallback(async () => {
    if (!groupId || !user) return

    try {
      setLoading(true)
      
      // Super optimized: Get group, progress AND leaderboard in one call + drinks separately
      const [completeDataResult, drinksResult] = await Promise.allSettled([
        getGroupCompleteData(groupId),
        getGroupRecentDrinks(groupId, 10)
      ])

      // Handle complete group data (group info + progress + leaderboard)
      if (completeDataResult.status === 'fulfilled') {
        const { group: groupData, progress: progressData, leaderboard: leaderboardData, error } = completeDataResult.value
        if (!error && groupData) {
          setGroup(groupData)
          setMembersProgress(progressData)
          setLeaderboard(leaderboardData)
          setLeaderboardError(null)
        } else {
          setLeaderboardError('Errore nel caricamento dei dati gruppo')
        }
      } else {
        setLeaderboardError('Errore nel caricamento dei dati gruppo')
        setLeaderboard([])
      }

      // Handle recent drinks
      if (drinksResult.status === 'fulfilled') {
        const { data: drinksData } = drinksResult.value
        if (drinksData) {
          setRecentDrinks(drinksData)
        }
      }

    } catch (error) {
      console.error('Error loading group data:', error)
      setLeaderboardError('Errore nel caricamento')
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

  // Refresh less aggressively - every 5 minutes instead of 2
  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible' && !refreshing) {
        loadGroupData()
      }
    }, 300000) // 5 minutes instead of 2

    return () => clearInterval(interval)
  }, [loadGroupData, refreshing])

  // Only refresh on visibility change if data is older than 1 minute
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && lastUpdate) {
        const timeSinceUpdate = Date.now() - lastUpdate.getTime()
        if (timeSinceUpdate > 60000 && !refreshing) { // Only if more than 1 minute old
          loadGroupData()
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [loadGroupData, lastUpdate, refreshing])

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

  const handleLeaveGroup = async () => {
    if (!groupId || !group) return

    const isOwner = group.owner_id === user?.id
    let message = 'Sei sicuro di voler uscire da questo gruppo?'
    
    if (isOwner) {
      message = 'Sei il proprietario di questo gruppo. Se esci, la proprietà verrà trasferita al membro più anziano. Continuare?'
    }

    if (window.confirm(message)) {
      const result = await leaveGroup(groupId)
      if (result.success) {
        navigate('/groups')
      } else {
        alert(`Errore: ${result.error}`)
      }
    }
  }

  const handleDeleteGroup = async () => {
    if (!groupId || !group) return

    if (window.confirm('Sei sicuro di voler eliminare questo gruppo? Questa azione non può essere annullata e tutti i dati del gruppo verranno persi.')) {
      const result = await removeGroup(groupId)
      if (result.success) {
        navigate('/groups')
      } else {
        alert(`Errore: ${result.error}`)
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 pb-20">
        <div className="max-w-md mx-auto">
          <GroupHeaderSkeleton />
          <div className="space-y-4">
            <UserProgressSkeleton />
            <UserProgressSkeleton />
            <UserProgressSkeleton />
          </div>
        </div>
      </div>
    )
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-300">Gruppo non trovato</p>
        </div>
      </div>
    )
  }

  const groupBudget = group.weekly_budget || 0
  const isOwner = group.owner_id === user?.id

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 pb-20">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6"
        >
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              {group.name}
            </h1>
            <div className="flex items-center gap-2">
              <button
                onClick={handleManualRefresh}
                disabled={refreshing}
                className="text-gray-600 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-200 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded-lg transition-colors disabled:opacity-50"
                title="Aggiorna dati"
              >
                <span className={`text-lg ${refreshing ? 'animate-spin' : ''}`}>
                  🔄
                </span>
              </button>
              {isOwner ? (
                <>
                  <button
                    onClick={() => setShowBudgetModal(true)}
                    className="text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 text-sm font-medium hover:bg-teal-50 dark:hover:bg-teal-900 px-3 py-1 rounded-lg transition-colors"
                  >
                    ⚙️ Obiettivo
                  </button>
                  <button
                    onClick={handleDeleteGroup}
                    className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900 px-3 py-1 rounded-lg transition-colors"
                    title="Elimina gruppo"
                  >
                    🗑️ Elimina
                  </button>
                </>
              ) : (
                <button
                  onClick={handleLeaveGroup}
                  className="text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 text-sm font-medium hover:bg-orange-50 dark:hover:bg-orange-900 px-3 py-1 rounded-lg transition-colors"
                  title="Esci dal gruppo"
                >
                  🚪 Esci
                </button>
              )}
            </div>
          </div>
          <div className="mb-4">
            <p className="text-gray-600 dark:text-gray-300 mb-1">
              {groupBudget > 0 
                ? `Obiettivo settimanale: €${groupBudget.toFixed(2)}`
                : 'Nessun obiettivo impostato'
              }
            </p>
            {lastUpdate && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Ultimo aggiornamento: {lastUpdate.toLocaleTimeString('it-IT', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </p>
            )}
          </div>

          {/* Tab Navigation */}
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('progress')}
              className={`flex-1 py-2 px-2 rounded-md text-xs font-medium transition-colors ${
                activeTab === 'progress'
                  ? 'bg-white dark:bg-gray-800 text-teal-600 dark:text-teal-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              📊 Progresso
            </button>
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`flex-1 py-2 px-2 rounded-md text-xs font-medium transition-colors ${
                activeTab === 'leaderboard'
                  ? 'bg-white dark:bg-gray-800 text-teal-600 dark:text-teal-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              🏆 Classifica
            </button>
            <button
              onClick={() => setActiveTab('drinks')}
              className={`flex-1 py-2 px-2 rounded-md text-xs font-medium transition-colors ${
                activeTab === 'drinks'
                  ? 'bg-white dark:bg-gray-800 text-teal-600 dark:text-teal-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-300'
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
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                🏆 Classifica Settimanale
              </h2>
              {refreshing && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-teal-600"></div>
              )}
            </div>
            
            {tabLoading['leaderboard'] ? (
              <LeaderboardSkeleton />
            ) : leaderboardError ? (
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-xl p-4 text-center">
                <p className="text-red-800 dark:text-red-300 font-medium">❌ {leaderboardError}</p>
                <button 
                  onClick={handleManualRefresh}
                  className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm font-medium mt-2 hover:underline"
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
                className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-xl p-4 text-center"
              >
                <p className="text-yellow-800 dark:text-yellow-300 font-medium">
                  ⚠️ Nessun obiettivo gruppo impostato
                </p>
                <p className="text-yellow-700 dark:text-yellow-400 text-sm mt-1">
                  Il proprietario del gruppo deve impostare un budget settimanale
                </p>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-xl p-4 text-center"
              >
                <p className="text-blue-800 dark:text-blue-300 font-medium">
                  🎯 Obiettivo gruppo: €{groupBudget.toFixed(2)} a settimana
                </p>
                <p className="text-blue-700 dark:text-blue-400 text-sm mt-1">
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
          tabLoading['drinks'] ? (
            <DrinkHistorySkeleton />
          ) : (
            <GroupDrinkHistory 
              drinks={recentDrinks}
              loading={false}
              currentUserId={user?.id}
            />
          )
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