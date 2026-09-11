import React, { useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';

import './ResetPassword.css';
import { getPasswordResetSecurityToken, setNewPassword } from 'api/user';
import { getApiErrorMessage, getApiErrorStatus, isApiError } from 'api/errors';
import { EPasswordValidationErrors, validatePassword } from 'utils/validators';
import Modal from 'components/Modal';

export default function ResetPassword() {
  const { resetToken } = useParams<{ resetToken: string }>();
  const navigate = useNavigate();
  const isResetTokenInvalid = !resetToken || resetToken.length < 1;

  const [submitAttemptMade, setSubmitAttemptMade] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const [formGeneralError, setFormGeneralError] = useState<string | null>(null);
  const [showResetSuccess, setShowResetSuccess] = useState<boolean>(false);

  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');

  const handleSetNewPwdFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (loading) {
      return;
    }

    setSubmitAttemptMade(true);
    setFormGeneralError(null);

    if (isResetTokenInvalid || !resetToken) {
      return;
    }

    if (!password || !confirmPassword) {
      setFormGeneralError(EPasswordValidationErrors.BOTH_PASSWORDS_REQUIRED);

      return;
    }

    if (password !== confirmPassword) {
      setFormGeneralError(EPasswordValidationErrors.PASSWORDS_DONT_MATCH);

      return;
    }

    const validationResult = validatePassword(password);

    if (!validationResult.success) {
      setFormGeneralError(validationResult.errors ? validationResult.errors[0].message : EPasswordValidationErrors.INVALID);

      return;
    }

    setLoading(true);

    const getSecurityTokenResult = await getPasswordResetSecurityToken(resetToken);

    if (isApiError(getSecurityTokenResult) || !getSecurityTokenResult.success) {
      setFormGeneralError(getApiErrorMessage(getSecurityTokenResult, 'Unknown Error'));
      setLoading(false);

      return;
    }

    const { data: { token } } = getSecurityTokenResult;

    const result = await setNewPassword({
      password,
      securityToken: token,
      resetToken,
    });

    if (!isApiError(result) && result.success) {
      setShowResetSuccess(true);
      setLoading(false);

      return;
    }

    if (getApiErrorStatus(result) === 403) {
      setLoading(false);
      navigate('/');

      return;
    }

    if (getApiErrorStatus(result) === 400) {
      setFormGeneralError(EPasswordValidationErrors.INVALID);
      setLoading(false);

      return;
    }

    setLoading(false);
    navigate('/');
  };

  const handlePasswordFieldChange = ({ target: { value } }: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(value);
    setFormGeneralError(null);

    if (!submitAttemptMade) {
      return;
    }

    if (!value || !confirmPassword) {
      setFormGeneralError(EPasswordValidationErrors.BOTH_PASSWORDS_REQUIRED);

      return;
    }

    if (value !== confirmPassword) {
      setFormGeneralError(EPasswordValidationErrors.PASSWORDS_DONT_MATCH);

      return;
    }

    const validationResult = validatePassword(value);

    if (!validationResult.success) {
      setFormGeneralError(validationResult.errors ? validationResult.errors[0].message : EPasswordValidationErrors.INVALID);
    }
  };

  const handleConfirmPasswordFieldChange = ({ target: { value } }: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(value);
    setFormGeneralError(null);

    if (!submitAttemptMade) {
      return;
    }

    if (!password || !value) {
      setFormGeneralError(EPasswordValidationErrors.BOTH_PASSWORDS_REQUIRED);

      return;
    }

    if (password !== value) {
      setFormGeneralError(EPasswordValidationErrors.PASSWORDS_DONT_MATCH);

      return;
    }

    const validationResult = validatePassword(value);

    if (!validationResult.success) {
      setFormGeneralError(validationResult.errors ? validationResult.errors[0].message : EPasswordValidationErrors.INVALID);
    }
  };

  if (isResetTokenInvalid) {
    return <Navigate to="/" replace />;
  }

  if (showResetSuccess) {
    return (
      <Modal customClassNames="modal_withBottomButtons modal_signupSuccess">
        <div className="modal-header">
          <h2 className="h2 modal-title success">Password Reset Successful</h2>
        </div>
        <div className="modal-content">
          <p>If your email is not verified yet, please check your inbox and confirm it before logging in.</p>
          <a
            href="/auth"
            type="button"
            className="button success signupSuccess-loginButton"
          >
            Login to Website
          </a>
        </div>
      </Modal>
    );
  }

  return (
    <div className="setNewPwdPage">
      {loading && (
        <div className="loading" />
      )}

      <div className="modal-window modal-window_resetPwd">
        <div className="modal-header">
          <h2 className="h2">Set new password</h2>
        </div>

        <form className="formMk1 setNewPwdForm" onSubmit={handleSetNewPwdFormSubmit}>
          {formGeneralError && (
            <div className="formMk1-error">
              {formGeneralError}
            </div>
          )}

          <div className="formMk1-row">
            <div className="formControl">
              <div className="formControl-header">
                <label className="formControl-label" htmlFor="reset-new-password">New Password</label>
              </div>
              <div className="formControl-body">
                <div className="formControl-wrapper">
                  <input
                    type="password"
                    id="reset-new-password"
                    placeholder="New Password please"
                    name="password"
                    className="input formControl-input"
                    onChange={handlePasswordFieldChange}
                  />
                </div>
              </div>
              <div className="formControl-footer">
              </div>
            </div>

          </div>

          <div className="formMk1-row">
            <div className="formControl">
              <div className="formControl-header">
                <label className="formControl-label" htmlFor="reset-confirm-password">Confirm Password</label>
              </div>
              <div className="formControl-body">
                <div className="formControl-wrapper">
                  <input
                    type="password"
                    id="reset-confirm-password"
                    placeholder="Confirm Your New Password please"
                    name="confirm_password"
                    className="input formControl-input"
                    onChange={handleConfirmPasswordFieldChange}
                  />
                </div>
              </div>
              <div className="formControl-footer">
              </div>
            </div>
          </div>

          <div className="formMk1-row setNewPwdForm-row_controls">
            <button
              type="submit"
              className="button primary setNewPwdForm-submitButton"
              disabled={loading}
            >
              Set New Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
