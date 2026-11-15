import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, TrendingUp, Sparkles } from 'lucide-react';
import { api } from '../../services/api';
import { TrendingTopic, User } from '../../types';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';

export const RightPanel: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [trending, setTrending] = useState<TrendingTopic[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<User[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.getTrendingTopics().then(setTrending);
    // Load suggested users
    const all = (api as any).users || {};
    const list = Object.values(all) as User[];
    setSuggestedUsers(list.slice(1, 4));
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleToggleFollow = async (userId: string, isFollowing?: boolean) => {
    await api.toggleFollow(userId, !!isFollowing);
    setSuggestedUsers(prev =>
      prev.map(u => (u.id === userId ? { ...u, isFollowing: !isFollowing } : u))
    );
  };

  return (
    <aside className="w-[320px] h-screen sticky top-0 py-5 px-4 space-y-5 hidden lg:block overflow-y-auto">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="relative">
        <Search
          size={18}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-mute"
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search Chirpwell, #tags, or @people"
          className="w-full pl-10 pr-4 py-2.5 rounded-full bg-paper border border-line text-sm text-ink placeholder-mute focus:outline-none focus:bg-surface focus:border-accent focus:ring-1 focus:ring-accent transition-all"
        />
      </form>

      {/* Trending Topics Card */}
      <div className="bg-surface rounded-2xl border border-line p-4 space-y-3">
        <div className="flex items-center space-x-2 pb-1">
          <TrendingUp size={18} className="text-accent" />
          <h3 className="font-extrabold text-base text-ink">Trending for you</h3>
        </div>

        <div className="space-y-2.5">
          {trending.slice(0, 5).map((topic) => (
            <Link
              key={topic.tag}
              to={`/tag/${topic.tag.toLowerCase()}`}
              className="block group hover:bg-paper -mx-2 px-2 py-1.5 rounded-xl transition-colors"
            >
              <p className="text-xs text-mute font-medium">{topic.category}</p>
              <p className="text-sm font-bold text-ink group-hover:text-accent transition-colors">
                #{topic.tag}
              </p>
              <p className="text-xs text-mute">
                {(topic.postsCount / 1000).toFixed(1)}k posts
              </p>
            </Link>
          ))}
        </div>

        <Link
          to="/explore"
          className="block text-xs font-bold text-accent hover:underline pt-1"
        >
          Show more trending
        </Link>
      </div>

      {/* Who to Follow Card */}
      <div className="bg-surface rounded-2xl border border-line p-4 space-y-3">
        <div className="flex items-center space-x-2 pb-1">
          <Sparkles size={18} className="text-accent" />
          <h3 className="font-extrabold text-base text-ink">Who to follow</h3>
        </div>

        <div className="space-y-3">
          {suggestedUsers.map((user) => (
            <div key={user.id} className="flex items-center justify-between">
              <Link
                to={`/u/${user.username}`}
                className="flex items-center space-x-2.5 min-w-0 pr-2 group"
              >
                <Avatar src={user.avatar} alt={user.displayName} size="sm" />
                <div className="truncate">
                  <p className="text-xs font-bold text-ink truncate group-hover:underline">
                    {user.displayName}
                  </p>
                  <p className="text-[11px] text-mute truncate">@{user.username}</p>
                </div>
              </Link>
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
      </div>

      {/* Footer Links */}
      <div className="px-2 text-xs text-mute space-x-2 leading-relaxed">
        <a href="#terms" className="hover:underline">Terms</a>
        <span>·</span>
        <a href="#privacy" className="hover:underline">Privacy Policy</a>
        <span>·</span>
        <a href="#cookies" className="hover:underline">Cookies</a>
        <span>·</span>
        <span>© 2026 Chirpwell Network</span>
      </div>
    </aside>
  );
};
