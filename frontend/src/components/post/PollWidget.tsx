import React, { useState } from 'react';
import { Poll } from '../../types';
import { api } from '../../services/api';
import { CheckCircle2 } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface PollWidgetProps {
  postId: string;
  poll: Poll;
  onVoteSuccess?: (updatedPoll: Poll) => void;
}

export const PollWidget: React.FC<PollWidgetProps> = ({ postId, poll, onVoteSuccess }) => {
  const [selectedOptionId, setSelectedOptionId] = useState<string | undefined>(poll.userVotedOptionId);
  const [isVoting, setIsVoting] = useState(false);

  const hasVoted = !!selectedOptionId;

  const handleVote = async (optionId: string) => {
    if (hasVoted || isVoting) return;
    setIsVoting(true);
    try {
      const updated = await api.votePoll(postId, optionId);
      setSelectedOptionId(optionId);
      if (onVoteSuccess) onVoteSuccess(updated);
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <div className="my-3 p-3.5 bg-paper rounded-xl border border-line space-y-2.5">
      <p className="text-sm font-semibold text-ink">{poll.question}</p>

      <div className="space-y-2">
        {poll.options.map((option) => {
          const percentage = poll.totalVotes > 0
            ? Math.round((option.votesCount / poll.totalVotes) * 100)
            : 0;
          const isSelected = selectedOptionId === option.id;

          return (
            <div
              key={option.id}
              onClick={() => !hasVoted && handleVote(option.id)}
              className={cn(
                'relative overflow-hidden rounded-lg p-2.5 transition-all text-xs font-semibold flex items-center justify-between',
                hasVoted
                  ? 'bg-surface border border-line cursor-default'
                  : 'bg-surface hover:bg-accentSoft hover:border-accent border border-line cursor-pointer'
              )}
            >
              {/* Animated Progress Bar Fill */}
              {hasVoted && (
                <div
                  className={cn(
                    'absolute left-0 top-0 bottom-0 transition-all duration-500 ease-out opacity-25',
                    isSelected ? 'bg-accent' : 'bg-mute'
                  )}
                  style={{ width: `${percentage}%` }}
                />
              )}

              <div className="relative z-10 flex items-center space-x-2 truncate pr-2">
                {isSelected && <CheckCircle2 size={15} className="text-accent shrink-0" />}
                <span className={isSelected ? 'text-accent font-bold' : 'text-ink'}>
                  {option.text}
                </span>
              </div>

              {hasVoted && (
                <span className="relative z-10 font-bold text-mute ml-2">
                  {percentage}%
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div className="text-[11px] text-mute flex items-center justify-between pt-1">
        <span>{poll.totalVotes.toLocaleString()} votes</span>
        <span>Poll closes in 24 hours</span>
      </div>
    </div>
  );
};
