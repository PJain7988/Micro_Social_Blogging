import React, { useState, useRef } from 'react';
import { Image, BarChart2, Smile, X, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { useToast } from '../ui/Toast';
import { cn } from '../../utils/cn';

export interface PostComposerProps {
  onSuccess?: () => void;
  placeholder?: string;
  parentId?: string; // If composing a reply
}

export const PostComposer: React.FC<PostComposerProps> = ({
  onSuccess,
  placeholder = "What is happening?!",
  parentId,
}) => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [showPoll, setShowPoll] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_CHARS = 280;
  const remainingChars = MAX_CHARS - content.length;
  const charPercentage = Math.min(100, (content.length / MAX_CHARS) * 100);

  const isOverLimit = remainingChars < 0;
  const isPostEmpty = content.trim().length === 0 && images.length === 0;

  // Handle image upload with validation (<5MB, max 4)
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    if (images.length + files.length > 4) {
      showToast('You can attach a maximum of 4 images per post', 'error');
      return;
    }

    Array.from(files).forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        showToast(`Image ${file.name} exceeds 5 MB limit`, 'error');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImages((prev) => [...prev, event.target!.result as string].slice(0, 4));
        }
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const addPollOption = () => {
    if (pollOptions.length < 4) {
      setPollOptions((prev) => [...prev, '']);
    }
  };

  const handleSubmit = async () => {
    if (isPostEmpty || isOverLimit || isSubmitting) return;

    setIsSubmitting(true);
    try {
      let pollPayload = undefined;
      if (showPoll && pollOptions.filter((o) => o.trim()).length >= 2) {
        pollPayload = {
          question: pollQuestion.trim() || content.slice(0, 60),
          options: pollOptions.filter((o) => o.trim()),
        };
      }

      if (parentId) {
        await api.createReply(parentId, content, images);
        showToast('Reply published successfully!', 'success');
      } else {
        const post = await api.createPost(content, images, pollPayload);
        if (post.status === 'FLAGGED') {
          showToast('Post submitted. Automated AI flagged this content for review.', 'info');
        } else {
          showToast('Your post was published!', 'success');
        }
      }

      // Reset
      setContent('');
      setImages([]);
      setShowPoll(false);
      setPollQuestion('');
      setPollOptions(['', '']);
      if (onSuccess) onSuccess();
    } catch {
      showToast('Failed to create post. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 border-b border-line bg-surface flex space-x-3 transition-all">
      <Avatar
        src={currentUser?.avatar}
        alt={currentUser?.displayName || 'User'}
        size="md"
        className="shrink-0 mt-0.5"
      />

      <div className="flex-1 space-y-3 min-w-0">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className="w-full bg-transparent text-ink placeholder-mute text-base resize-none focus:outline-none"
        />

        {/* Multi-Image Preview Grid */}
        {images.length > 0 && (
          <div
            className={cn(
              'grid gap-2 rounded-2xl overflow-hidden',
              images.length === 1 && 'grid-cols-1',
              images.length === 2 && 'grid-cols-2',
              images.length >= 3 && 'grid-cols-2'
            )}
          >
            {images.map((img, idx) => (
              <div key={idx} className="relative aspect-video bg-paper rounded-xl overflow-hidden group">
                <img src={img} alt="Upload preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-ink/70 text-white hover:bg-ink transition-colors"
                  aria-label="Remove image"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Poll Creation Builder */}
        {showPoll && (
          <div className="p-3 bg-paper rounded-xl border border-line space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-ink">Create a Poll</span>
              <button
                onClick={() => setShowPoll(false)}
                className="text-mute hover:text-ink text-xs font-semibold"
              >
                Remove
              </button>
            </div>
            <input
              type="text"
              placeholder="Ask a question..."
              value={pollQuestion}
              onChange={(e) => setPollQuestion(e.target.value)}
              className="w-full text-xs p-2 rounded-lg border border-line bg-surface text-ink focus:outline-none focus:border-accent"
            />
            {pollOptions.map((opt, i) => (
              <input
                key={i}
                type="text"
                placeholder={`Option ${i + 1}`}
                value={opt}
                onChange={(e) => {
                  const copy = [...pollOptions];
                  copy[i] = e.target.value;
                  setPollOptions(copy);
                }}
                className="w-full text-xs p-2 rounded-lg border border-line bg-surface text-ink focus:outline-none focus:border-accent"
              />
            ))}
            {pollOptions.length < 4 && (
              <button
                type="button"
                onClick={addPollOption}
                className="text-xs text-accent font-semibold hover:underline"
              >
                + Add option
              </button>
            )}
          </div>
        )}

        {/* AI Content Notice for suspicious keywords */}
        {content.toLowerCase().includes('scam') && (
          <div className="flex items-center space-x-2 text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 p-2.5 rounded-xl border border-amber-200 dark:border-amber-800/50 text-xs font-medium">
            <AlertTriangle size={16} className="shrink-0" />
            <span>AI Safety Notice: This post contains terms that may trigger automated moderation flags.</span>
          </div>
        )}

        {/* Actions Toolbar */}
        <div className="flex items-center justify-between pt-2 border-t border-line/60">
          <div className="flex items-center space-x-1 text-accent">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageSelect}
              multiple
              accept="image/png, image/jpeg, image/webp"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={images.length >= 4}
              className="p-2 rounded-full hover:bg-accentSoft transition-colors disabled:opacity-40"
              title="Attach Images (Max 4)"
              aria-label="Attach Images"
            >
              <Image size={18} />
            </button>
            <button
              type="button"
              onClick={() => setShowPoll(!showPoll)}
              className="p-2 rounded-full hover:bg-accentSoft transition-colors"
              title="Add Poll"
              aria-label="Add Poll"
            >
              <BarChart2 size={18} />
            </button>
            <button
              type="button"
              onClick={() => setContent((prev) => prev + ' 🚀')}
              className="p-2 rounded-full hover:bg-accentSoft transition-colors"
              title="Add Emoji"
              aria-label="Add Emoji"
            >
              <Smile size={18} />
            </button>
          </div>

          <div className="flex items-center space-x-3">
            {/* Radial SVG Character Counter */}
            {content.length > 0 && (
              <div className="flex items-center space-x-1.5">
                <div className="relative w-6 h-6 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-line"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className={cn(
                        'transition-all duration-200',
                        isOverLimit
                          ? 'text-danger'
                          : remainingChars <= 20
                          ? 'text-amber-500'
                          : 'text-accent'
                      )}
                      strokeDasharray={`${charPercentage}, 100`}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                </div>
                {remainingChars <= 20 && (
                  <span
                    className={cn(
                      'text-xs font-bold',
                      isOverLimit ? 'text-danger' : 'text-amber-600'
                    )}
                  >
                    {remainingChars}
                  </span>
                )}
              </div>
            )}

            <Button
              onClick={handleSubmit}
              disabled={isPostEmpty || isOverLimit || isSubmitting}
              isLoading={isSubmitting}
              size="sm"
              className="px-5 font-bold"
            >
              {parentId ? 'Reply' : 'Post'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
