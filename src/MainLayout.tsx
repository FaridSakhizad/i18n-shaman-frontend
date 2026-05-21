import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import store, { IRootState } from 'store';
import { restoreSession } from 'store/user';
import { changeLanguage } from 'i18next';
import { useTranslation } from 'react-i18next';
import { getAppLanguages } from './store/app';
import SystemNotifications from './components/SystemNotifications';
import SystemBar from './components/SystemBar';

interface IProps {
  children: React.ReactNode,
}

export default function MainLayout({ children }: IProps) {
  const { i18n } = useTranslation();

  const { loading: userLoading, settings } = useSelector(({ user }: IRootState) => user);

  const dispatch = useDispatch<typeof store.dispatch>();

  const getAppData = () => {
    dispatch(getAppLanguages());
  };

  const getUserInformation = () => {
    dispatch(restoreSession());
  };

  const setUserLanguage = () => {
    const { language } = settings;

    if (language && language !== i18n.language) {
      changeLanguage(language);
    }
  };

  useEffect(() => {
    getAppData();
    getUserInformation();
    setUserLanguage();
  }, []);

  return (
    <>
      <SystemBar />
      <SystemNotifications />
      {userLoading ? (
        <div>Loading</div>
      ) : (
        // eslint-disable-next-line react/jsx-no-useless-fragment
        <>{children}</>
      )}
      <div id="modal-portal" />
    </>
  );
}
