import { motion } from 'framer-motion'
import type { Drink } from '../api/drinks'

interface WeeklyChartProps {
  weeklyDrinks: Drink[]
}

export const WeeklyChart = ({ weeklyDrinks }: WeeklyChartProps) => {
  const getDaysOfWeek = () => {
    const days = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab']
    const today = new Date()
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()))
    
    return days.map((day, index) => {
      const date = new Date(startOfWeek)
      date.setDate(startOfWeek.getDate() + index)
      return {
        name: day,
        date: date.toISOString().split('T')[0]
      }
    })
  }

  const getDrinksByDay = () => {
    const daysOfWeek = getDaysOfWeek()
    
    return daysOfWeek.map(day => {
      const dayDrinks = weeklyDrinks.filter(drink => drink.date === day.date)
      return {
        ...day,
        count: dayDrinks.length,
        drinks: dayDrinks
      }
    })
  }

  const chartData = getDrinksByDay()
  const maxCount = Math.max(...chartData.map(d => d.count), 1)

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        Drink per giorno
      </h2>
      
      <div className="flex items-end justify-between gap-2 h-32">
        {chartData.map((day, index) => (
          <motion.div
            key={day.date}
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            transition={{ delay: index * 0.1 }}
            className="flex-1 flex flex-col items-center gap-2"
          >
            <div className="w-full flex flex-col items-center gap-1">
              <motion.div
                initial={{ height: 0 }}
                animate={{ 
                  height: day.count > 0 ? `${(day.count / maxCount) * 80}px` : '4px'
                }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className={`w-full rounded-t-lg ${
                  day.count > 0 
                    ? 'bg-teal-500 shadow-sm' 
                    : 'bg-gray-200'
                }`}
              />
              {day.count > 0 && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.1 + 0.3 }}
                  className="text-xs font-semibold text-teal-600"
                >
                  {day.count}
                </motion.span>
              )}
            </div>
            
            <span className="text-xs text-gray-600 font-medium">
              {day.name}
            </span>
          </motion.div>
        ))}
      </div>
      
      {weeklyDrinks.length === 0 && (
        <p className="text-center text-gray-500 text-sm mt-4">
          Nessun drink registrato questa settimana
        </p>
      )}
    </div>
  )
}