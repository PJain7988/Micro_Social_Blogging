import React, { useState, useEffect } from 'react';
import { Post } from '../types';
import { api } from '../services/api';
import { PostComposer } from '../components/post/PostComposer';
import { PostCard } from '../components/post/PostCard';
import { PostSkeleton } from '../components/ui/LoadingSpinner';
import { EmptyState } from '../components/ui/EmptyState';
import { Sparkles, MessageSquare, ArrowUp } from 'lucide-react';
import { socketService } from '../services/socket';

export const HomePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'forYou' | 'following'>('forYou');
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasNewPosts, setHasNewPosts] = useState<boolean>(false);

  const fetchFeed = async () => {
    setIsLoading(true);
    try {
      const res = await api.getFeed();
      setPosts(res.data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();

    // Listen to real-time Socket.IO post count updates
    const unsub = socketService.subscribe('post:counts', (payload: any) => {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === payload.postId
            ? { ...p, likesCount: payload.likesCount, repostsCount: payload.repostsCount }
            : p
        )
      );
    });

    return () => unsub();
  }, [activeTab]);

  return (
    <div>
      {/* Sticky Header with Feed Tabs */}
      <div className="sticky top-0 z-30 bg-surface/90 backdrop-blur-md border-b border-line">
        <div className="flex border-b border-line">
          <button
            onClick={() => setActiveTab('forYou')}
            className={`flex-1 py-3.5 text-sm font-bold text-center border-b-2 transition-colors ${
              activeTab === 'forYou'
                ? 'border-accent text-accent'
                : 'border-transparent text-mute hover:text-ink hover:bg-paper/40'
            }`}
          >
            For You
          </button>
          <button
            onClick={() => setActiveTab('following')}
            className={`flex-1 py-3.5 text-sm font-bold text-center border-b-2 transition-colors ${
              activeTab === 'following'
                ? 'border-accent text-accent'
                : 'border-transparent text-mute hover:text-ink hover:bg-paper/40'
            }`}
          >
            Following
          </button>
        </div>

        {/* Floating "New Posts" Pill */}
        {hasNewPosts && (
          <div className="py-2 flex justify-center bg-accentSoft/50 border-b border-accent/20">
            <button
              onClick={() => {
                setHasNewPosts(false);
                fetchFeed();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center space-x-1.5 px-3 py-1 bg-accent text-white rounded-full text-xs font-bold shadow-sm hover:bg-blue-700 transition-colors"
            >
              <ArrowUp size={14} />
              <span>New posts available</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Post Composer */}
      <PostComposer onSuccess={fetchFeed} />

      {/* Posts Stream */}
      {isLoading ? (
        <div>
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
        </div>
      ) : posts.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No posts yet"
          description="Your feed is currently empty. Follow other creators or share your thoughts to start the conversation."
          actionText="Explore Topics"
          onAction={() => (window.location.href = '/explore')}
        />
      ) : (
        <div>
          {posts.map((post) => (
            <PostCard key={post.id} post={post} onPostUpdated={fetchFeed} />
          ))}

          {/* End of Feed Indicator */}
          <div className="p-10 text-center border-b border-line flex flex-col items-center justify-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-accentSoft flex items-center justify-center mb-1">
              <Sparkles size={18} className="text-accent" />
            </div>
            <span className="font-bold text-sm text-ink">You&apos;re all caught up!</span>
            <span className="text-xs text-mute font-normal max-w-xs">
              Redis fan-out engine delivered your latest personalized updates. Check back soon for new posts.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
