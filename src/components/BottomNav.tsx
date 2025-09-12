import { NavLink } from 'react-router-dom'

export const BottomNav = () => {

  const navItems = [
    {
      path: '/dashboard',
      icon: '🏠',
      label: 'Home'
    },
    {
      path: '/groups',
      icon: '👥',
      label: 'Gruppi'
    },
    {
      path: '/achievements',
      icon: '🏅',
      label: 'Badge'
    },
    {
      path: '/profile',
      icon: '👤',
      label: 'Profilo'
    }
  ]


  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
      <div className="max-w-md mx-auto">
        <div className="flex justify-around items-center">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex flex-col items-center py-2 px-3 rounded-lg transition-colors
                ${isActive 
                  ? 'text-teal-600 bg-teal-50' 
                  : 'text-gray-600 hover:text-teal-600'
                }
              `}
            >
              <span className="text-xl mb-1">{item.icon}</span>
              <span className="text-xs font-medium">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  )
}