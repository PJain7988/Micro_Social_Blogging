import React from 'react';
import { Link } from 'react-router-dom';

export interface RichTextProps {
  content: string;
  className?: string;
}

export const RichText: React.FC<RichTextProps> = ({ content, className = '' }) => {
  // Regex splitting by hashtags and mentions while preserving matching tokens
  // Matches #hashtag (letters/underscores, must not be purely digits) and @username
  const regex = /((?:#(?!\d+\b)[a-zA-Z0-9_]{1,50})|(?:@[a-zA-Z0-9_]{3,20}))/g;

  const parts = content.split(regex);

  return (
    <span className={`break-words whitespace-pre-wrap leading-relaxed ${className}`}>
      {parts.map((part, index) => {
        if (!part) return null;

        if (part.startsWith('#')) {
          const tag = part.slice(1).toLowerCase();
          return (
            <Link
              key={index}
              to={`/tag/${tag}`}
              onClick={(e) => e.stopPropagation()}
              className="text-accent hover:underline font-medium"
            >
              {part}
            </Link>
          );
        }

        if (part.startsWith('@')) {
          const username = part.slice(1);
          return (
            <Link
              key={index}
              to={`/u/${username}`}
              onClick={(e) => e.stopPropagation()}
              className="text-accent hover:underline font-medium"
            >
              {part}
            </Link>
          );
        }

        return <span key={index}>{part}</span>;
      })}
    </span>
  );
};
