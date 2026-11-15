import { useState } from "react";

const TABS = ["Posts", "Replies", "Media", "Likes"] as const;
type Tab = (typeof TABS)[number];

type ProfileTabsProps = { name: string; username: string };

export default function ProfileTabs({ name, username }: ProfileTabsProps) {
  const [active, setActive] = useState<Tab>("Posts");
  const initials = name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div>
      <div className="profile-tabs" role="tablist">
        {TABS.map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={active === t}
            className={`profile-tab${active === t ? " active" : ""}`}
            onClick={() => setActive(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {active === "Posts" ? (
        <div className="profile-post">
          <div className="post-avatar">{initials}</div>
          <div>
            <div className="post-head">
              {name}<span>@{username} · 1d</span>
            </div>
            <p className="post-text">
              Completed the UI design for our Microblog project!{" "}
              <span className="post-tag">#UIUX #Microblog</span>
            </p>
          </div>
        </div>
      ) : (
        <div className="profile-empty">Nothing in {active} yet.</div>
      )}
    </div>
  );
}