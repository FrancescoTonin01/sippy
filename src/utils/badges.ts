import type { UserStats } from '../api/users'

export interface BadgeDefinition {
  id: string
  title: string
  description: string
  icon: string
  category: 'drink_milestones' | 'spending' | 'social' | 'goals' | 'streaks' | 'time' | 'special' | 'seasonal'
  requirement: string | number
  checkUnlocked: (stats: UserStats, hasObjective: boolean) => boolean
}

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  // === DRINK MILESTONES ===
  {
    id: 'first_drink',
    title: 'Prima volta',
    description: 'Il tuo primo drink registrato',
    icon: '🍻',
    category: 'drink_milestones',
    requirement: '1 drink',
    checkUnlocked: (stats) => stats.totalDrinks >= 1
  },
  {
    id: 'social_drinker',
    title: 'Bevitore sociale',
    description: 'Hai registrato 10 drink',
    icon: '🎉',
    category: 'drink_milestones',
    requirement: '10 drinks',
    checkUnlocked: (stats) => stats.totalDrinks >= 10
  },
  {
    id: 'experienced',
    title: 'Esperto',
    description: 'Hai registrato 50 drink',
    icon: '🏆',
    category: 'drink_milestones',
    requirement: '50 drinks',
    checkUnlocked: (stats) => stats.totalDrinks >= 50
  },
  {
    id: 'legend',
    title: 'Leggenda',
    description: 'Hai registrato 100 drink',
    icon: '🌟',
    category: 'drink_milestones',
    requirement: '100 drinks',
    checkUnlocked: (stats) => stats.totalDrinks >= 100
  },
  {
    id: 'master',
    title: 'Gran Maestro',
    description: 'Hai registrato 250 drink',
    icon: '👑',
    category: 'drink_milestones',
    requirement: '250 drinks',
    checkUnlocked: (stats) => stats.totalDrinks >= 250
  },
  {
    id: 'unstoppable_drinker',
    title: 'Inarrestabile',
    description: 'Hai registrato 500 drink',
    icon: '⚡',
    category: 'drink_milestones',
    requirement: '500 drinks',
    checkUnlocked: (stats) => stats.totalDrinks >= 500
  },

  // === SPENDING & BUDGET ===
  {
    id: 'budget_conscious',
    title: 'Attento al budget',
    description: 'Media sotto €5 a drink',
    icon: '💡',
    category: 'spending',
    requirement: 'Media <€5/drink',
    checkUnlocked: (stats) => stats.averageCostPerDrink < 5 && stats.totalDrinks >= 5
  },
  {
    id: 'penny_pincher',
    title: 'Risparmiatore',
    description: 'Media sotto €3 a drink',
    icon: '🪙',
    category: 'spending',
    requirement: 'Media <€3/drink',
    checkUnlocked: (stats) => stats.averageCostPerDrink < 3 && stats.totalDrinks >= 10
  },
  {
    id: 'big_spender',
    title: 'Grande spendaccione',
    description: 'Hai speso più di €100 totali',
    icon: '💰',
    category: 'spending',
    requirement: '€100 spesi',
    checkUnlocked: (stats) => stats.totalSpent >= 100
  },
  {
    id: 'premium_taste',
    title: 'Gusti raffinati',
    description: 'Media sopra €15 a drink',
    icon: '🥂',
    category: 'spending',
    requirement: 'Media >€15/drink',
    checkUnlocked: (stats) => stats.averageCostPerDrink > 15 && stats.totalDrinks >= 10
  },
  {
    id: 'luxury_lifestyle',
    title: 'Lifestyle di lusso',
    description: 'Hai speso più di €500 totali',
    icon: '💎',
    category: 'spending',
    requirement: '€500 spesi',
    checkUnlocked: (stats) => stats.totalSpent >= 500
  },
  {
    id: 'champagne_taste',
    title: 'Gusti da champagne',
    description: 'Media sopra €25 a drink',
    icon: '🍾',
    category: 'spending',
    requirement: 'Media >€25/drink',
    checkUnlocked: (stats) => stats.averageCostPerDrink > 25 && stats.totalDrinks >= 20
  },

  // === SOCIAL & GROUPS ===
  {
    id: 'team_player',
    title: 'Giocatore di squadra',
    description: 'Ti sei unito al tuo primo gruppo',
    icon: '👥',
    category: 'social',
    requirement: '1 gruppo',
    checkUnlocked: (stats) => stats.groupsCount >= 1
  },
  {
    id: 'social_butterfly',
    title: 'Farfalla sociale',
    description: 'Sei membro di 3 o più gruppi',
    icon: '🦋',
    category: 'social',
    requirement: '3 gruppi',
    checkUnlocked: (stats) => stats.groupsCount >= 3
  },
  {
    id: 'party_animal',
    title: 'Animale da festa',
    description: 'Sei membro di 5 o più gruppi',
    icon: '🎊',
    category: 'social',
    requirement: '5 gruppi',
    checkUnlocked: (stats) => stats.groupsCount >= 5
  },
  {
    id: 'networking_king',
    title: 'Re del networking',
    description: 'Sei membro di 10 o più gruppi',
    icon: '🤴',
    category: 'social',
    requirement: '10 gruppi',
    checkUnlocked: (stats) => stats.groupsCount >= 10
  },

  // === WEEKLY GOALS ===
  {
    id: 'goal_setter',
    title: 'Obiettivi chiari',
    description: 'Hai impostato il tuo primo obiettivo',
    icon: '🎯',
    category: 'goals',
    requirement: 'Imposta obiettivo',
    checkUnlocked: (_stats, hasObjective) => hasObjective
  },
  {
    id: 'goal_achiever',
    title: 'Raggiungitore obiettivi',
    description: 'Hai rispettato l\'obiettivo settimanale',
    icon: '✅',
    category: 'goals',
    requirement: '1 settimana in budget',
    checkUnlocked: (stats) => stats.achievedWeeklyGoals >= 1
  },
  {
    id: 'consistent_saver',
    title: 'Risparmiatore costante',
    description: 'Hai rispettato l\'obiettivo per 5 settimane',
    icon: '💎',
    category: 'goals',
    requirement: '5 settimane in budget',
    checkUnlocked: (stats) => stats.achievedWeeklyGoals >= 5
  },
  {
    id: 'budget_master',
    title: 'Maestro del budget',
    description: 'Hai rispettato l\'obiettivo per 10 settimane',
    icon: '👑',
    category: 'goals',
    requirement: '10 settimane in budget',
    checkUnlocked: (stats) => stats.achievedWeeklyGoals >= 10
  },
  {
    id: 'discipline_warrior',
    title: 'Guerriero della disciplina',
    description: 'Hai rispettato l\'obiettivo per 20 settimane',
    icon: '⚔️',
    category: 'goals',
    requirement: '20 settimane in budget',
    checkUnlocked: (stats) => stats.achievedWeeklyGoals >= 20
  },

  // === STREAKS ===
  {
    id: 'streak_starter',
    title: 'Inizio streak',
    description: 'Prima settimana di streak consecutivo',
    icon: '🔥',
    category: 'streaks',
    requirement: '1 settimana di streak',
    checkUnlocked: (stats) => stats.maxStreakWeeks >= 1
  },
  {
    id: 'on_fire',
    title: 'In fiamme',
    description: '3 settimane consecutive in budget',
    icon: '🔥🔥',
    category: 'streaks',
    requirement: '3 settimane consecutive',
    checkUnlocked: (stats) => stats.maxStreakWeeks >= 3
  },
  {
    id: 'unstoppable',
    title: 'Inarrestabile',
    description: '5 settimane consecutive in budget',
    icon: '🔥🔥🔥',
    category: 'streaks',
    requirement: '5 settimane consecutive',
    checkUnlocked: (stats) => stats.maxStreakWeeks >= 5
  },
  {
    id: 'legendary_streak',
    title: 'Streak leggendario',
    description: '10 settimane consecutive in budget',
    icon: '⚡',
    category: 'streaks',
    requirement: '10 settimane consecutive',
    checkUnlocked: (stats) => stats.maxStreakWeeks >= 10
  },
  {
    id: 'current_champion',
    title: 'Campione corrente',
    description: 'Attualmente in streak',
    icon: '🏃',
    category: 'streaks',
    requirement: 'Streak attivo',
    checkUnlocked: (stats) => stats.currentStreakWeeks >= 1
  },
  {
    id: 'month_warrior',
    title: 'Guerriero del mese',
    description: '4 settimane consecutive in budget',
    icon: '🗡️',
    category: 'streaks',
    requirement: '1 mese consecutivo',
    checkUnlocked: (stats) => stats.maxStreakWeeks >= 4
  },

  // === TIME-BASED ===
  {
    id: 'week_veteran',
    title: 'Una settimana completa',
    description: 'Sei nell\'app da 7 giorni',
    icon: '📅',
    category: 'time',
    requirement: '7 giorni',
    checkUnlocked: (stats) => stats.joinedDays >= 7
  },
  {
    id: 'month_veteran',
    title: 'Veterano del mese',
    description: 'Sei nell\'app da 30 giorni',
    icon: '🗓️',
    category: 'time',
    requirement: '30 giorni',
    checkUnlocked: (stats) => stats.joinedDays >= 30
  },
  {
    id: 'quarter_veteran',
    title: 'Veterano trimestrale',
    description: 'Sei nell\'app da 90 giorni',
    icon: '📆',
    category: 'time',
    requirement: '90 giorni',
    checkUnlocked: (stats) => stats.joinedDays >= 90
  },
  {
    id: 'year_veteran',
    title: 'Veterano dell\'anno',
    description: 'Sei nell\'app da 365 giorni',
    icon: '🎂',
    category: 'time',
    requirement: '1 anno',
    checkUnlocked: (stats) => stats.joinedDays >= 365
  },

  // === SPECIAL ACHIEVEMENTS ===
  {
    id: 'busy_week',
    title: 'Settimana intensa',
    description: 'Più di 7 drink in una settimana',
    icon: '🌪️',
    category: 'special',
    requirement: '7+ drink/settimana',
    checkUnlocked: (stats) => stats.weeklyDrinks > 7
  },
  {
    id: 'weekend_warrior',
    title: 'Guerriero del weekend',
    description: 'Attivo durante il fine settimana',
    icon: '⚔️',
    category: 'special',
    requirement: 'Drinks nel weekend',
    checkUnlocked: (stats) => stats.totalDrinks >= 5 // Semplificato per ora
  },
  {
    id: 'variety_lover',
    title: 'Amante della varietà',
    description: 'Hai provato molti tipi diversi',
    icon: '🌈',
    category: 'special',
    requirement: 'Varietà di drinks',
    checkUnlocked: (stats) => stats.totalDrinks >= 25
  },
  {
    id: 'explorer',
    title: 'Esploratore',
    description: 'Hai bevuto in molti posti diversi',
    icon: '🗺️',
    category: 'special',
    requirement: 'Posti diversi',
    checkUnlocked: (stats) => stats.totalDrinks >= 30
  },
  {
    id: 'loyal_tracker',
    title: 'Tracker fedele',
    description: 'Registri costantemente i tuoi drink',
    icon: '📊',
    category: 'special',
    requirement: 'Uso costante app',
    checkUnlocked: (stats) => stats.totalDrinks >= 20 && stats.joinedDays >= 14
  },

  // === SEASONAL ===
  {
    id: 'summer_vibes',
    title: 'Vibes estive',
    description: 'Attivo durante l\'estate',
    icon: '☀️',
    category: 'seasonal',
    requirement: 'Drinks in estate',
    checkUnlocked: (stats) => stats.totalDrinks >= 10 // Semplificato
  },
  {
    id: 'winter_warmer',
    title: 'Scaldacuore invernale',
    description: 'Drinks caldi in inverno',
    icon: '🔥',
    category: 'seasonal',
    requirement: 'Drinks invernali',
    checkUnlocked: (stats) => stats.totalDrinks >= 15 // Semplificato
  },
  {
    id: 'new_year_starter',
    title: 'Nuovo anno, nuovi obiettivi',
    description: 'Hai iniziato l\'anno con determinazione',
    icon: '🎊',
    category: 'seasonal',
    requirement: 'Attività a gennaio',
    checkUnlocked: (stats) => stats.totalDrinks >= 5 // Semplificato
  }
]

export const getUserBadges = (stats: UserStats, hasObjective: boolean = false) => {
  return BADGE_DEFINITIONS.map(badge => ({
    ...badge,
    unlocked: badge.checkUnlocked(stats, hasObjective)
  }))
}

export const getBadgesByCategory = (stats: UserStats, hasObjective: boolean = false) => {
  const badges = getUserBadges(stats, hasObjective)
  
  const categories = {
    drink_milestones: badges.filter(b => b.category === 'drink_milestones'),
    spending: badges.filter(b => b.category === 'spending'),
    social: badges.filter(b => b.category === 'social'),
    goals: badges.filter(b => b.category === 'goals'),
    streaks: badges.filter(b => b.category === 'streaks'),
    time: badges.filter(b => b.category === 'time'),
    special: badges.filter(b => b.category === 'special'),
    seasonal: badges.filter(b => b.category === 'seasonal')
  }

  return categories
}

export const getCategoryDisplayName = (category: string): string => {
  const names: Record<string, string> = {
    drink_milestones: '🍻 Milestone Drinks',
    spending: '💰 Budget & Spesa',
    social: '👥 Social & Gruppi',
    goals: '🎯 Obiettivi',
    streaks: '🔥 Streak',
    time: '⏰ Tempo',
    special: '⭐ Speciali',
    seasonal: '🌟 Stagionali'
  }
  
  return names[category] || category
}