import {
  ILanguage,
  IProjectLanguage,
  IProject,
  IProjectUpdateError,
} from 'interfaces';

import { apiClient, requestPayload } from './client';

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
}: IAddLanguage) => requestPayload<IProject>(apiClient.post('/addLanguage', {
  projectId,
  id,
  label,
  baseLanguage,
}));

export const getAppLanguagesData = async () => requestPayload<ILanguage[]>(apiClient.get('/getAppLanguagesData'));

interface IUpdateMultipleLanguages {
  projectId: string,
  languages: IProjectLanguage[],
}

export const addMultipleLanguages = async (data: IUpdateMultipleLanguages) => requestPayload<IProject>(apiClient.post('/addMultipleLanguages', data));

export interface IUpdateLanguage extends IProjectLanguage {
  projectId: string
}

export const updateLanguage = async (data: IUpdateLanguage) => requestPayload<IProject>(apiClient.post('/updateLanguage', data));

interface ISetMultipleLanguagesVisibilityItem {
  languageId: string,
  visible: boolean,
}

export const setMultipleLanguagesVisibility = async (projectId: string, data: ISetMultipleLanguagesVisibilityItem[]): Promise<IProject | IProjectUpdateError> => requestPayload<IProject | IProjectUpdateError>(apiClient.post('/setMultipleLanguagesVisibility', { projectId, data }));

export const setLanguageVisibility = async (projectId: string, languageId: string, visible: boolean): Promise<IProject | IProjectUpdateError> => requestPayload<IProject | IProjectUpdateError>(apiClient.post('/setLanguageVisibility', { projectId, languageId, visible }));

export const deleteLanguage = async (projectId: string, languageId: string): Promise<IProject | IProjectUpdateError> => requestPayload<IProject | IProjectUpdateError>(apiClient.delete('/deleteLanguage', {
  data: { projectId, languageId },
}));

export const addMultipleRawLanguages = async (data: ILanguage[]) => requestPayload<ILanguage[]>(apiClient.post('/addMultipleRawLanguages', data));
