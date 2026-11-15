import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, TrendingUp, Sparkles, Hash } from 'lucide-react';
import { api } from '../services/api';
import { TrendingTopic, Post } from '../types';
import { PostCard } from '../components/post/PostCard';
import { PostSkeleton } from '../components/ui/LoadingSpinner';

export const ExplorePage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [trending, setTrending] = useState<TrendingTopic[]>([]);
  const [topPosts, setTopPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    setIsLoading(true);
    Promise.all([api.getTrendingTopics(), api.getFeed()]).then(([tags, feed]) => {
      setTrending(tags);
      setTopPosts(feed.data);
      setIsLoading(false);
    });
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div>
      {/* Sticky Header with Search */}
      <div className="sticky top-0 z-30 p-3 bg-surface/90 backdrop-blur-md border-b border-line">
        <form onSubmit={handleSearch} className="relative">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-mute" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Chirpwell, #hashtags, @people..."
            className="w-full pl-10 pr-4 py-2 rounded-full bg-paper border border-line text-sm text-ink placeholder-mute focus:outline-none focus:bg-surface focus:border-accent focus:ring-1 focus:ring-accent transition-all"
          />
        </form>
      </div>

      {/* 24-Hour Trending Hashtags Grid */}
      <div className="p-4 border-b border-line bg-paper/30">
        <div className="flex items-center space-x-2 mb-3">
          <TrendingUp size={18} className="text-accent" />
          <h2 className="text-base font-extrabold text-ink">Trending across 24 Hours</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {trending.map((topic) => (
            <Link
              key={topic.tag}
              to={`/tag/${topic.tag.toLowerCase()}`}
              className="p-3 bg-surface rounded-xl border border-line hover:border-accent transition-all group shadow-2xs"
            >
              <div className="flex items-center space-x-1.5 text-xs text-mute font-medium">
                <Hash size={13} className="text-accent" />
                <span>{topic.category}</span>
              </div>
              <p className="text-sm font-bold text-ink group-hover:text-accent transition-colors mt-0.5">
                #{topic.tag}
              </p>
              <p className="text-xs text-mute mt-1">
                {(topic.postsCount / 1000).toFixed(1)}k posts in last 24h
              </p>
            </Link>
          ))}
        </div>
      </div>

      {/* Top Trending Discussions */}
      <div>
        <div className="p-3.5 border-b border-line bg-paper/40 flex items-center space-x-2">
          <Sparkles size={16} className="text-accent" />
          <h3 className="text-xs font-bold text-mute uppercase tracking-wide">
            Top Conversations
          </h3>
        </div>

        {isLoading ? (
          <div>
            <PostSkeleton />
            <PostSkeleton />
          </div>
        ) : (
          <div>
            {topPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
