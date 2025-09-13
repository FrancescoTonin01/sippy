import { motion } from 'framer-motion'

interface SkeletonLoaderProps {
  className?: string
}

export const SkeletonLoader = ({ className }: SkeletonLoaderProps) => {
  return (
    <motion.div
      className={`bg-gray-200 animate-pulse rounded ${className}`}
      initial={{ opacity: 0.5 }}
      animate={{ opacity: 1 }}
      transition={{ 
        repeat: Infinity,
        repeatType: "reverse",
        duration: 0.8
      }}
    />
  )
}

export const GroupHeaderSkeleton = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg p-6 mb-6"
    >
      <div className="flex items-center justify-between mb-4">
        <SkeletonLoader className="h-8 w-48" />
        <SkeletonLoader className="h-8 w-24" />
      </div>
      <div className="mb-4 space-y-2">
        <SkeletonLoader className="h-4 w-64" />
        <SkeletonLoader className="h-3 w-32" />
      </div>
      <div className="flex bg-gray-100 rounded-lg p-1">
        <SkeletonLoader className="flex-1 h-8 mx-1" />
        <SkeletonLoader className="flex-1 h-8 mx-1" />
        <SkeletonLoader className="flex-1 h-8 mx-1" />
      </div>
    </motion.div>
  )
}

export const UserProgressSkeleton = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg p-6 mb-4"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <SkeletonLoader className="w-10 h-10 rounded-full" />
          <div>
            <SkeletonLoader className="h-4 w-24 mb-1" />
            <SkeletonLoader className="h-3 w-16" />
          </div>
        </div>
        <SkeletonLoader className="h-6 w-16 rounded-full" />
      </div>
      <div className="mb-3">
        <SkeletonLoader className="h-2 w-full rounded-full" />
      </div>
      <div className="flex justify-between text-sm">
        <SkeletonLoader className="h-4 w-20" />
        <SkeletonLoader className="h-4 w-16" />
      </div>
    </motion.div>
  )
}

export const LeaderboardSkeleton = () => {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4].map((i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="bg-gray-50 rounded-xl p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <SkeletonLoader className="w-8 h-8 rounded-full" />
              <div>
                <SkeletonLoader className="h-4 w-20 mb-1" />
                <SkeletonLoader className="h-3 w-16" />
              </div>
            </div>
            <div className="text-right">
              <SkeletonLoader className="h-4 w-12 mb-1" />
              <SkeletonLoader className="h-3 w-16" />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

export const DrinkHistorySkeleton = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg p-6"
    >
      <div className="mb-4">
        <SkeletonLoader className="h-6 w-40 mb-2" />
        <SkeletonLoader className="h-4 w-64" />
      </div>
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
          >
            <div className="flex items-center gap-3">
              <SkeletonLoader className="w-6 h-6 rounded" />
              <div>
                <SkeletonLoader className="h-4 w-16 mb-1" />
                <SkeletonLoader className="h-3 w-24" />
              </div>
            </div>
            <div className="text-right">
              <SkeletonLoader className="h-4 w-12 mb-1" />
              <SkeletonLoader className="h-3 w-16" />
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}