import React, { useState } from 'react';
import { MapPin, Link as LinkIcon, Calendar, Lock } from 'lucide-react';
import { User } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { VerifiedBadge } from '../ui/VerifiedBadge';
import { EditProfileModal } from './EditProfileModal';
import { FollowersModal } from './FollowersModal';
import { useToast } from '../ui/Toast';

export interface ProfileHeaderProps {
  user: User;
  onUserUpdated?: (user: User) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  user,
  onUserUpdated,
  activeTab,
  onTabChange,
}) => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const [currentUserState, setCurrentUserState] = useState<User>(user);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [followersModalState, setFollowersModalState] = useState<{
    isOpen: boolean;
    initialTab: 'followers' | 'following';
  }>({ isOpen: false, initialTab: 'followers' });

  const isOwnProfile = currentUser?.username === currentUserState.username;

  const handleFollowAction = async () => {
    try {
      const res = await api.toggleFollow(currentUserState.id, !!currentUserState.isFollowing);
      let updated: User;
      if (res.status === 'requested') {
        updated = { ...currentUserState, isPendingRequest: true };
        showToast(`Follow request sent to @${currentUserState.username}`, 'info');
      } else if (res.status === 'following') {
        updated = {
          ...currentUserState,
          isFollowing: true,
          followersCount: currentUserState.followersCount + 1,
        };
        showToast(`You are now following @${currentUserState.username}`, 'success');
      } else {
        updated = {
          ...currentUserState,
          isFollowing: false,
          isPendingRequest: false,
          followersCount: Math.max(0, currentUserState.followersCount - 1),
        };
        showToast(`Unfollowed @${currentUserState.username}`, 'info');
      }
      setCurrentUserState(updated);
      if (onUserUpdated) onUserUpdated(updated);
    } catch {
      showToast('Action failed', 'error');
    }
  };

  return (
    <div>
      {/* Banner */}
      <div className="h-44 sm:h-52 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-accent relative overflow-hidden">
        {currentUserState.banner && (
          <img
            src={currentUserState.banner}
            alt="Profile Banner"
            className="w-full h-full object-cover"
          />
        )}
        {/* Subtle overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
      </div>

      {/* Main Profile Info Section */}
      <div className="px-5 pb-3">
        <div className="flex justify-between items-end relative -mt-16 sm:-mt-20 mb-3">
          {/* Avatar with ring */}
          <div className="rounded-full ring-4 ring-surface overflow-hidden bg-surface shadow-lg">
            <Avatar
              src={currentUserState.avatar}
              alt={currentUserState.displayName}
              size="xl"
              className="w-28 h-28 sm:w-32 sm:h-32"
            />
          </div>

          {/* Action Button */}
          <div className="mb-2">
            {isOwnProfile ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditModalOpen(true)}
                className="font-bold border-line px-5 py-2 hover:bg-paper"
              >
                Edit Profile
              </Button>
            ) : currentUserState.isPendingRequest ? (
              <Button variant="outline" size="sm" disabled className="font-bold px-5">
                Requested
              </Button>
            ) : (
              <Button
                variant={currentUserState.isFollowing ? 'outline' : 'secondary'}
                size="sm"
                onClick={handleFollowAction}
                className="font-bold px-6 shadow-sm"
              >
                {currentUserState.isFollowing ? 'Following' : 'Follow'}
              </Button>
            )}
          </div>
        </div>

        {/* User Identity Details */}
        <div className="space-y-3">
          <div>
            <div className="flex items-center space-x-1.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-ink">
                {currentUserState.displayName}
              </h1>
              {currentUserState.isVerified && <VerifiedBadge size={20} />}
              {currentUserState.isPrivate && (
                <span title="Private Account">
                  <Lock size={16} className="text-mute" />
                </span>
              )}
            </div>
            <p className="text-sm text-mute">@{currentUserState.username}</p>
          </div>

          {/* Bio */}
          {currentUserState.bio && (
            <p className="text-sm text-ink leading-relaxed break-words">
              {currentUserState.bio}
            </p>
          )}

          {/* Metadata Row */}
          <div className="flex flex-wrap gap-y-1.5 gap-x-4 text-xs text-mute font-medium">
            {currentUserState.location && (
              <div className="flex items-center space-x-1">
                <MapPin size={14} className="shrink-0" />
                <span>{currentUserState.location}</span>
              </div>
            )}
            {currentUserState.website && (
              <div className="flex items-center space-x-1">
                <LinkIcon size={14} className="shrink-0" />
                <a
                  href={currentUserState.website}
                  target="_blank"
                  rel="noreferrer"
                  className="text-accent hover:underline truncate max-w-[200px]"
                >
                  {currentUserState.website.replace(/^https?:\/\//, '')}
                </a>
              </div>
            )}
            <div className="flex items-center space-x-1">
              <Calendar size={14} className="shrink-0" />
              <span>Joined November 2026</span>
            </div>
          </div>

          {/* Followers & Following Counters */}
          <div className="flex items-center space-x-5 text-sm pt-1">
            <button
              onClick={() =>
                setFollowersModalState({ isOpen: true, initialTab: 'following' })
              }
              className="hover:underline flex items-center space-x-1 transition-colors"
            >
              <span className="font-extrabold text-ink">
                {currentUserState.followingCount.toLocaleString()}
              </span>
              <span className="text-mute">Following</span>
            </button>

            <button
              onClick={() =>
                setFollowersModalState({ isOpen: true, initialTab: 'followers' })
              }
              className="hover:underline flex items-center space-x-1 transition-colors"
            >
              <span className="font-extrabold text-ink">
                {currentUserState.followersCount.toLocaleString()}
              </span>
              <span className="text-mute">Followers</span>
            </button>
          </div>
        </div>
      </div>

      {/* Profile Navigation Tabs */}
      <div className="flex border-b border-line mt-3">
        {['Posts', 'Replies', 'Highlights', 'Media', 'Likes'].map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`flex-1 py-3 text-sm font-bold text-center border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-accent text-accent'
                : 'border-transparent text-mute hover:text-ink hover:bg-paper/40'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Edit Profile Modal */}
      {isOwnProfile && (
        <EditProfileModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          user={currentUserState}
        />
      )}

      {/* Followers & Following Modal */}
      <FollowersModal
        isOpen={followersModalState.isOpen}
        onClose={() =>
          setFollowersModalState((prev) => ({ ...prev, isOpen: false }))
        }
        username={currentUserState.username}
        initialTab={followersModalState.initialTab}
      />
    </div>
  );
};
