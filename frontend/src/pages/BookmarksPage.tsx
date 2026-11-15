import React, { useState, useEffect } from 'react';
import { Post } from '../types';
import { api } from '../services/api';
import { PostCard } from '../components/post/PostCard';
import { EmptyState } from '../components/ui/EmptyState';
import { PostSkeleton } from '../components/ui/LoadingSpinner';
import { Bookmark } from 'lucide-react';

export const BookmarksPage: React.FC = () => {
  const [bookmarks, setBookmarks] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchBookmarks = async () => {
    setIsLoading(true);
    try {
      const list = await api.getBookmarks();
      setBookmarks(Array.isArray(list) ? list : []);
    } catch {
      setBookmarks([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookmarks();
  }, []);

  return (
    <div>
      <div className="sticky top-0 z-30 px-4 py-3 bg-surface/90 backdrop-blur-md border-b border-line">
        <h2 className="text-xl font-black text-ink">Bookmarks</h2>
        <p className="text-xs text-mute">Saved posts for later reference</p>
      </div>

      {isLoading ? (
        <div>
          <PostSkeleton />
          <PostSkeleton />
        </div>
      ) : bookmarks.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="Save posts for later"
          description="Don't let the good ones fly away! Bookmark posts to easily find them again in the future."
        />
      ) : (
        <div>
          {bookmarks.map((post) => (
            <PostCard key={post.id} post={post} onPostUpdated={fetchBookmarks} />
          ))}
        </div>
      )}
    </div>
  );
};
