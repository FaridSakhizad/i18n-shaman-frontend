import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate, useNavigate } from 'react-router-dom';
import { getApiErrorMessage, isApiError } from 'api/errors';
import { logout, resendVerificationEmail } from 'api/user';
import store, { IRootState } from 'store';
import { clearSession } from 'store/user';

import '../VerifyEmail/VerifyEmail.css';

export default function VerifyEmailRequired() {
  const dispatch = useDispatch<typeof store.dispatch>();
  const navigate = useNavigate();
  const { email, verified } = useSelector(({ user }: IRootState) => user);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleResendClick = async () => {
    if (loading) {
      return;
    }

    setLoading(true);
    setMessage(null);
    setError(null);

    const result = await resendVerificationEmail();

    if (isApiError(result)) {
      setError(getApiErrorMessage(result, 'Could not send verification email'));
    } else {
      setMessage('Verification email was sent. Please check your inbox.');
    }

    setLoading(false);
  };

  const handleLogoutClick = async () => {
    await logout();
    dispatch(clearSession());
    navigate('/auth');
  };

  if (verified) {
    return <Navigate to="/projects" replace />;
  }

  return (
    <div className="verifyEmail">
      <h3 className="h2 verifyEmail-title">Please verify your email</h3>
      {email && <p className="verifyEmail-text">{email}</p>}
      {message && <p className="verifyEmail-message">{message}</p>}
      {error && <p className="verifyEmail-error">{error}</p>}
      <div className="verifyEmail-buttons">
        <button
          type="button"
          className="button primary verifyEmail-loginButton"
          onClick={handleResendClick}
          disabled={loading}
        >
          Resend Email
        </button>
        <button
          type="button"
          className="button secondary verifyEmail-loginButton"
          onClick={handleLogoutClick}
          disabled={loading}
        >
          Logout
        </button>
      </div>
    </div>
  );
}
