import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Link, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getEmailVerificationSecurityToken, verifyEmail } from 'api/user';
import { isApiError } from 'api/errors';
import { trackEvent } from 'api/tracking';

import store, { IRootState } from 'store';
import { restoreSession } from 'store/user';

import './VerifyEmail.css';

export default function VerifyEmail() {
  const { verificationToken = '' } = useParams<{ verificationToken: string }>();

  const dispatch = useDispatch<typeof store.dispatch>();

  const { id: userId } = useSelector(({ user }: IRootState) => user);
  const handledVerificationTokenRef = useRef<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [verificationSuccess, setVerificationSuccess] = useState(false);

  const performVerification = useCallback(async () => {
    const getSecurityTokenResult = await getEmailVerificationSecurityToken(verificationToken);

    if (isApiError(getSecurityTokenResult) || !getSecurityTokenResult.success) {
      setLoading(false);

      return;
    }

    const verificationResult = await verifyEmail(verificationToken, getSecurityTokenResult.data.token);

    if (isApiError(verificationResult) || !verificationResult.success) {
      setLoading(false);

      return;
    }

    if (userId) {
      await dispatch(restoreSession());
    }

    void trackEvent('email_verified');

    setVerificationSuccess(true);
    setLoading(false);
  }, [dispatch, userId, verificationToken]);

  useEffect(() => {
    if (!verificationToken || verificationToken.length < 1) {
      setLoading(false);

      return;
    }

    if (handledVerificationTokenRef.current === verificationToken) {
      return;
    }

    handledVerificationTokenRef.current = verificationToken;
    performVerification();
  }, [performVerification, verificationToken]);

  if (loading) {
    return (
      <div className="verifyEmail">
        <div className="loading" />
      </div>
    );
  }

  if (!verificationSuccess) {
    return (
      <div className="verifyEmail">
        <h3 className="h4 verifyEmail-title">Email verification link is invalid</h3>

        <div className="verifyEmail-buttons">
          <Link to="/auth" replace className="button secondary verifyEmail-loginButton">Login</Link>
          <Link to="/auth#register" replace className="button secondary verifyEmail-loginButton">Register</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="verifyEmail">
      <h3 className="h2 verifyEmail-title">Your email verified successfully</h3>

      <Link to={userId ? '/projects' : '/auth'} replace className="button primary verifyEmail-loginButton">
        {userId ? 'Continue' : 'Login to Site'}
      </Link>
    </div>
  );
}
