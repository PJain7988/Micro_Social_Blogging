import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageCircle,
  Repeat,
  Heart,
  Bookmark,
  Share,
  MoreHorizontal,
  Pin,
  ShieldAlert,
  EyeOff,
} from 'lucide-react';
import { Post } from '../../types';
import { api } from '../../services/api';
import { Avatar } from '../ui/Avatar';
import { RichText } from '../common/RichText';
import { PollWidget } from './PollWidget';
import { ReportModal } from './ReportModal';
import { formatRelativeTime } from '../../utils/time';
import { useToast } from '../ui/Toast';
import { cn } from '../../utils/cn';
import { VerifiedBadge } from '../ui/VerifiedBadge';

export interface PostCardProps {
  post: Post;
  isDetailView?: boolean;
  onPostUpdated?: (updated: Post) => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  isDetailView = false,
  onPostUpdated,
}) => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [currentPost, setCurrentPost] = useState<Post>(post);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [showSensitiveContent, setShowSensitiveContent] = useState(false);
  const [likeAnimating, setLikeAnimating] = useState(false);

  const isFlagged = currentPost.status === 'FLAGGED';

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const willLike = !currentPost.isLiked;

    // Trigger pulse animation on like
    if (willLike) {
      setLikeAnimating(true);
      setTimeout(() => setLikeAnimating(false), 350);
    }

    // Optimistic UI update
    const updated = {
      ...currentPost,
      isLiked: willLike,
      likesCount: willLike ? currentPost.likesCount + 1 : Math.max(0, currentPost.likesCount - 1),
    };
    setCurrentPost(updated);
    if (onPostUpdated) onPostUpdated(updated);

    try {
      await api.toggleLike(currentPost.id, !willLike);
    } catch {
      // Revert on error
      setCurrentPost(currentPost);
      showToast('Action failed', 'error');
    }
  };

  const handleRepost = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const willRepost = !currentPost.isReposted;

    const updated = {
      ...currentPost,
      isReposted: willRepost,
      repostsCount: willRepost ? currentPost.repostsCount + 1 : Math.max(0, currentPost.repostsCount - 1),
    };
    setCurrentPost(updated);
    if (onPostUpdated) onPostUpdated(updated);

    try {
      await api.toggleRepost(currentPost.id, !willRepost);
      showToast(willRepost ? 'Reposted to your profile!' : 'Repost removed', 'success');
    } catch {
      setCurrentPost(currentPost);
      showToast('Action failed', 'error');
    }
  };

  const handleBookmark = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const willBookmark = !currentPost.isBookmarked;
    const updated = { ...currentPost, isBookmarked: willBookmark };
    setCurrentPost(updated);
    if (onPostUpdated) onPostUpdated(updated);

    try {
      await api.toggleBookmark(currentPost.id);
      showToast(willBookmark ? 'Saved to Bookmarks' : 'Removed from Bookmarks', 'success');
    } catch {
      setCurrentPost(currentPost);
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${window.location.origin}/post/${currentPost.id}`);
      showToast('Link copied to clipboard!', 'success');
    }
  };

  const navigateToDetail = () => {
    if (!isDetailView) {
      navigate(`/post/${currentPost.id}`);
    }
  };

  return (
    <article
      onClick={navigateToDetail}
      className={cn(
        'p-4 border-b border-line bg-surface transition-colors',
        !isDetailView && 'hover:bg-paper/40 cursor-pointer',
        isDetailView && 'pt-5'
      )}
    >
      {/* Pinned Post Indicator */}
      {currentPost.isPinned && (
        <div className="flex items-center space-x-2 text-mute text-xs font-bold mb-2 ml-7">
          <Pin size={13} className="text-accent" />
          <span>Pinned Post</span>
        </div>
      )}

      {/* Flagged / Moderation Warning Shield */}
      {isFlagged && (
        <div className="mb-3 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 flex items-center justify-between text-xs text-amber-800 dark:text-amber-300">
          <div className="flex items-center space-x-2">
            <ShieldAlert size={16} className="text-amber-600 dark:text-amber-400 shrink-0" />
            <span className="font-semibold">
              Sensitive Content: Flagged by automated AI safety model.
            </span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowSensitiveContent(!showSensitiveContent);
            }}
            className="font-bold underline text-amber-900 dark:text-amber-200 hover:text-ink ml-2"
          >
            {showSensitiveContent ? 'Hide' : 'Show'}
          </button>
        </div>
      )}

      <div className="flex space-x-3">
        {/* Author Avatar */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/u/${currentPost.author.username}`);
          }}
          className="shrink-0"
        >
          <Avatar
            src={currentPost.author.avatar}
            alt={currentPost.author.displayName}
            size={isDetailView ? 'lg' : 'md'}
          />
        </div>

        {/* Content Body */}
        <div className="flex-1 min-w-0">
          {/* Header Row */}
          <div className="flex items-center justify-between">
            <div
              className="flex items-center space-x-1.5 truncate group"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/u/${currentPost.author.username}`);
              }}
            >
              <span className="font-bold text-sm text-ink group-hover:underline truncate">
                {currentPost.author.displayName}
              </span>
              {currentPost.author.isVerified && <VerifiedBadge size={14} />}
              <span className="text-xs text-mute truncate">
                @{currentPost.author.username}
              </span>
              <span className="text-xs text-mute">·</span>
              <span className="text-xs text-mute shrink-0">
                {formatRelativeTime(currentPost.createdAt)}
              </span>
            </div>

            {/* Menu Options */}
            <div className="relative">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMenuOpen(!isMenuOpen);
                }}
                className="p-1 rounded-full text-mute hover:text-ink hover:bg-paper transition-colors"
                aria-label="Post options"
              >
                <MoreHorizontal size={18} />
              </button>

              {isMenuOpen && (
                <div
                  className="absolute right-0 top-6 z-20 w-44 bg-surface rounded-xl shadow-lg border border-line py-1 text-xs font-semibold animate-fade-in"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      handleShare({ stopPropagation: () => {} } as any);
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-paper text-ink transition-colors"
                  >
                    Copy link to post
                  </button>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsReportModalOpen(true);
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-red-50 dark:hover:bg-red-950/40 text-danger transition-colors"
                  >
                    Report post
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Post Text Content */}
          <div className={cn('mt-1.5 text-sm text-ink', isFlagged && !showSensitiveContent && 'blur-sm select-none')}>
            <RichText content={currentPost.content} />
          </div>

          {/* Attached Poll */}
          {currentPost.poll && (
            <div onClick={(e) => e.stopPropagation()}>
              <PollWidget postId={currentPost.id} poll={currentPost.poll} />
            </div>
          )}

          {/* Attached Images Grid */}
          {currentPost.images && currentPost.images.length > 0 && (
            <div
              className={cn(
                'mt-3 grid gap-1.5 rounded-2xl overflow-hidden border border-line',
                isFlagged && !showSensitiveContent && 'blur-md',
                currentPost.images.length === 1 && 'grid-cols-1',
                currentPost.images.length === 2 && 'grid-cols-2',
                currentPost.images.length >= 3 && 'grid-cols-2'
              )}
            >
              {currentPost.images.map((img, i) => (
                <div
                  key={i}
                  className="relative aspect-video bg-paper overflow-hidden cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(img, '_blank');
                  }}
                >
                  <img
                    src={img}
                    alt={`Attachment ${i + 1}`}
                    className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Action Row Buttons */}
          <div className="flex items-center justify-between mt-3 text-mute max-w-md pt-1">
            {/* Reply */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/post/${currentPost.id}`);
              }}
              className="flex items-center space-x-1.5 hover:text-accent transition-colors group p-1 -m-1"
              aria-label="Reply to post"
            >
              <div className="p-1.5 rounded-full group-hover:bg-accentSoft transition-colors">
                <MessageCircle size={17} />
              </div>
              <span className="text-xs font-semibold">{currentPost.repliesCount || ''}</span>
            </button>

            {/* Repost */}
            <button
              type="button"
              onClick={handleRepost}
              className={cn(
                'flex items-center space-x-1.5 transition-colors group p-1 -m-1',
                currentPost.isReposted ? 'text-green-600 dark:text-green-400' : 'hover:text-green-600 dark:hover:text-green-400'
              )}
              aria-label="Repost"
            >
              <div className="p-1.5 rounded-full group-hover:bg-green-50 dark:group-hover:bg-green-950/40 transition-colors">
                <Repeat size={17} />
              </div>
              <span className="text-xs font-semibold">{currentPost.repostsCount || ''}</span>
            </button>

            {/* Like */}
            <button
              type="button"
              onClick={handleLike}
              className={cn(
                'flex items-center space-x-1.5 transition-colors group p-1 -m-1',
                currentPost.isLiked ? 'text-danger' : 'hover:text-danger'
              )}
              aria-label="Like post"
            >
              <div className="p-1.5 rounded-full group-hover:bg-red-50 dark:group-hover:bg-red-950/40 transition-colors">
                <Heart
                  size={17}
                  className={cn(
                    'transition-transform duration-200',
                    currentPost.isLiked && 'fill-danger scale-110',
                    likeAnimating && 'animate-heart-pulse'
                  )}
                />
              </div>
              <span className="text-xs font-semibold">{currentPost.likesCount || ''}</span>
            </button>

            {/* Bookmark */}
            <button
              type="button"
              onClick={handleBookmark}
              className={cn(
                'p-1.5 rounded-full transition-colors hover:text-accent hover:bg-accentSoft',
                currentPost.isBookmarked ? 'text-accent' : ''
              )}
              aria-label="Save bookmark"
            >
              <Bookmark size={17} className={currentPost.isBookmarked ? 'fill-accent' : ''} />
            </button>

            {/* Share */}
            <button
              type="button"
              onClick={handleShare}
              className="p-1.5 rounded-full transition-colors hover:text-accent hover:bg-accentSoft"
              aria-label="Share post"
            >
              <Share size={17} />
            </button>
          </div>
        </div>
      </div>

      {/* Report Modal */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        postId={currentPost.id}
      />
    </article>
  );
};
