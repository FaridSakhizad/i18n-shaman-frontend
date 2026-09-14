import React, { ReactElement } from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { IRootState } from 'store';

interface IProps {
  component: ReactElement,
  redirectPath?: string,
  requireVerified?: boolean,
}

export default function PrivateRoute(props: IProps) {
  const { component, redirectPath = '/', requireVerified = true } = props;

  const { id: userId, verified } = useSelector(({ user }: IRootState) => user);

  if (!userId) {
    return <Navigate to={redirectPath as string} />;
  }

  if (requireVerified && !verified) {
    return <Navigate to="/verify-email-required" />;
  }

  return component;
}
