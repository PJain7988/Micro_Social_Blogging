import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Post } from '../types';
import { api } from '../services/api';
import { PostCard } from '../components/post/PostCard';
import { PostComposer } from '../components/post/PostComposer';
import { PostSkeleton } from '../components/ui/LoadingSpinner';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { formatFullDate } from '../utils/time';

export const PostDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [post, setPost] = useState<Post | null>(null);
  const [parentPost, setParentPost] = useState<Post | null>(null);
  const [replies, setReplies] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchPostAndReplies = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const p = await api.getPost(id);
      setPost(p);

      if (p.parentId) {
        const parent = await api.getPost(p.parentId).catch(() => null);
        setParentPost(parent);
      }

      const repList = await api.getReplies(id);
      setReplies(repList);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPostAndReplies();
    window.scrollTo(0, 0);
  }, [id]);

  if (isLoading && !post) {
    return (
      <div className="p-4">
        <PostSkeleton />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="p-8 text-center space-y-3">
        <p className="text-base font-bold text-ink">Post not found or has been removed</p>
        <button
          onClick={() => navigate('/')}
          className="text-sm text-accent font-bold hover:underline"
        >
          Return to Home
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 flex items-center space-x-6 px-4 py-3 bg-surface/90 backdrop-blur-md border-b border-line">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-paper text-ink transition-colors"
          aria-label="Back"
        >
          <ArrowLeft size={18} />
        </button>
        <h2 className="text-lg font-black text-ink">Post Thread</h2>
      </div>

      {/* Parent Post Thread (if this is a reply) */}
      {post.parentId && (
        <div className="relative">
          {parentPost ? (
            <div className="relative">
              <PostCard post={parentPost} />
              {/* Connecting vertical line */}
              <div className="absolute left-[34px] top-14 bottom-0 w-0.5 bg-line z-0" />
            </div>
          ) : (
            <div className="p-4 border-b border-line bg-paper/60 flex items-center space-x-3 text-xs text-mute font-medium">
              <Trash2 size={16} />
              <span>This parent post was deleted by the author.</span>
            </div>
          )}
        </div>
      )}

      {/* Main Focused Post */}
      <div className="border-b border-line">
        <PostCard post={post} isDetailView={true} onPostUpdated={fetchPostAndReplies} />

        {/* Full Date Timestamp */}
        <div className="px-5 py-2.5 text-xs text-mute font-medium border-t border-line/60">
          <span>{formatFullDate(post.createdAt)}</span>
        </div>
      </div>

      {/* Reply Composer */}
      <div className="border-b border-line bg-paper/30">
        <PostComposer
          parentId={post.id}
          placeholder={`Reply to @${post.author.username}...`}
          onSuccess={fetchPostAndReplies}
        />
      </div>

      {/* Replies Thread Stream */}
      <div>
        {replies.length > 0 ? (
          replies.map((reply) => (
            <PostCard key={reply.id} post={reply} onPostUpdated={fetchPostAndReplies} />
          ))
        ) : (
          <div className="p-8 text-center text-xs text-mute">
            No replies yet. Be the first to share your thoughts!
          </div>
        )}
      </div>
    </div>
  );
};
