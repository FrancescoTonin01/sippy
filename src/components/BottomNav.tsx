import { NavLink } from 'react-router-dom'

export const BottomNav = () => {

  const navItems = [
    {
      path: '/dashboard',
      icon: '🍺',
      activeIcon: '🍻',
      label: 'Tracker'
    },
    {
      path: '/groups',
      icon: '👥',
      activeIcon: '🔥',
      label: 'Squad'
    },
    {
      path: '/achievements',
      icon: '🏆',
      activeIcon: '⭐',
      label: 'Trofei'
    },
    {
      path: '/profile',
      icon: '👤',
      activeIcon: '😎',
      label: 'Profilo'
    }
  ]


  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-t border-gray-100 dark:border-gray-700 px-4 py-2 shadow-lg">
      <div className="max-w-md mx-auto">
        <div className="flex justify-around items-center">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex flex-col items-center py-2 px-3 rounded-2xl transition-all duration-200
                ${isActive 
                  ? 'text-teal-600 dark:text-teal-400 bg-gradient-to-br from-teal-50 to-orange-50 dark:from-teal-900/30 dark:to-orange-900/30 shadow-sm scale-105' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                }
              `}
            >
              {({ isActive }) => (
                <>
                  <span className="text-xl mb-1 transition-transform duration-200">
                    {isActive ? item.activeIcon : item.icon}
                  </span>
                  <span className="text-xs font-semibold">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  )
}