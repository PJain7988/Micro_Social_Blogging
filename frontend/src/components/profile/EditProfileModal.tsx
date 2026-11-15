import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { User } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../ui/Toast';
import { Camera, Lock } from 'lucide-react';

export interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  user,
}) => {
  const { updateUser } = useAuth();
  const { showToast } = useToast();

  const [displayName, setDisplayName] = useState(user.displayName);
  const [bio, setBio] = useState(user.bio || '');
  const [location, setLocation] = useState(user.location || '');
  const [website, setWebsite] = useState(user.website || '');
  const [avatar, setAvatar] = useState(user.avatar || '');
  const [isPrivate, setIsPrivate] = useState(user.isPrivate);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ displayName?: string; bio?: string }>({});

  const MAX_BIO = 160;

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      showToast('Avatar image must be smaller than 2 MB', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setAvatar(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { displayName?: string; bio?: string } = {};

    if (!displayName.trim()) {
      newErrors.displayName = 'Display name cannot be empty';
    }

    if (bio.length > MAX_BIO) {
      newErrors.bio = `Bio cannot exceed ${MAX_BIO} characters`;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await updateUser({
        displayName: displayName.trim(),
        bio: bio.trim(),
        location: location.trim(),
        website: website.trim(),
        avatar,
        isPrivate,
      });
      showToast('Profile updated successfully!', 'success');
      onClose();
    } catch {
      showToast('Failed to update profile', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Profile" maxWidth="md">
      <form onSubmit={handleSave} className="space-y-4">
        {/* Avatar Preview with Camera Overlay */}
        <div className="flex items-center space-x-4 pb-2">
          <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-line bg-paper group">
            <img src={avatar} alt="Avatar Preview" className="w-full h-full object-cover" />
            <label className="absolute inset-0 bg-ink/40 flex items-center justify-center cursor-pointer opacity-80 hover:opacity-100 transition-opacity">
              <Camera size={22} className="text-white" />
              <input
                type="file"
                accept="image/png, image/jpeg, image/webp"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </label>
          </div>
          <div>
            <p className="text-sm font-bold text-ink">Profile Picture</p>
            <p className="text-xs text-mute">JPG, PNG, or WebP. Max 2 MB.</p>
          </div>
        </div>

        <Input
          label="Display Name"
          value={displayName}
          onChange={(e) => {
            setDisplayName(e.target.value);
            if (errors.displayName) setErrors({});
          }}
          error={errors.displayName}
          maxLength={50}
        />

        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <label className="text-xs font-semibold text-mute uppercase tracking-wide">Bio</label>
            <span className={`text-xs ${bio.length > MAX_BIO ? 'text-danger font-bold' : 'text-mute'}`}>
              {MAX_BIO - bio.length} left
            </span>
          </div>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            placeholder="Tell the world about yourself..."
            className="w-full rounded-lg border border-line bg-surface p-2.5 text-sm text-ink placeholder-mute focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
          />
          {errors.bio && <p className="text-xs text-danger font-medium">{errors.bio}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="City, Country"
          />
          <Input
            label="Website"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://..."
          />
        </div>

        {/* Private Account Switch */}
        <div className="pt-2 border-t border-line">
          <div className="flex items-center justify-between p-3 bg-paper rounded-xl border border-line">
            <div className="flex items-center space-x-2.5">
              <Lock size={18} className="text-accent" />
              <div>
                <p className="text-xs font-bold text-ink">Private Account</p>
                <p className="text-[11px] text-mute">
                  Only approved followers can view your posts and details.
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
              className="w-4 h-4 text-accent rounded border-line focus:ring-accent cursor-pointer"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-3 border-t border-line">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
};
