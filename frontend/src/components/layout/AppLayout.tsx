import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { MobileHeader, MobileBottomNav } from './Navbar';
import { RightPanel } from './RightPanel';
import { Modal } from '../ui/Modal';
import { PostComposer } from '../post/PostComposer';

export const AppLayout: React.FC = () => {
  const [isComposeModalOpen, setIsComposeModalOpen] = useState(false);

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
