import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FollowRequest } from '../types';
import { api } from '../services/api';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { UserCheck, Check, X } from 'lucide-react';
import { useToast } from '../components/ui/Toast';

export const FollowRequestsPage: React.FC = () => {
  const [requests, setRequests] = useState<FollowRequest[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const list = await api.getFollowRequests();
      setRequests(Array.isArray(list) ? list : []);
    } catch {
      setRequests([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (id: string, username: string) => {
    await api.approveFollowRequest(id);
    setRequests((prev) => prev.filter((r) => r.id !== id));
    showToast(`Approved follow request from @${username}`, 'success');
  };

  const handleReject = async (id: string) => {
    await api.rejectFollowRequest(id);
    setRequests((prev) => prev.filter((r) => r.id !== id));
    showToast('Follow request declined', 'info');
  };

  return (
    <div>
      <div className="sticky top-0 z-30 px-4 py-3 bg-surface/90 backdrop-blur-md border-b border-line">
        <h2 className="text-xl font-black text-ink">Follow Requests</h2>
        <p className="text-xs text-mute">Manage who can see your private posts and activity</p>
      </div>

      {requests.length === 0 ? (
        <EmptyState
          icon={UserCheck}
          title="No pending requests"
          description="When someone requests to follow your private account, they will appear here for your review."
        />
      ) : (
        <div className="divide-y divide-line">
          {requests.map((req) => (
            <div key={req.id} className="p-4 flex items-center justify-between hover:bg-paper/30 transition-colors">
              <div
                className="flex items-center space-x-3 cursor-pointer group"
                onClick={() => navigate(`/u/${req.requester.username}`)}
              >
                <Avatar src={req.requester.avatar} alt={req.requester.displayName} size="md" />
                <div>
                  <p className="text-sm font-bold text-ink group-hover:underline">
                    {req.requester.displayName}
                  </p>
                  <p className="text-xs text-mute">@{req.requester.username}</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => handleApprove(req.id, req.requester.username)}
                  className="flex items-center space-x-1 px-3 py-1.5"
                >
                  <Check size={14} />
                  <span>Approve</span>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleReject(req.id)}
                  className="p-1.5 text-mute hover:text-danger hover:border-red-200"
                  aria-label="Decline request"
                >
                  <X size={16} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
