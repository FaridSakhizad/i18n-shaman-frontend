import React from 'react';
import { Provider } from 'react-redux';
import ReactDOM from 'react-dom/client';
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from 'react-router-dom';

import './assets/styles/fonts.css';
import './assets/styles/general.css';
import './assets/styles/common.scss';

import appstore from './store';

import './i18n';

import Auth from './pages/Auth';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';

import Projects from './pages/Projects';
import Editor from './pages/Editor';
import Profile from './pages/Profile';
import Storybook from './pages/Storybook';

import MainLayout from './MainLayout';
import PrivateRoute from './PrivateRoute';
import GuestOnlyRoute from './GuestOnlyRoute';

import resetPasswordLoader from './pages/ResetPassword/loader';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/auth" replace />,
  },
  {
    path: '/auth',
    element: <GuestOnlyRoute redirectPath="/projects" component={<Auth />} />,
  },
  {
    path: '/reset-password/:resetToken?',
    element: <GuestOnlyRoute redirectPath="/projects" component={<ResetPassword />} />,
    loader: resetPasswordLoader,
  },
  {
    path: '/verify-email/:verificationToken?',
    element: <GuestOnlyRoute redirectPath="/" component={<VerifyEmail />} />,
  },
  {
    path: '/projects',
    element: <PrivateRoute component={<Projects />} />,
  },
  {
    path: '/project/:projectId/:subFolderId?',
    element: <PrivateRoute component={<Editor />} />,
  },
  {
    path: '/profile',
    element: <PrivateRoute component={<Profile />} />,
  },
  {
    path: '/storybook',
    element: <PrivateRoute component={<Storybook />} />,
  },
  {
    path: '*',
    element: <div>404</div>,
  },
]);

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);

root.render(
  <Provider store={appstore}>
    <MainLayout>
      <RouterProvider router={router} />
    </MainLayout>
  </Provider>,
);
