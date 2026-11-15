import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { User, Post } from '../types';
import { PostCard } from '../components/post/PostCard';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { Search, ArrowLeft } from 'lucide-react';

export const SearchPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'posts' | 'people'>('posts');
  const [users, setUsers] = useState<User[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!query) return;
    setIsLoading(true);
    api.search(query).then((res) => {
      setUsers(res.users);
      setPosts(res.posts);
      setIsLoading(false);
    });
  }, [query]);

  return (
    <div>
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-surface/90 backdrop-blur-md border-b border-line">
        <div className="flex items-center space-x-4 px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-paper text-ink transition-colors"
            aria-label="Back"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 className="text-lg font-black text-ink">Search Results</h2>
            <p className="text-xs text-mute">for "{query}"</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-t border-line">
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${
              activeTab === 'posts'
                ? 'border-accent text-accent'
                : 'border-transparent text-mute hover:text-ink'
            }`}
          >
            Posts ({posts.length})
          </button>
          <button
            onClick={() => setActiveTab('people')}
            className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${
              activeTab === 'people'
                ? 'border-accent text-accent'
                : 'border-transparent text-mute hover:text-ink'
            }`}
          >
            People ({users.length})
          </button>
        </div>
      </div>

      {/* Results Content */}
      {activeTab === 'posts' ? (
        posts.length === 0 ? (
          <EmptyState
            icon={Search}
            title={`No posts found for "${query}"`}
            description="Try searching for a different keyword or hashtag."
          />
        ) : (
          <div>
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )
      ) : users.length === 0 ? (
        <EmptyState
          icon={Search}
          title={`No users found for "${query}"`}
          description="Try checking for typos or searching by full display name."
        />
      ) : (
        <div className="divide-y divide-line">
          {users.map((user) => (
            <div
              key={user.id}
              onClick={() => navigate(`/u/${user.username}`)}
              className="p-4 flex items-center justify-between hover:bg-paper/30 transition-colors cursor-pointer group"
            >
              <div className="flex items-center space-x-3 min-w-0 pr-3">
                <Avatar src={user.avatar} alt={user.displayName} size="md" />
                <div className="truncate">
                  <p className="text-sm font-bold text-ink truncate group-hover:underline">
                    {user.displayName}
                  </p>
                  <p className="text-xs text-mute truncate">@{user.username}</p>
                  {user.bio && (
                    <p className="text-xs text-mute truncate mt-0.5">{user.bio}</p>
                  )}
                </div>
              </div>

              <Button
                variant={user.isFollowing ? 'outline' : 'secondary'}
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  api.toggleFollow(user.id, !!user.isFollowing).then(() => {
                    setUsers((prev) =>
                      prev.map((u) =>
                        u.id === user.id ? { ...u, isFollowing: !u.isFollowing } : u
                      )
                    );
                  });
                }}
                className="shrink-0 text-xs px-4"
              >
                {user.isFollowing ? 'Following' : 'Follow'}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
