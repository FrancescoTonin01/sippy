import { motion } from 'framer-motion'

interface ProgressBarProps {
  progress: number
  className?: string
}

export const ProgressBar = ({ progress, className = '' }: ProgressBarProps) => {
  const clampedProgress = Math.min(Math.max(progress, 0), 100)
  
  const getProgressColor = () => {
    if (clampedProgress > 70) return 'bg-green-500'
    if (clampedProgress > 30) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const getProgressEmoji = () => {
    if (clampedProgress > 70) return '😊'
    if (clampedProgress > 30) return '😐'
    if (clampedProgress > 0) return '😰'
    return '💸'
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex justify-between items-center">
        <span className="text-2xl">{getProgressEmoji()}</span>
        <span className="text-sm font-medium text-gray-600">
          {clampedProgress.toFixed(0)}%
        </span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-3">
        <motion.div
          className={`h-3 rounded-full transition-colors duration-300 ${getProgressColor()}`}
          initial={{ width: 0 }}
          animate={{ width: `${clampedProgress}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
      
      {clampedProgress <= 0 && (
        <motion.p
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-sm text-red-600 font-medium text-center"
        >
          Budget esaurito! 💸
        </motion.p>
      )}
    </div>
  )
}