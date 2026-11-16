import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Home,
  Hash,
  Bell,
  Bookmark,
  User as UserIcon,
  ShieldAlert,
  Settings,
  Feather,
  LogOut,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { ThemeToggle } from '../ui/ThemeToggle';
import { cn } from '../../utils/cn';

export interface SidebarProps {
  onOpenComposeModal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenComposeModal }) => {
  const { currentUser, logout, switchDemoUser } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Explore', path: '/explore', icon: Hash },
    { label: 'Notifications', path: '/notifications', icon: Bell, badge: 2 },
    { label: 'Bookmarks', path: '/bookmarks', icon: Bookmark },
    { label: 'Requests', path: '/requests', icon: UserCheck, badge: currentUser?.isPrivate ? 1 : undefined },
    { label: 'Profile', path: currentUser ? `/u/${currentUser.username}` : '/login', icon: UserIcon },
    ...(currentUser?.role === 'moderator'
      ? [{ label: 'Moderation', path: '/moderation', icon: ShieldAlert, highlight: true }]
      : []),
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-[260px] h-screen sticky top-0 flex flex-col justify-between py-5 px-4 border-r border-line bg-surface select-none hidden md:flex shrink-0">
      <div className="space-y-6">
        {/* Brand Logo & Theme Toggle */}
        <div className="flex items-center justify-between px-2">
          <div
            onClick={() => navigate('/')}
            className="flex items-center space-x-2.5 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-white shadow-md shadow-accent/20 group-hover:scale-105 transition-transform">
              <Feather size={22} className="text-white" />
            </div>
            <span className="text-2xl font-black tracking-tight text-ink">Chirpwell</span>
          </div>

          <ThemeToggle />
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex items-center justify-between px-3.5 py-3 rounded-full text-base font-semibold transition-all group',
                  isActive
                    ? 'bg-accentSoft text-accent'
                    : 'text-ink hover:bg-paper'
                )
              }
            >
              <div className="flex items-center space-x-4">
                <item.icon size={22} className="shrink-0" />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className="px-2 py-0.5 text-xs font-bold bg-accent text-white rounded-full">
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Post Button */}
        <div className="pt-2">
          <Button
            onClick={() => onOpenComposeModal ? onOpenComposeModal() : navigate('/')}
            className="w-full py-3 text-base shadow-md shadow-accent/20 font-bold"
          >
            Post
          </Button>
        </div>
      </div>

      {/* User Card & Demo Switcher Footer */}
      <div className="space-y-3 pt-4 border-t border-line">
        {/* Quick Demo Switcher */}
        <div className="bg-paper p-2.5 rounded-xl border border-line">
          <p className="text-[11px] font-bold text-mute uppercase tracking-wider mb-1.5 px-1">
            Demo Account Switcher
          </p>
          <div className="grid grid-cols-3 gap-1">
            <button
              onClick={() => switchDemoUser('sarah_tech')}
              className={cn(
                'px-1.5 py-1 text-[11px] font-semibold rounded truncate',
                currentUser?.username === 'sarah_tech' ? 'bg-accent text-white' : 'bg-surface text-ink hover:bg-slate-200'
              )}
              title="Sarah Connor (Eng Lead)"
            >
              Sarah
            </button>
            <button
              onClick={() => switchDemoUser('alex_dev')}
              className={cn(
                'px-1.5 py-1 text-[11px] font-semibold rounded truncate',
                currentUser?.username === 'alex_dev' ? 'bg-accent text-white' : 'bg-surface text-ink hover:bg-slate-200'
              )}
              title="Alex (Private Account)"
            >
              Alex (Priv)
            </button>
            <button
              onClick={() => switchDemoUser('moderator_admin')}
              className={cn(
                'px-1.5 py-1 text-[11px] font-semibold rounded truncate',
                currentUser?.username === 'moderator_admin' ? 'bg-accent text-white' : 'bg-surface text-ink hover:bg-slate-200'
              )}
              title="Moderator Admin"
            >
              Mod
            </button>
          </div>
        </div>

        {/* User Card or Sign In / Sign Up CTA */}
        {currentUser ? (
          <div className="flex items-center justify-between p-2 rounded-xl hover:bg-paper transition-colors group">
            <div
              className="flex items-center space-x-3 cursor-pointer overflow-hidden"
              onClick={() => navigate(`/u/${currentUser.username}`)}
            >
              <Avatar src={currentUser.avatar} alt={currentUser.displayName} size="sm" />
              <div className="truncate">
                <p className="text-sm font-bold text-ink leading-tight truncate">
                  {currentUser.displayName}
                </p>
                <p className="text-xs text-mute truncate">@{currentUser.username}</p>
              </div>
            </div>
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="p-1.5 text-mute hover:text-danger rounded-full transition-colors"
              title="Log out"
              aria-label="Log out"
            >
              <LogOut size={18} />
            </button>
          </div>
        ) : (
          <div className="space-y-2 pt-2 border-t border-line">
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/login')}
              className="w-full font-bold justify-center"
            >
              Sign In
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/register')}
              className="w-full font-bold justify-center border-line hover:bg-paper"
            >
              Sign Up
            </Button>
          </div>
        )}
      </div>
    </aside>
  );
};
