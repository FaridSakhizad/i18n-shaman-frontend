export interface IUserSettings {
  language?: string | null,
}

export interface IUserPreferences {
  projectsOrder: string[];
}

export interface IPublicUserData {
  id: string;
  email: string;
  verified: boolean;
  preferences?: IUserPreferences;
}
