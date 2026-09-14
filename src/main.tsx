import React from 'react';

import { Provider } from 'react-redux';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';

import './assets/styles/fonts.css';
import './assets/styles/general.css';
import './assets/styles/common.scss';

import appstore from './store';
import router from './router';
import { trackEvent } from './api/tracking';

import './i18n';

import MainLayout from './MainLayout';

void trackEvent('app_opened');

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
