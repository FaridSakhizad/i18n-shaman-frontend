import { apiClient } from './client';
import { unwrapApiResponse } from './errors';

interface ISearchParams {
  projectId: string;
  query: string;
  caseSensitive?: boolean;
  exact?: boolean;
  searchInKeys?: boolean;
  searchInValues?: boolean;
  searchInFolders?: boolean;
  searchInComponents?: boolean;
}

export const search = async ({
  projectId,
  query,
  caseSensitive,
  exact,
  searchInKeys = true,
  searchInValues = true,
  searchInFolders = true,
  searchInComponents = true,
}: ISearchParams) => {
  let extendedParams = '';

  if (searchInKeys === false) {
    extendedParams += `&in_keys=${searchInKeys}`;
  }

  if (searchInValues === false) {
    extendedParams += `&in_values=${searchInValues}`;
  }

  if (searchInFolders === false) {
    extendedParams += `&in_folders=${searchInFolders}`;
  }

  if (searchInComponents === false) {
    extendedParams += `&in_components=${searchInComponents}`;
  }

  try {
    return unwrapApiResponse((await apiClient.get(`/search?projectId=${projectId}&query=${query}&case_sensitive=${caseSensitive}&exact=${exact}${extendedParams.length > 0 ? `${extendedParams}` : ''}`)).data);
  } catch (error: any) {
    return error.response && error.response.data;
  }
};
