import React, { Suspense, lazy } from 'react';
import {
  createBrowserRouter,
  Navigate,
} from 'react-router-dom';

import PrivateRoute from './PrivateRoute';
import GuestOnlyRoute from './GuestOnlyRoute';

import resetPasswordLoader from './pages/ResetPassword/loader';

const Auth = lazy(() => import('./pages/Auth'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));
const VerifyEmailRequired = lazy(() => import('./pages/VerifyEmailRequired'));
const Projects = lazy(() => import('./pages/Projects'));
const Editor = lazy(() => import('./pages/Editor'));
const Profile = lazy(() => import('./pages/Profile'));
const Storybook = lazy(() => import('./pages/Storybook'));

const withPageFallback = (page: React.ReactNode) => (
  <Suspense fallback={<div>Loading</div>}>
    {page}
  </Suspense>
);

const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/auth" replace />,
  },
  {
    path: '/auth',
    element: <GuestOnlyRoute redirectPath="/projects" component={withPageFallback(<Auth />)} />,
  },
  {
    path: '/reset-password/:resetToken?',
    element: <GuestOnlyRoute redirectPath="/projects" component={withPageFallback(<ResetPassword />)} />,
    loader: resetPasswordLoader,
  },
  {
    path: '/verify-email/:verificationToken?',
    element: withPageFallback(<VerifyEmail />),
  },
  {
    path: '/verify-email-required',
    element: <PrivateRoute requireVerified={false} component={withPageFallback(<VerifyEmailRequired />)} />,
  },
  {
    path: '/projects',
    element: <PrivateRoute component={withPageFallback(<Projects />)} />,
  },
  {
    path: '/project/:projectId/:subFolderId?',
    element: <PrivateRoute component={withPageFallback(<Editor />)} />,
  },
  {
    path: '/profile',
    element: <PrivateRoute component={withPageFallback(<Profile />)} />,
  },
  {
    path: '/storybook',
    element: <PrivateRoute component={withPageFallback(<Storybook />)} />,
  },
  {
    path: '*',
    element: <div>404</div>,
  },
]);

export default router;
