import { useState } from "react";
import ProfileHeader from "./ProfileHeader";
import ProfileTabs from "./ProfileTabs";
import FollowList from "./FollowList";
import type { Person } from "./FollowList";
import "./profile.css";

// Sample data for now. Replace with the profile and follow APIs when they are ready.
const sampleUser = {
  name: "Nikhil Khuraijam",
  username: "nikhil_k",
  bio: "MCA Student | Cybersecurity Enthusiast | Tech Learner",
  location: "Panipat, India",
  joined: "Jun 2025",
  following: 120,
  followers: 86,
};

const samplePeople: Person[] = [
  { id: 1, name: "Priya Sharma", username: "priya_s" },
  { id: 2, name: "Rahul Dev", username: "rahuldev" },
  { id: 3, name: "Anjali Verma", username: "anjali_v" },
  { id: 4, name: "Rohit Das", username: "rohit_d" },
];

export default function Profile() {
  const [open, setOpen] = useState<"following" | "followers" | null>(null);

  return (
    <div className="profile-page">
      <div className="profile-column">
        <ProfileHeader
          {...sampleUser}
          onEdit={() => alert("Edit form is built by Member 4")}
          onFollowingClick={() => setOpen("following")}
          onFollowersClick={() => setOpen("followers")}
        />
        <ProfileTabs name={sampleUser.name} username={sampleUser.username} />
      </div>

      {open && (
        <FollowList
          title={open === "following" ? "Following" : "Followers"}
          people={samplePeople}
          onClose={() => setOpen(null)}
        />
      )}
    </div>
  );
}