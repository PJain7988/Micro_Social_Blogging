import { useState } from "react";

export type Person = { id: number; name: string; username: string };

type FollowListProps = {
  title: string;
  people: Person[];
  onClose: () => void;
};

const initialsOf = (name: string) =>
  name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

export default function FollowList({ title, people, onClose }: FollowListProps) {
  const [following, setFollowing] = useState<Set<number>>(new Set());

  const toggle = (id: number) =>
    setFollowing((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div className="fl-backdrop" onClick={onClose}>
      <div className="fl-modal" role="dialog" aria-label={title} onClick={(e) => e.stopPropagation()}>
        <div className="fl-head">
          <h2>{title}</h2>
          <button className="fl-close" onClick={onClose} aria-label="Close">×</button>
        </div>
        <div className="fl-list">
          {people.length === 0 && <div className="profile-empty">No one here yet.</div>}
          {people.map((p) => (
            <div className="fl-item" key={p.id}>
              <div className="fl-avatar">{initialsOf(p.name)}</div>
              <div className="fl-info">
                <div className="fl-name">{p.name}</div>
                <div className="fl-handle">@{p.username}</div>
              </div>
              <button className={`fl-btn${following.has(p.id) ? " on" : ""}`} onClick={() => toggle(p.id)}>
                {following.has(p.id) ? "Following" : "Follow"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}