export const getStartOfWeek = (date: Date = new Date()): Date => {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day
  return new Date(d.setDate(diff))
}

export const getEndOfWeek = (date: Date = new Date()): Date => {
  const startOfWeek = getStartOfWeek(date)
  return new Date(startOfWeek.setDate(startOfWeek.getDate() + 6))
}

export const formatDate = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('it-IT', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  })
}

export const formatDateTimeFromUTC = (utcDateString: string): string => {
  // Se la stringa finisce con 'Z', è già UTC
  // Se no, aggiungiamo 'Z' per forzare l'interpretazione UTC
  const normalizedString = utcDateString.endsWith('Z') ? utcDateString : utcDateString + 'Z'
  const utcDate = new Date(normalizedString)
  
  return utcDate.toLocaleString('it-IT', {
    timeZone: 'Europe/Rome',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export const formatDateFromUTC = (utcDateString: string): string => {
  // Se la stringa finisce con 'Z', è già UTC
  // Se no, aggiungiamo 'Z' per forzare l'interpretazione UTC
  const normalizedString = utcDateString.endsWith('Z') ? utcDateString : utcDateString + 'Z'
  const utcDate = new Date(normalizedString)
  
  return utcDate.toLocaleDateString('it-IT', {
    timeZone: 'Europe/Rome',
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  })
}

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount)
}

export const isToday = (date: string | Date): boolean => {
  const d = typeof date === 'string' ? new Date(date) : date
  const today = new Date()
  return d.toDateString() === today.toDateString()
}

export const isThisWeek = (date: string | Date): boolean => {
  const d = typeof date === 'string' ? new Date(date) : date
  const startOfWeek = getStartOfWeek()
  const endOfWeek = getEndOfWeek()
  return d >= startOfWeek && d <= endOfWeek
}