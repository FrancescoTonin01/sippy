import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'
import { useGroups } from '../hooks/useGroups'
import { CreateGroupModal } from '../components/CreateGroupModal'
import { InviteUserModal } from '../components/InviteUserModal'
import { inviteToGroup } from '../api/groups'
import { useGroupMembers } from '../hooks/useGroups'
import type { CreateGroupData } from '../api/groups'

export const Groups = () => {
  const { user } = useAuth()
  const { groups, loading, addGroup } = useGroups()
  const navigate = useNavigate()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)
  const [showInviteModal, setShowInviteModal] = useState(false)

  const handleCreateGroup = async (data: CreateGroupData) => {
    const result = await addGroup(data)
    return result
  }

  const handleInviteUser = async (userId: string) => {
    if (!selectedGroupId) return { success: false, error: 'Gruppo non selezionato' }
    
    try {
      const { data, error } = await inviteToGroup(selectedGroupId, userId)
      
      if (error) {
        return { success: false, error: error.message }
      }
      
      return { success: true, data }
    } catch (err) {
      console.error('Invite error:', err)
      return { success: false, error: 'Errore nell\'invito' }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Caricamento gruppi...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 pb-20">
      <div className="max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="text-4xl mb-2">🍻</div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Sippy Squad</h1>
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-6">
            I tuoi gruppi di sfida • Bevi responsabilmente, competi intelligentemente
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-teal-600 to-teal-700 text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 mx-auto"
          >
            <span className="text-lg">🚀</span>
            Crea nuovo squad
          </motion.button>
        </motion.div>

        {groups.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-orange-50 to-teal-50 rounded-3xl shadow-lg p-8 text-center border border-orange-100"
          >
            <div className="text-6xl mb-4">🏁</div>
            <h2 className="text-xl font-bold text-gray-800 mb-3">
              Pronto per la sfida?
            </h2>
            <p className="text-gray-600 mb-2 leading-relaxed">
              🎯 Monitora i tuoi consumi con gli amici
            </p>
            <p className="text-gray-600 mb-2 leading-relaxed">
              🏆 Competi in classifiche settimanali
            </p>
            <p className="text-gray-600 mb-6 leading-relaxed">
              🔥 Mantieni streak di consumo responsabile
            </p>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 mb-6">
              <p className="text-sm text-gray-700 font-medium">
                💡 <strong>Primo squad?</strong> Invita 2-3 amici e iniziate a tracciare insieme!
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-orange-500 to-teal-600 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:shadow-xl transition-all duration-200 text-lg"
            >
              🚀 Iniziamo!
            </motion.button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {groups.map((group, index) => (
              <GroupCard
                key={group.id}
                group={group}
                isOwner={group.owner_id === user?.id}
                onInvite={() => {
                  setSelectedGroupId(group.id)
                  setShowInviteModal(true)
                }}
                onClick={() => navigate(`/group/${group.id}`)}
                delay={index * 0.1}
              />
            ))}
          </div>
        )}
      </div>

      <CreateGroupModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateGroup}
      />

      <InviteUserModal
        isOpen={showInviteModal}
        onClose={() => {
          setShowInviteModal(false)
          setSelectedGroupId(null)
        }}
        onInvite={handleInviteUser}
      />
    </div>
  )
}

interface GroupCardProps {
  group: {
    id: string
    name: string
    owner_id: string
    weekly_budget?: number
  }
  isOwner: boolean
  onInvite: () => void
  onClick: () => void
  delay: number
}

const GroupCard = ({ group, isOwner, onInvite, onClick, delay }: GroupCardProps) => {
  const { members, loading } = useGroupMembers(group.id)

  const handleInviteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onInvite()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-3xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-600 hover:border-teal-200 dark:hover:border-teal-400"
      onClick={onClick}
      whileHover={{ y: -2 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="text-2xl">🍻</div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-white">{group.name}</h3>
        </div>
        {isOwner && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleInviteClick}
            className="bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300 hover:bg-teal-200 dark:hover:bg-teal-800 text-xs font-semibold px-3 py-1 rounded-full transition-colors"
          >
            <span className="mr-1">➕</span>Invita
          </motion.button>
        )}
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center text-sm">
          <span className="text-lg mr-2">{isOwner ? '👑' : '🤝'}</span>
          <span className={`font-medium ${isOwner ? 'text-yellow-600 dark:text-yellow-400' : 'text-teal-600 dark:text-teal-400'}`}>
            {isOwner ? 'Squad Leader' : 'Squad Member'}
          </span>
        </div>
        {group.weekly_budget && (
          <div className="text-xs text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30 px-3 py-1 rounded-full font-semibold">
            🎯 €{group.weekly_budget}/week
          </div>
        )}
      </div>

      <div className="bg-gray-50/70 dark:bg-gray-600/30 rounded-2xl p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <span>👥</span>
            Squad Members ({loading ? '...' : members.length})
          </p>
        </div>
        {loading ? (
          <div className="text-center py-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-teal-600 mx-auto"></div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {members.slice(0, 3).map((member) => (
              <div key={member.id} className="bg-white dark:bg-gray-700 px-3 py-1 rounded-full text-xs font-medium text-gray-700 dark:text-gray-300">
                {member.username}
              </div>
            ))}
            {members.length > 3 && (
              <div className="bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300 px-3 py-1 rounded-full text-xs font-medium">
                +{members.length - 3} altri
              </div>
            )}
          </div>
        )}
      </div>

      <div className="text-center">
        <div className="flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-2">
          <span>📊</span>
          <span>Tocca per vedere statistiche e classifiche</span>
        </div>
        <div className="flex justify-center gap-1">
          <div className="w-2 h-1 bg-teal-400 rounded-full"></div>
          <div className="w-2 h-1 bg-orange-400 rounded-full"></div>
          <div className="w-2 h-1 bg-teal-400 rounded-full"></div>
        </div>
      </div>
    </motion.div>
  )
}