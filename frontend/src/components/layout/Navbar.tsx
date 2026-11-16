import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Hash, Bell, Bookmark, User as UserIcon, Feather } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../ui/Avatar';
import { ThemeToggle } from '../ui/ThemeToggle';
import { cn } from '../../utils/cn';

export const MobileHeader: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between px-4 py-2.5 bg-surface/90 backdrop-blur-md border-b border-line md:hidden">
      <div
        className="cursor-pointer"
        onClick={() => {
          if (currentUser) {
            navigate(`/u/${currentUser.username}`);
          } else {
            navigate('/login');
          }
        }}
      >
        <Avatar src={currentUser?.avatar} alt={currentUser?.displayName || 'User'} size="sm" />
      </div>

      <div className="flex items-center space-x-1.5 cursor-pointer" onClick={() => navigate('/')}>
        <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center text-white">
          <Feather size={16} />
        </div>
        <span className="text-xl font-black text-ink">Chirpwell</span>
      </div>

      <ThemeToggle />
    </header>
  );
};

export const MobileBottomNav: React.FC = () => {
  const { currentUser } = useAuth();

  const navItems = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Explore', path: '/explore', icon: Hash },
    { label: 'Notifications', path: '/notifications', icon: Bell, badge: 2 },
    { label: 'Bookmarks', path: '/bookmarks', icon: Bookmark },
    { label: 'Profile', path: currentUser ? `/u/${currentUser.username}` : '/login', icon: UserIcon },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around py-2.5 bg-surface/95 backdrop-blur-md border-t border-line md:hidden">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            cn(
              'relative p-2 rounded-full transition-colors',
              isActive ? 'text-accent' : 'text-mute hover:text-ink'
            )
          }
          aria-label={item.label}
        >
          <item.icon size={24} />
          {item.badge !== undefined && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full ring-2 ring-surface" />
          )}
        </NavLink>
      ))}
    </nav>
  );
};
