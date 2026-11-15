import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, Post } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ProfileHeader } from '../components/profile/ProfileHeader';
import { PostCard } from '../components/post/PostCard';
import { PostSkeleton } from '../components/ui/LoadingSpinner';
import { EmptyState } from '../components/ui/EmptyState';
import { ArrowLeft, Lock, MessageSquare } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [activeTab, setActiveTab] = useState<string>('Posts');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchProfile = async () => {
    if (!username) return;
    setIsLoading(true);
    try {
      const userData = await api.getUser(username);
      setUser(userData);

      // Fetch user's posts
      const feedRes = await api.getFeed();
      const userPosts = feedRes.data.filter(
        (p) => p.author.username.toLowerCase() === username.toLowerCase()
      );
      setPosts(userPosts);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [username]);

  if (isLoading && !user) {
    return (
      <div className="p-4">
        <PostSkeleton />
        <PostSkeleton />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-8 text-center">
        <p className="text-base font-bold text-ink">User @{username} not found</p>
        <button
          onClick={() => navigate('/')}
          className="mt-3 text-sm text-accent font-bold hover:underline"
        >
          Return to Home
        </button>
      </div>
    );
  }

  const isOwnProfile = currentUser?.username.toLowerCase() === user.username.toLowerCase();
  const isPrivateAndLocked = user.isPrivate && !isOwnProfile && !user.isFollowing;

  return (
    <div>
      {/* Top Header */}
      <div className="sticky top-0 z-30 flex items-center space-x-6 px-4 py-2.5 bg-surface/90 backdrop-blur-md border-b border-line">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-paper text-ink transition-colors"
          aria-label="Back"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 className="text-lg font-black text-ink leading-tight">{user.displayName}</h2>
          <p className="text-xs text-mute">{user.postsCount} posts</p>
        </div>
      </div>

      {/* Profile Header Details */}
      <ProfileHeader
        user={user}
        onUserUpdated={setUser}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Main Content Area */}
      {isPrivateAndLocked ? (
        <div className="p-12 text-center max-w-sm mx-auto space-y-3">
          <div className="w-16 h-16 rounded-full bg-paper border border-line flex items-center justify-center mx-auto text-mute">
            <Lock size={32} />
          </div>
          <h3 className="text-lg font-bold text-ink">This Account is Private</h3>
          <p className="text-xs text-mute leading-relaxed">
            Follow @{user.username} to see their posts, replies, and media.
          </p>
        </div>
      ) : posts.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No posts yet"
          description={`@${user.username} has not published any posts in this category.`}
        />
      ) : (
        <div>
          {posts.map((post) => (
            <PostCard key={post.id} post={post} onPostUpdated={fetchProfile} />
          ))}
        </div>
      )}
    </div>
  );
};
