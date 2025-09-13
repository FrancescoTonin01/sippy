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
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-100 px-4 py-2 shadow-lg">
      <div className="max-w-md mx-auto">
        <div className="flex justify-around items-center">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex flex-col items-center py-2 px-3 rounded-2xl transition-all duration-200
                ${isActive 
                  ? 'text-teal-600 bg-gradient-to-br from-teal-50 to-orange-50 shadow-sm scale-105' 
                  : 'text-gray-600 hover:text-teal-600 hover:bg-gray-50'
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