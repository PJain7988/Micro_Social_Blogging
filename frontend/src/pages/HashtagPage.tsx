import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Post } from '../types';
import { api } from '../services/api';
import { PostCard } from '../components/post/PostCard';
import { PostSkeleton } from '../components/ui/LoadingSpinner';
import { EmptyState } from '../components/ui/EmptyState';
import { ArrowLeft, Hash } from 'lucide-react';

export const HashtagPage: React.FC = () => {
  const { tag } = useParams<{ tag: string }>();
  const navigate = useNavigate();

  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!tag) return;
    setIsLoading(true);
    api.getPostsByTag(tag)
      .then((res) => {
        setPosts(Array.isArray(res) ? res : []);
      })
      .catch(() => {
        setPosts([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [tag]);

  return (
    <div>
      {/* Header */}
      <div className="sticky top-0 z-30 flex items-center space-x-6 px-4 py-3 bg-surface/90 backdrop-blur-md border-b border-line">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-paper text-ink transition-colors"
          aria-label="Back"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 className="text-lg font-black text-ink flex items-center space-x-1">
            <span>#{tag}</span>
          </h2>
          <p className="text-xs text-mute">{posts.length} posts found</p>
        </div>
      </div>

      {/* Posts Stream */}
      {isLoading ? (
        <div>
          <PostSkeleton />
          <PostSkeleton />
        </div>
      ) : posts.length === 0 ? (
        <EmptyState
          icon={Hash}
          title={`No posts found for #${tag}`}
          description="Be the first to share a post using this hashtag!"
          actionText="Create Post"
          onAction={() => navigate('/')}
        />
      ) : (
        <div>
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
};
