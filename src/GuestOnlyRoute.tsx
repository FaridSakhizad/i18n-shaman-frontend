import React, { ReactElement } from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { IRootState } from 'store';

interface IProps {
  component: ReactElement,
  redirectPath?: string,
}

export default function GuestOnlyRoute(props: IProps) {
  const { component, redirectPath = '/' } = props;

  const { id: userId, verified } = useSelector(({ user }: IRootState) => user);

  if (!userId) {
    return component;
  }

  return <Navigate to={(verified ? redirectPath : '/verify-email-required') as string} />;
}
