import React, { useState, useEffect } from 'react';
import { ShieldAlert, CheckCircle2, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { ModerationQueueItem } from '../types';
import { api } from '../services/api';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { useToast } from '../components/ui/Toast';
import { formatRelativeTime } from '../utils/time';

export const ModerationPage: React.FC = () => {
  const [queue, setQueue] = useState<ModerationQueueItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { showToast } = useToast();

  const fetchQueue = async () => {
    setIsLoading(true);
    try {
      const items = await api.getModerationQueue();
      setQueue(Array.isArray(items) ? items.filter((item) => item.status === 'FLAGGED') : []);
    } catch {
      setQueue([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleAction = async (id: string, action: 'APPROVE' | 'REJECT') => {
    await api.actOnModeration(id, action);
    setQueue((prev) => prev.filter((item) => item.id !== id));
    showToast(
      action === 'APPROVE'
        ? 'Post approved and restored to public feed'
        : 'Post rejected and blocked from publication',
      action === 'APPROVE' ? 'success' : 'info'
    );
  };

  return (
    <div>
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-surface/90 backdrop-blur-md border-b border-line">
        <div className="flex items-center space-x-2">
          <ShieldAlert size={22} className="text-danger" />
          <div>
            <h2 className="text-lg font-black text-ink">AI Moderation Dashboard</h2>
            <p className="text-xs text-mute">Review and act on flagged community content</p>
          </div>
        </div>

        <button
          onClick={fetchQueue}
          className="p-2 rounded-full hover:bg-paper text-mute hover:text-ink transition-colors"
          title="Refresh Queue"
          aria-label="Refresh Queue"
        >
          <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-3 gap-3 p-4 border-b border-line bg-paper/40">
        <div className="p-3 bg-surface rounded-xl border border-line text-center">
          <p className="text-xs text-mute font-bold uppercase">Pending</p>
          <p className="text-xl font-black text-danger mt-0.5">{queue.length}</p>
        </div>
        <div className="p-3 bg-surface rounded-xl border border-line text-center">
          <p className="text-xs text-mute font-bold uppercase">Reviewed Today</p>
          <p className="text-xl font-black text-ink mt-0.5">24</p>
        </div>
        <div className="p-3 bg-surface rounded-xl border border-line text-center">
          <p className="text-xs text-mute font-bold uppercase">Avg AI Score</p>
          <p className="text-xl font-black text-accent mt-0.5">0.86</p>
        </div>
      </div>

      {/* Flagged Items Stream */}
      {queue.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title="Moderation queue clear!"
          description="Zero flagged posts awaiting manual inspection. All published content passes safety thresholds."
        />
      ) : (
        <div className="divide-y divide-line">
          {queue.map((item) => (
            <div key={item.id} className="p-5 space-y-3.5 bg-surface hover:bg-paper/20 transition-colors">
              {/* Top Meta */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Badge variant="danger" className="font-bold">
                    FLAGGED BY AI
                  </Badge>
                  <span className="text-xs font-bold text-mute">
                    Reported {item.reportedCount} times
                  </span>
                </div>
                <span className="text-xs text-mute">
                  {formatRelativeTime(item.createdAt)}
                </span>
              </div>

              {/* Author & Risk Score Bar */}
              <div className="flex items-center justify-between p-3 bg-red-50/60 dark:bg-red-950/30 rounded-xl border border-red-100 dark:border-red-900/50">
                <div className="flex items-center space-x-2.5">
                  <Avatar src={item.post.author.avatar} alt={item.post.author.displayName} size="sm" />
                  <div>
                    <p className="text-xs font-bold text-ink">{item.post.author.displayName}</p>
                    <p className="text-[11px] text-mute">@{item.post.author.username}</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-xs font-bold text-danger">
                    Toxicity Risk: {Math.round(item.toxicityScore * 100)}%
                  </p>
                  <p className="text-[10px] text-mute">{item.reason}</p>
                </div>
              </div>

              {/* Content Box */}
              <div className="p-3 bg-paper rounded-xl border border-line">
                <p className="text-sm text-ink leading-relaxed font-mono">
                  {item.post.content}
                </p>
              </div>

              {/* Category Tags */}
              <div className="flex flex-wrap gap-1.5">
                {item.categories.map((cat, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 bg-paper rounded-md border border-line text-[11px] font-semibold text-mute"
                  >
                    #{cat}
                  </span>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-2.5 pt-2 border-t border-line/60">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleAction(item.id, 'APPROVE')}
                  className="text-xs px-4 border-line hover:bg-green-50 dark:hover:bg-green-950/40 hover:text-green-700 dark:hover:text-green-400 hover:border-green-300 dark:hover:border-green-800"
                >
                  <CheckCircle2 size={15} className="mr-1.5 text-success" />
                  <span>Approve &amp; Publish</span>
                </Button>

                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => handleAction(item.id, 'REJECT')}
                  className="text-xs px-4"
                >
                  <XCircle size={15} className="mr-1.5" />
                  <span>Reject &amp; Remove</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
