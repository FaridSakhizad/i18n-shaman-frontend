import { IProjectLanguage, IProject, IProjectUpdateError } from 'interfaces';

import { apiClient } from './client';

interface IAddLanguage {
  projectId: string
  id: string
  label: string
  baseLanguage: boolean
}

export const addLanguage = async ({
  projectId,
  id,
  label,
  baseLanguage,
}: IAddLanguage) => apiClient.post('/addLanguage', {
  projectId,
  id,
  label,
  baseLanguage,
});

export const getAppLanguagesData = async () => {
  try {
    return (await apiClient.get('/getAppLanguagesData')).data;
  } catch (error: any) {
    return error.response && error.response.data;
  }
};

interface IUpdateMultipleLanguages {
  projectId: string,
  languages: IProjectLanguage[],
}

export const addMultipleLanguages = async (data: IUpdateMultipleLanguages) => {
  try {
    return (await apiClient.post('/addMultipleLanguages', data)).data;
  } catch (error: any) {
    return error.response && error.response.data;
  }
};

export interface IUpdateLanguage extends IProjectLanguage {
  projectId: string
}

export const updateLanguage = async (data: IUpdateLanguage) => {
  try {
    return (await apiClient.post('/updateLanguage', data)).data;
  } catch (error: any) {
    return error.response && error.response.data;
  }
};

interface ISetMultipleLanguagesVisibilityItem {
  languageId: string,
  visible: boolean,
}

export const setMultipleLanguagesVisibility = async (projectId: string, data: ISetMultipleLanguagesVisibilityItem[]): Promise<IProject | IProjectUpdateError> => {
  try {
    return (await apiClient.post('/setMultipleLanguagesVisibility', { projectId, data })).data;
  } catch (error: any) {
    return error.response && error.response.data;
  }
};

export const setLanguageVisibility = async (projectId: string, languageId: string, visible: boolean): Promise<IProject | IProjectUpdateError> => {
  try {
    return (await apiClient.post('/setLanguageVisibility', { projectId, languageId, visible })).data;
  } catch (error: any) {
    return error.response && error.response.data;
  }
};

export const deleteLanguage = async (projectId: string, languageId: string): Promise<IProject | IProjectUpdateError> => {
  try {
    return (await apiClient.delete(`/deleteLanguage?projectId=${projectId}&languageId=${languageId}`)).data;
  } catch (error: any) {
    return error.response && error.response.data;
  }
};

export const addMultipleRawLanguages = async (data: any[]) => {
  try {
    return (await apiClient.post('/addMultipleRawLanguages', data)).data;
  } catch (error: any) {
    return error.response && error.response.data;
  }
};
