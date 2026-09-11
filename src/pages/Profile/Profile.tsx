import React, { useState } from 'react';

import { AppDispatch, IRootState } from 'store';
import { useDispatch, useSelector } from 'react-redux';

import Header from 'components/Header';
import Footer from 'components/Footer';
import { createSystemNotification, EMessageType } from 'store/systemNotifications';

import { validatePassword, EPasswordValidationErrors, EValidationErrors } from 'utils/validators';

import { ELoginErrorMessageTexts } from 'pages/Auth/constants';

import './Profile.css';
import { getUpdatePasswordSecurityToken, updatePassword } from 'api/user';
import { getApiErrorMessage, isApiError } from 'api/errors';

interface IPasswordUpdateErrors {
  passwordError?: string;
  newPasswordError?: string;
  confirmPasswordError?: string;
}

export default function Profile() {
  const dispatch = useDispatch<AppDispatch>();
  const { email: userEmail } = useSelector((state: IRootState) => state.user);

  const [loading, setLoading] = useState<boolean>(false);

  const [updatePasswordAttemptMade, setUpdatePasswordAttemptMade] = useState<boolean>(false);

  const [password, setPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');

  const [passwordUpdateErrors, setPasswordUpdateErrors] = useState<IPasswordUpdateErrors | null>(null);
  const [passwordUpdateGeneralError, setPasswordUpdateGeneralError] = useState<string | null>(null);

  const handlePasswordInputChange = ({ target: { value } }: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(value);

    if (!updatePasswordAttemptMade) {
      return;
    }

    const errors = { ...passwordUpdateErrors };

    if (!value || value.length === 0) {
      errors.passwordError = EPasswordValidationErrors.PASSWORD_REQUIRED;
    } else {
      delete errors.passwordError;
    }

    setPasswordUpdateErrors(errors);
  };

  const handleNewPasswordInputChange = ({ target: { value } }: React.ChangeEvent<HTMLInputElement>) => {
    setNewPassword(value);

    if (!updatePasswordAttemptMade) {
      return;
    }

    const errors = { ...passwordUpdateErrors };

    const validationResult = validatePassword(value);

    if (!validationResult.success) {
      errors.newPasswordError = validationResult.errors.length > 0 ? validationResult.errors[0].message : ELoginErrorMessageTexts.PLEASE_ENTER_VALID_PASSWORD;
    } else {
      delete errors.newPasswordError;
    }

    setPasswordUpdateErrors(errors);
  };

  const handleConfirmPasswordInputChange = ({ target: { value } }: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(value);

    if (!updatePasswordAttemptMade) {
      return;
    }

    const errors = { ...passwordUpdateErrors };

    const validationResult = validatePassword(value);

    if (!validationResult.success) {
      errors.confirmPasswordError = validationResult.errors.length > 0 ? validationResult.errors[0].message : ELoginErrorMessageTexts.PLEASE_ENTER_VALID_PASSWORD;
    } else {
      delete errors.confirmPasswordError;
    }

    setPasswordUpdateErrors(errors);
  };

  const handleNewPasswordFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (loading) {
      return;
    }

    setUpdatePasswordAttemptMade(true);

    setLoading(true);

    setPasswordUpdateErrors(null);
    setPasswordUpdateGeneralError(null);

    const errors = { ...passwordUpdateErrors };

    let abortSubmit = false;

    if (!password || password.length === 0) {
      errors.passwordError = EValidationErrors.THIS_FIELD_REQUIRED;

      abortSubmit = true;
    }

    if ((password && password.length > 0) && (newPassword !== confirmPassword)) {
      setPasswordUpdateGeneralError(EPasswordValidationErrors.PASSWORDS_DONT_MATCH);
      setLoading(false);

      return;
    }

    if (!newPassword || newPassword.length === 0) {
      errors.newPasswordError = EValidationErrors.THIS_FIELD_REQUIRED;

      abortSubmit = true;
    } else {
      const newPasswordValidationResult = validatePassword(newPassword);

      if (!newPasswordValidationResult.success) {
        errors.newPasswordError = newPasswordValidationResult.errors.length > 0 ? newPasswordValidationResult.errors[0].message : ELoginErrorMessageTexts.PLEASE_ENTER_VALID_PASSWORD;

        abortSubmit = true;
      }
    }

    if (!confirmPassword || confirmPassword.length === 0) {
      errors.confirmPasswordError = EValidationErrors.THIS_FIELD_REQUIRED;

      abortSubmit = true;
    } else {
      const confirmPasswordValidationResult = validatePassword(confirmPassword);

      if (!confirmPasswordValidationResult.success) {
        errors.confirmPasswordError = confirmPasswordValidationResult.errors.length > 0 ? confirmPasswordValidationResult.errors[0].message : ELoginErrorMessageTexts.PLEASE_ENTER_VALID_PASSWORD;

        abortSubmit = true;
      }
    }

    if (abortSubmit) {
      setLoading(false);
      setPasswordUpdateErrors(errors);

      return;
    }

    const getSecurityTokenResult = await getUpdatePasswordSecurityToken();

    if (isApiError(getSecurityTokenResult) || !getSecurityTokenResult.success) {
      setLoading(false);
      setPasswordUpdateGeneralError(getApiErrorMessage(getSecurityTokenResult, 'Error Updating Password'));

      return;
    }

    const updatePasswordResult = await updatePassword({
      securityToken: getSecurityTokenResult.data.token,
      password,
      newPassword,
      confirmPassword,
    });

    if (isApiError(updatePasswordResult) || !updatePasswordResult.success) {
      setLoading(false);
      setPasswordUpdateGeneralError(getApiErrorMessage(updatePasswordResult, 'Error Updating Password'));

      return;
    }

    setPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setUpdatePasswordAttemptMade(false);

    dispatch(createSystemNotification({
      content: 'Password Updated',
      type: EMessageType.Success,
    }));

    setLoading(false);
  };

  return (
    <>
      {loading && (
        <div className="loading" />
      )}

      <Header />
      <div className="pageHeader">
        <h1 className="h1 pageHeader-title">Profile</h1>
      </div>
      <div className="pageBody">
        <div className="container">
          <section className="pageBody-section">
            <h2 className="h2 pageBody-title">Email</h2>
            <p>{userEmail}</p>
          </section>

          <section className="pageBody-section">
            <h2 className="h2 pageBody-title">Update Password</h2>
            <form className="formMk2 updatePasswordForm" onSubmit={handleNewPasswordFormSubmit}>
              {passwordUpdateGeneralError && (
                <div className="formMk2-error">{passwordUpdateGeneralError}</div>
              )}

              <div className="formMk2-row">
                <div className="formMk2-rowTitle">
                  <label className="formMk2-rowLabel" htmlFor="profile-current-password">Password</label>
                </div>
                <div className="formMk2-rowContent">
                  <div className="formControl autoError">
                    <div className="formControl-body">
                      <div className="formControl-wrapper">
                        <input
                          type="password"
                          id="profile-current-password"
                          placeholder="Current password"
                          name="password"
                          className="input formControl-input"
                          onChange={handlePasswordInputChange}
                          value={password}
                        />
                      </div>
                    </div>
                    <div className="formControl-footer">
                      {passwordUpdateErrors && passwordUpdateErrors.passwordError && (
                        <div className="formControl-error">{passwordUpdateErrors.passwordError}</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="formMk2-row">
                <div className="formMk2-rowTitle">
                  <label className="formMk2-rowLabel" htmlFor="profile-new-password">New Password</label>
                </div>
                <div className="formMk2-rowContent">
                  <div className="formControl autoError">
                    <div className="formControl-body">
                      <div className="formControl-wrapper">
                        <input
                          type="password"
                          id="profile-new-password"
                          placeholder="New password"
                          name="password"
                          className="input formControl-input"
                          onChange={handleNewPasswordInputChange}
                          value={newPassword}
                        />
                      </div>
                    </div>
                    <div className="formControl-footer">
                      {passwordUpdateErrors && passwordUpdateErrors.newPasswordError && (
                        <div className="formControl-error">{passwordUpdateErrors.newPasswordError}</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="formMk2-row">
                <div className="formMk2-rowTitle">
                  <label className="formMk2-rowLabel" htmlFor="profile-confirm-password">Confirm New Password</label>
                </div>
                <div className="formMk2-rowContent">
                  <div className="formControl autoError">
                    <div className="formControl-body">
                      <div className="formControl-wrapper">
                        <input
                          type="password"
                          id="profile-confirm-password"
                          placeholder="Confirm New Password"
                          name="confirmPassword"
                          className="input formControl-input"
                          onChange={handleConfirmPasswordInputChange}
                          value={confirmPassword}
                        />
                      </div>
                    </div>
                    <div className="formControl-footer">
                      {passwordUpdateErrors && passwordUpdateErrors.confirmPasswordError && (
                        <div className="formControl-error">{passwordUpdateErrors.confirmPasswordError}</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="formMk2-row">
                <div className="formMk2-rowContent">
                  <button
                    type="submit"
                    className="button primary updatePasswordForm-submitButton"
                    disabled={loading}
                  >
                    Set New Password
                  </button>
                </div>
              </div>
            </form>
          </section>
        </div>
      </div>
      <Footer />
    </>
  );
}
