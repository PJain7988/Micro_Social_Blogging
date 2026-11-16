import React, { useState } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Sidebar } from './Sidebar';
import { MobileHeader, MobileBottomNav } from './Navbar';
import { RightPanel } from './RightPanel';
import { Modal } from '../ui/Modal';
import { PostComposer } from '../post/PostComposer';
import { LoadingSpinner } from '../ui/LoadingSpinner';

export const AppLayout: React.FC = () => {
  const { currentUser, isLoading } = useAuth();
  const location = useLocation();
  const [isComposeModalOpen, setIsComposeModalOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // If not logged in, redirect to register/sign up page
  if (!currentUser) {
    return <Navigate to="/register" state={{ from: location }} replace />;
  }

  return (
    <div className="min-h-screen bg-paper flex justify-center selection:bg-accentSoft selection:text-accent">
      <div className="w-full max-w-[1240px] flex justify-between">
        {/* Left Sticky Sidebar (Desktop & Tablet) */}
        <Sidebar onOpenComposeModal={() => setIsComposeModalOpen(true)} />

        {/* Center Main Content Feed */}
        <main className="w-full max-w-feed min-h-screen border-r border-line bg-surface pb-20 md:pb-6 relative flex flex-col">
          <MobileHeader />
          <Outlet />
        </main>

        {/* Right Panel (Desktop only) */}
        <RightPanel />
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />

      {/* Global New Post Modal */}
      <Modal
        isOpen={isComposeModalOpen}
        onClose={() => setIsComposeModalOpen(false)}
        title="Create a new post"
        maxWidth="lg"
      >
        <PostComposer
          onSuccess={() => setIsComposeModalOpen(false)}
          placeholder="Share something with your network..."
        />
      </Modal>
    </div>
  );
};
