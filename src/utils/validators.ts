import { IKey } from '../interfaces';

const PASSWORD_MIN_LENGTH = 6;

export enum EEntityValidationErrors {
  DUPLICATE_KEY = 'Key name already exist. Please Enter Unique Key Name',
}

export enum EValidationErrors {
  THIS_FIELD_REQUIRED = 'This field is required.',
}

export enum EPasswordValidationErrors {
  INVALID = 'Error: Invalid Password',
  TOO_SHORT = 'The password must be at least 6 characters.',
  TOO_WEAK = 'Password must contain letters in mixed case, a number and a special symbol',
  PASSWORDS_DONT_MATCH = 'Error: Passwords don\'t match.',
  BOTH_PASSWORDS_REQUIRED = 'Both Password fields are required.',
  PASSWORD_REQUIRED = 'Password field is required.',
}

export enum EEmailValidationErrors {
  INVALID = 'Error: Invalid Email address',
}

export type CombinedValidationMessage = EEmailValidationErrors | EPasswordValidationErrors | EEntityValidationErrors;

interface IValidationResponseError {
  message: CombinedValidationMessage;
}

interface IValidationResponse {
  success: boolean,
  errors: IValidationResponseError[],
  warnings?: any[],
}

export const validateKeyName = (label: string, id: string | null, parentId: string | null, keys: IKey[]): IValidationResponse => {
  const errors: IValidationResponseError[] = [];

  for (let i = 0; i < keys.length; i += 1) {
    const key = keys[i];

    if (key.label === label && key.parentId === parentId && id !== key.id) {
      errors.push({
        message: EEntityValidationErrors.DUPLICATE_KEY,
      });

      break;
    }
  }

  return {
    success: errors.length < 1,
    errors,
  };
};

export const validateEmail = (email: string): IValidationResponse => {
  const errors: IValidationResponseError[] = [];

  if (!/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email)) {
    errors.push({
      message: EEmailValidationErrors.INVALID,
    });
  }

  return {
    success: errors.length < 1,
    errors,
  };
};

export const validatePassword = (password: string): IValidationResponse => {
  const errors: IValidationResponseError[] = [];

  if (password.length < PASSWORD_MIN_LENGTH) {
    errors.push({
      message: EPasswordValidationErrors.TOO_SHORT,
    });
  }

  if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()])[A-Za-z\d!@#$%^&*()]{6,}$/.test(password)) {
    errors.push({
      message: EPasswordValidationErrors.TOO_WEAK,
    });
  }

  return {
    success: errors.length < 1,
    errors,
  };
};
