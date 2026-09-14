import { apiClient, requestEnvelope, requestPayload } from './client';
import { IPublicUserData } from '../interfaces/user';

interface ITokenResponse {
  token: string;
  used?: boolean;
  valid?: boolean;
}

interface IMessageResponse {
  message: string;
}

export interface IRegisterUserDto {
  email: string;
  password: string;
}

export const registerUser = async ({ email, password }: IRegisterUserDto) => requestPayload<IPublicUserData>(apiClient.post('auth/register', { email, password }));

export const validateVerificationToken = async (verificationToken: string) => requestEnvelope<ITokenResponse>(apiClient.post('auth/validateVerificationToken', { verificationToken }));

export const getEmailVerificationSecurityToken = async (verificationToken: string) => requestEnvelope<ITokenResponse>(apiClient.post('auth/getEmailVerificationSecurityToken', { verificationToken }));

export const verifyEmail = async (verificationToken: string, verificationSecurityToken: string) => requestEnvelope<ITokenResponse & IMessageResponse>(apiClient.post('auth/verifyEmail', { verificationToken, verificationSecurityToken }));

export interface ILoginUserDto {
  email: string;
  password: string;
}

export const loginUser = async ({ email, password }: ILoginUserDto) => requestPayload<IPublicUserData>(apiClient.post('auth/login', { email, password }));

export const verifyUser = async () => requestPayload<IPublicUserData>(apiClient.get('auth/verifyUser'));

export const logout = async () => requestPayload<IMessageResponse>(apiClient.post('auth/logout'));

export const resendVerificationEmail = async () => requestPayload<IMessageResponse>(apiClient.post('auth/resendVerificationEmail'));

export const resetPasswordRequest = async (email: string) => requestPayload<IMessageResponse>(apiClient.post('auth/resetPasswordRequest', { email }));

export const validateResetToken = async (resetToken: string) => requestEnvelope<ITokenResponse>(apiClient.post('auth/validateResetToken', { resetToken }));

export const getPasswordResetSecurityToken = async (resetToken: string) => requestEnvelope<ITokenResponse>(apiClient.post('auth/getPasswordResetSecurityToken', { resetToken }));

export interface ISetNewPasswordDto {
  securityToken: string,
  resetToken: string,
  password: string
}

export const setNewPassword = async (data: ISetNewPasswordDto) => requestEnvelope<Record<string, unknown>>(apiClient.post('auth/setNewPassword', data));

export const getUpdatePasswordSecurityToken = async () => requestEnvelope<ITokenResponse>(apiClient.get('auth/getUpdatePasswordSecurityToken'));

export interface IUpdatePasswordDto {
  newPassword: string;
  password: string;
  confirmPassword: string;
  securityToken: string;
}

export const updatePassword = async ({
  securityToken,
  password,
  newPassword,
  confirmPassword,
}: IUpdatePasswordDto) => requestEnvelope<Record<string, unknown>>(apiClient.post('auth/updatePassword', {
  securityToken,
  password,
  newPassword,
  confirmPassword,
}));

export const setLanguage = async (language: string) => requestPayload<string>(apiClient.post('user/setLanguage', { language }));

interface IUserSettingsPreferencesData {
  projectsOrder: string[]
}

export const savePreferences = async (data: IUserSettingsPreferencesData) => requestPayload<string>(apiClient.post('user/savePreferences', { data }));
