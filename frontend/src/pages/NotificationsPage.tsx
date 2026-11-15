import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Repeat, MessageCircle, UserPlus, CheckCheck, Bell } from 'lucide-react';
import { NotificationItem } from '../types';
import { api } from '../services/api';
import { Avatar } from '../components/ui/Avatar';
import { EmptyState } from '../components/ui/EmptyState';
import { formatRelativeTime } from '../utils/time';
import { useToast } from '../components/ui/Toast';
import { cn } from '../utils/cn';

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'mentions' | 'unread'>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const fetchNotifs = async () => {
    setIsLoading(true);
    try {
      const list = await api.getNotifications();
      setNotifications(list);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const handleMarkAllRead = async () => {
    await api.markAllNotificationsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    showToast('All notifications marked as read', 'success');
  };

  const filtered = notifications.filter((n) => {
    if (filter === 'unread') return !n.isRead;
    if (filter === 'mentions') return n.type === 'MENTION' || n.type === 'REPLY';
    return true;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'LIKE':
        return <Heart size={18} className="fill-danger text-danger" />;
      case 'REPOST':
        return <Repeat size={18} className="text-green-600" />;
      case 'REPLY':
      case 'MENTION':
        return <MessageCircle size={18} className="text-accent" />;
      case 'FOLLOW':
      case 'FOLLOW_REQUEST':
        return <UserPlus size={18} className="text-purple-600" />;
      default:
        return <Bell size={18} className="text-mute" />;
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="sticky top-0 z-30 bg-surface/90 backdrop-blur-md border-b border-line">
        <div className="flex items-center justify-between px-4 py-3">
          <h2 className="text-xl font-black text-ink">Notifications</h2>
          <button
            onClick={handleMarkAllRead}
            className="flex items-center space-x-1.5 text-xs font-bold text-accent hover:underline p-1"
          >
            <CheckCheck size={16} />
            <span>Mark all as read</span>
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex border-t border-line">
          {['all', 'mentions', 'unread'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab as any)}
              className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${
                filter === tab
                  ? 'border-accent text-accent'
                  : 'border-transparent text-mute hover:text-ink'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications Stream */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications"
          description="When people interact with your posts, replies, or profile, you'll see it here."
        />
      ) : (
        <div className="divide-y divide-line">
          {filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                if (item.post) navigate(`/post/${item.post.id}`);
                else if (item.actors[0]) navigate(`/u/${item.actors[0].username}`);
              }}
              className={cn(
                'p-4 flex space-x-3.5 hover:bg-paper/40 transition-colors cursor-pointer',
                !item.isRead && 'bg-accentSoft/30'
              )}
            >
              <div className="pt-0.5 shrink-0">{getIcon(item.type)}</div>

              <div className="flex-1 min-w-0 space-y-1.5">
                {/* Avatar Stack for grouped notifications */}
                <div className="flex items-center space-x-1">
                  {item.actors.slice(0, 3).map((actor, idx) => (
                    <Avatar
                      key={idx}
                      src={actor.avatar}
                      alt={actor.displayName}
                      size="sm"
                      className="border-2 border-surface"
                    />
                  ))}
                  {item.actors.length > 3 && (
                    <span className="text-xs font-bold text-mute pl-1">
                      +{item.actors.length - 3}
                    </span>
                  )}
                </div>

                {/* Text summary */}
                <p className="text-sm text-ink leading-relaxed">
                  <span className="font-bold">{item.actors[0]?.displayName}</span>
                  {item.actors.length > 1 && (
                    <span> and {item.actors.length - 1} others</span>
                  )}{' '}
                  {item.type === 'LIKE' && 'liked your post'}
                  {item.type === 'REPOST' && 'reposted your post'}
                  {item.type === 'REPLY' && 'replied to your post'}
                  {item.type === 'FOLLOW' && 'followed you'}
                  {item.type === 'FOLLOW_REQUEST' && 'requested to follow you'}
                  {item.type === 'MENTION' && 'mentioned you in a post'}
                </p>

                {/* Excerpt if post attached */}
                {item.post && (
                  <p className="text-xs text-mute line-clamp-1 italic">
                    "{item.post.content}"
                  </p>
                )}

                <p className="text-[11px] text-mute">{formatRelativeTime(item.createdAt)}</p>
              </div>

              {!item.isRead && (
                <div className="w-2 h-2 rounded-full bg-accent shrink-0 mt-2" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
