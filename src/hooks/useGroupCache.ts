import { useState, useRef } from 'react'

interface CacheEntry<T> {
  data: T
  timestamp: number
  expiry: number
}

export const useGroupCache = <T>(defaultValue: T, cacheTime: number = 60000) => {
  const [data, setData] = useState<T>(defaultValue)
  const cacheRef = useRef<CacheEntry<T> | null>(null)

  const getCachedData = (): T | null => {
    if (!cacheRef.current) return null
    
    const now = Date.now()
    if (now > cacheRef.current.expiry) {
      cacheRef.current = null
      return null
    }
    
    return cacheRef.current.data
  }

  const setCachedData = (newData: T) => {
    const now = Date.now()
    cacheRef.current = {
      data: newData,
      timestamp: now,
      expiry: now + cacheTime
    }
    setData(newData)
  }

  const isCacheValid = (): boolean => {
    if (!cacheRef.current) return false
    return Date.now() <= cacheRef.current.expiry
  }

  const invalidateCache = () => {
    cacheRef.current = null
  }

  return {
    data,
    getCachedData,
    setCachedData,
    isCacheValid,
    invalidateCache
  }
}