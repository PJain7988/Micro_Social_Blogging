import "./profile.css";

type ProfileHeaderProps = {
  name: string;
  username: string;
  bio: string;
  location?: string;
  joined?: string;
  following: number;
  followers: number;
  avatarUrl?: string;
  coverUrl?: string;
  onEdit?: () => void;
  onFollowingClick?: () => void;
  onFollowersClick?: () => void;
};

const PinIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z" /><circle cx="12" cy="10" r="2.5" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" />
  </svg>
);

export default function ProfileHeader({
  name, username, bio, location, joined, following, followers,
  avatarUrl, coverUrl, onEdit, onFollowingClick, onFollowersClick,
}: ProfileHeaderProps) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="profile-card">
      <div
        className="profile-cover"
        style={coverUrl ? { backgroundImage: `url(${coverUrl})` } : undefined}
      />
      <div className="profile-body">
        <div className="profile-top">
          <div className="profile-avatar">
            {avatarUrl ? <img src={avatarUrl} alt={`${name}'s avatar`} /> : initials}
          </div>
          <button className="profile-edit" onClick={onEdit}>Edit Profile</button>
        </div>

        <h1 className="profile-name">{name}</h1>
        <p className="profile-handle">@{username}</p>
        <p className="profile-bio">{bio}</p>

        <div className="profile-meta">
          {location && <span><PinIcon /> {location}</span>}
          {joined && <span><CalendarIcon /> Joined {joined}</span>}
        </div>

        <div className="profile-stats">
          <button onClick={onFollowingClick}><strong>{following.toLocaleString()}</strong>Following</button>
          <button onClick={onFollowersClick}><strong>{followers.toLocaleString()}</strong>Followers</button>
        </div>
      </div>
    </div>
  );
}