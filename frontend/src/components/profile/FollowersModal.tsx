import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { User } from '../../types';
import { api } from '../../services/api';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../utils/cn';

export interface FollowersModalProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
  initialTab?: 'followers' | 'following';
}

export const FollowersModal: React.FC<FollowersModalProps> = ({
  isOpen,
  onClose,
  username,
  initialTab = 'followers',
}) => {
  const [activeTab, setActiveTab] = useState<'followers' | 'following'>(initialTab);
  const [usersList, setUsersList] = useState<User[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      // Load mock followers/following
      const allUsers = Object.values((api as any).users || {}) as User[];
      setUsersList(allUsers);
    }
  }, [isOpen, initialTab, username]);

  const handleToggleFollow = async (userId: string, isFollowing?: boolean) => {
    await api.toggleFollow(userId, !!isFollowing);
    setUsersList((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, isFollowing: !isFollowing } : u))
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`@${username}`} maxWidth="sm">
      {/* Tabs */}
      <div className="flex border-b border-line -mx-5 px-5 mb-3">
        <button
          onClick={() => setActiveTab('followers')}
          className={cn(
            'flex-1 pb-3 text-sm font-bold text-center border-b-2 transition-colors',
            activeTab === 'followers'
              ? 'border-accent text-accent'
              : 'border-transparent text-mute hover:text-ink'
          )}
        >
          Followers
        </button>
        <button
          onClick={() => setActiveTab('following')}
          className={cn(
            'flex-1 pb-3 text-sm font-bold text-center border-b-2 transition-colors',
            activeTab === 'following'
              ? 'border-accent text-accent'
              : 'border-transparent text-mute hover:text-ink'
          )}
        >
          Following
        </button>
      </div>

      {/* Users List */}
      <div className="space-y-3 max-h-[60vh] overflow-y-auto">
        {usersList.map((user) => (
          <div key={user.id} className="flex items-center justify-between py-1">
            <div
              className="flex items-center space-x-3 cursor-pointer min-w-0 pr-2 group"
              onClick={() => {
                onClose();
                navigate(`/u/${user.username}`);
              }}
            >
              <Avatar src={user.avatar} alt={user.displayName} size="sm" />
              <div className="truncate">
                <p className="text-sm font-bold text-ink truncate group-hover:underline">
                  {user.displayName}
                </p>
                <p className="text-xs text-mute truncate">@{user.username}</p>
              </div>
            </div>

            <Button
              variant={user.isFollowing ? 'outline' : 'secondary'}
              size="sm"
              onClick={() => handleToggleFollow(user.id, user.isFollowing)}
              className="shrink-0 text-xs px-3 py-1"
            >
              {user.isFollowing ? 'Following' : 'Follow'}
            </Button>
          </div>
        ))}
      </div>
    </Modal>
  );
};
