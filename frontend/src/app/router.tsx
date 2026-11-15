import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { ProfilePage } from '../pages/ProfilePage';
import { PostDetailPage } from '../pages/PostDetailPage';
import { ExplorePage } from '../pages/ExplorePage';
import { HashtagPage } from '../pages/HashtagPage';
import { NotificationsPage } from '../pages/NotificationsPage';
import { BookmarksPage } from '../pages/BookmarksPage';
import { FollowRequestsPage } from '../pages/FollowRequestsPage';
import { SettingsPage } from '../pages/SettingsPage';
import { ModerationPage } from '../pages/ModerationPage';
import { SearchPage } from '../pages/SearchPage';
import { RouteErrorBoundary } from '../components/common/ErrorBoundary';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'explore', element: <ExplorePage /> },
      { path: 'notifications', element: <NotificationsPage /> },
      { path: 'bookmarks', element: <BookmarksPage /> },
      { path: 'requests', element: <FollowRequestsPage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: 'moderation', element: <ModerationPage /> },
      { path: 'u/:username', element: <ProfilePage /> },
      { path: 'post/:id', element: <PostDetailPage /> },
      { path: 'tag/:tag', element: <HashtagPage /> },
      { path: 'search', element: <SearchPage /> },
    ],
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
