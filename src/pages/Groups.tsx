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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento gruppi...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-20">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">I tuoi gruppi</h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-teal-600 text-white p-2 rounded-lg hover:bg-teal-700 transition-colors"
          >
            <span className="text-xl">+</span>
          </button>
        </div>

        {groups.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg p-8 text-center"
          >
            <div className="text-4xl mb-4">👥</div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              Nessun gruppo
            </h2>
            <p className="text-gray-600 mb-6">
              Crea il tuo primo gruppo per sfidare gli amici!
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition-colors"
            >
              Crea gruppo
            </button>
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
      className="bg-white rounded-2xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-shadow"
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">{group.name}</h3>
        {isOwner && (
          <div className="flex space-x-2">
            <button
              onClick={handleInviteClick}
              className="text-teal-600 hover:text-teal-700 text-sm font-medium hover:bg-teal-50 px-2 py-1 rounded"
            >
              Invita
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center text-sm text-gray-600">
          <span className="text-lg mr-2">👑</span>
          <span>{isOwner ? 'Proprietario' : 'Membro'}</span>
        </div>
        {group.weekly_budget && (
          <div className="text-xs text-teal-600 bg-teal-50 px-2 py-1 rounded-full">
            €{group.weekly_budget}/settimana
          </div>
        )}
      </div>

      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">
          Membri ({loading ? '...' : members.length})
        </p>
        {loading ? (
          <div className="text-center py-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-teal-600 mx-auto"></div>
          </div>
        ) : (
          <div className="space-y-1">
            {members.slice(0, 3).map((member) => (
              <p key={member.id} className="text-sm text-gray-600">
                {member.username}
              </p>
            ))}
            {members.length > 3 && (
              <p className="text-sm text-gray-500">
                +{members.length - 3} altri
              </p>
            )}
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100 text-center">
        <p className="text-xs text-gray-500">
          Clicca per vedere i progressi del gruppo
        </p>
      </div>
    </motion.div>
  )
}