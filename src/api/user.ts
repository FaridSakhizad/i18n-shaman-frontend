import { apiClient } from './client';
import { unwrapApiResponse } from './errors';

export interface IRegisterUserDto {
  email: string;
  password: string;
}

export const registerUser = async ({ email, password }: IRegisterUserDto) => {
  try {
    return unwrapApiResponse((await apiClient.post('auth/register', {
      email,
      password,
    })).data);
  } catch (error: any) {
    return error.response && error.response.data;
  }
};

export const validateVerificationToken = async (verificationToken: string) => {
  try {
    return (await apiClient.post('auth/validateVerificationToken', { verificationToken })).data;
  } catch (error: any) {
    return error.response && error.response.data;
  }
};

export const getEmailVerificationSecurityToken = async (verificationToken: string) => {
  try {
    return (await apiClient.post('auth/getEmailVerificationSecurityToken', { verificationToken })).data;
  } catch (error: any) {
    return error.response && error.response.data;
  }
};

export const verifyEmail = async (verificationToken: string, verificationSecurityToken: string) => {
  try {
    return (await apiClient.post('auth/verifyEmail', { verificationToken, verificationSecurityToken })).data;
  } catch (error: any) {
    return error.response && error.response.data;
  }
};

export interface ILoginUserDto {
  email: string;
  password: string;
}

export const loginUser = async ({ email, password }: ILoginUserDto) => {
  try {
    return unwrapApiResponse((await apiClient.post('auth/login', {
      email,
      password,
    })).data);
  } catch (error: any) {
    return error.response && error.response.data;
  }
};

export const verifyUser = async () => {
  try {
    return unwrapApiResponse((await apiClient.get('auth/verifyUser')).data);
  } catch (error: any) {
    return error.response && error.response.data;
  }
};

export const logout = async () => {
  try {
    return unwrapApiResponse((await apiClient.post('auth/logout')).data);
  } catch (error: any) {
    return error.response && error.response.data;
  }
};

export const resetPasswordRequest = async (email: string) => {
  try {
    return unwrapApiResponse((await apiClient.get(`auth/resetPasswordRequest?email=${email}`)).data);
  } catch (error: any) {
    return error.response && error.response.data;
  }
};

export const validateResetToken = async (resetToken: string) => {
  try {
    return (await apiClient.post('auth/validateResetToken', { resetToken })).data;
  } catch (error: any) {
    return error.response && error.response.data;
  }
};

export const getPasswordResetSecurityToken = async (resetToken: string) => {
  try {
    return (await apiClient.post('auth/getPasswordResetSecurityToken', { resetToken })).data;
  } catch (error: any) {
    return error.response && error.response.data;
  }
};

export interface ISetNewPasswordDto {
  securityToken: string,
  resetToken: string,
  password: string
}

export const setNewPassword = async (data: ISetNewPasswordDto) => {
  try {
    return (await apiClient.post('auth/setNewPassword', data)).data;
  } catch (error: any) {
    return error.response && error.response.data;
  }
};

export const getUpdatePasswordSecurityToken = async () => {
  try {
    return (await apiClient.get('auth/getUpdatePasswordSecurityToken')).data;
  } catch (error: any) {
    return error.response && error.response.data;
  }
};

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
}: IUpdatePasswordDto) => {
  try {
    return (await apiClient.post('auth/updatePassword', {
      securityToken,
      password,
      newPassword,
      confirmPassword,
    })).data;
  } catch (error: any) {
    return error.response && error.response.data;
  }
};

export const setLanguage = async (language: string) => {
  try {
    return unwrapApiResponse((await apiClient.post('user/setLanguage', { language })).data);
  } catch (error: any) {
    return error.response && error.response.data;
  }
};

interface IUserSettingsPreferencesData {
  projectsOrder: string[]
}

export const savePreferences = async (data: IUserSettingsPreferencesData) => {
  try {
    return unwrapApiResponse((await apiClient.post('user/savePreferences', { data })).data);
  } catch (error: any) {
    return error.response && error.response.data;
  }
};
