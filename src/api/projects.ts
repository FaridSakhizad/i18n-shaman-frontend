import {
  IFilter,
  IKey,
  IKeyUpdateError,
  IKeyValue,
  IProject, ISearchParams, ITag,
} from 'interfaces';
import { apiClient } from './client';

interface ICreateProject {
  userId: string;
  projectName: string;
  projectId: string;
}

export const createUserProject = async ({ userId, projectName, projectId }: ICreateProject) => {
  return (await apiClient.post('/createProject', {
    userId,
    projectName,
    projectId,
  })).data;
};

export const updateUserProject = async (data: IProject) => {
  try {
    return (await apiClient.post('/updateProject', data)).data;
  } catch (error: any) {
    return error.response && error.response.data;
  }
};

export const deleteUserProject = async (projectId: string) => {
  try {
    return (await apiClient.delete(`/deleteProject?projectId=${projectId}`)).data;
  } catch (error: any) {
    return error.response && error.response.data;
  }
};

export const getUserProjects = async (userId: string) => {
  try {
    return (await apiClient.get(`getUserProjects?userId=${userId}`)).data;
  } catch (error: any) {
    return error.response && error.response.data;
  }
};

interface IGetUserProjectById {
  projectId: string;
  subFolderId?: string;
  page?: number;
  itemsPerPage?: number;
  sortBy?: string;
  sortDirection?: string;
  filters?: IFilter | null;
  search?: string | null;
  searchParams?: ISearchParams | null;
}

export const getUserProjectById = async (params: IGetUserProjectById) => {
  const {
    projectId,
    subFolderId,
    page = 0,
    itemsPerPage = 50,
    sortBy,
    sortDirection = 'asc',
    filters,
    search = null,
    searchParams,
  } = params;

  let queryString = `getUserProjectById?projectId=${projectId}`;

  if (subFolderId) {
    queryString += `&subFolderId=${subFolderId}`;
  }

  queryString += `&page=${page}`;
  queryString += `&itemsPerPage=${itemsPerPage}`;

  if (sortBy) {
    queryString += `&sortBy=${sortBy}`;

    if (sortDirection) {
      queryString += `&sortDirection=${sortDirection}`;
    }
  }

  if (filters && Object.entries(filters).length > 0) {
    const filterQueryString = Object.entries(filters).filter(([,value]) => value).map(([filter]) => filter).join(',');

    if (filterQueryString.length > 0) {
      queryString += `&filters=${filterQueryString}`;
    }
  }

  if (search && search.length > 0) {
    queryString += `&search=${encodeURIComponent(search)}`;

    if (searchParams && Object.entries(searchParams).length > 0) {
      const searchParamsString = Object.entries(searchParams).filter(([,value]) => value).map(([value]) => value).join(',');

      queryString += `&search_params=${searchParamsString}`;
    }
  }

  try {
    return (await apiClient.get(queryString)).data;
  } catch (error: any) {
    return error.response && error.response.data;
  }
};

interface ICreateEntity {
  id: string;
  projectId: string;
  parentId: string;
  pathCache: string;
  label: string;
  description: string;
  values: IKeyValue[];
  type: string;
}

export const createProjectEntity = async (data: ICreateEntity) => apiClient.post('/createProjectEntity', data);

export interface IDeleteEntitiesRequest {
  projectId: string;
  entityIds: string[]
}

export const deleteProjectEntities = async (data: IDeleteEntitiesRequest) => {
  try {
    return (await apiClient.delete('/deleteProjectEntities', { data })).data;
  } catch (error: any) {
    return error.response && error.response.data;
  }
};

interface IUpdateKey {
  id: string;
  userId?: string;
  projectId: string;
  parentId: string;
  label: string;
  values: IKeyValue[];
  description: string;
}

export const updateKey = async (data: IUpdateKey): Promise<IKey | IKeyUpdateError> => {
  try {
    return (await apiClient.post('/updateKey', data)).data;
  } catch (error: any) {
    return error.response && error.response.data;
  }
};

interface IDuplicateEntities {
  projectId: string;
  entityIds: string[];
}

export const duplicateEntities = async (data: IDuplicateEntities) => {
  try {
    return (await apiClient.post('/duplicateEntities', data)).data;
  } catch (error: any) {
    return error.response && error.response.data;
  }
};

interface IMoveEntities {
  projectId: string;
  userId: string;
  destinationEntityId: string;
  entityIds: string[];
}

export const moveEntities = async (data: IMoveEntities) => {
  try {
    return (await apiClient.post('/moveEntities', data)).data;
  } catch (error: any) {
    return error.response && error.response.data;
  }
};

interface IGetKeyData {
  projectId: string;
  userId: string;
  keyId: string;
}

export const getKeyData = async ({ userId, projectId, keyId }: IGetKeyData) => {
  try {
    return (await apiClient.get(`getKeyData?userId=${userId}&projectId=${projectId}&keyId=${keyId}`)).data;
  } catch (error: any) {
    return error.response && error.response.data;
  }
};

interface IGetMultipleEntitiesDataByParentId {
  projectId: string;
  parentId: string;
}

export const getMultipleEntitiesDataByParentId = async ({ projectId, parentId }: IGetMultipleEntitiesDataByParentId) => {
  try {
    return (await apiClient.get(`getMultipleEntitiesDataByParentId?projectId=${projectId}&parentId=${parentId}`)).data;
  } catch (error: any) {
    return error.response && error.response.data;
  }
};

interface IGetEntitiesChildrenByIds {
  projectId: string,
  userId: string,
  ids: string[]
}

export const getEntitiesChildrenByIds = async (data: IGetEntitiesChildrenByIds) => {
  try {
    return (await apiClient.post('getEntitiesChildrenByIds', data)).data;
  } catch (error: any) {
    return error.response && error.response.data;
  }
};

export enum EExportFormats {
  json = 'json',
  androidXml = 'android_xml',
  appleStrings = 'apple_string',
  phpArray = 'php_array',
}

export interface IExportProject {
  projectId: string;
  format: EExportFormats
}

export const exportProject = async ({ projectId, format }: IExportProject) => {
  return apiClient.get(`/exportProject?projectId=${projectId}&format=${format}`, {
    responseType: 'blob',
  });
};

export const importDataToProject = async (data: any) => {
  try {
    return (await apiClient.post('importJsonDataToProject', data)).data;
  } catch (error: any) {
    return error.response && error.response.data;
  }
};

export const importComponentsToProject = async (data: any) => {
  try {
    return (await apiClient.post('importComponentsDataToProject', data)).data;
  } catch (error: any) {
    return error.response && error.response.data;
  }
};

export interface IAddTagToEntities {
  projectId: string;
  entityIds: string[];
  tagName: string;
  color: string;
}

export const addTagToEntities = async (data: IAddTagToEntities) => {
  try {
    return (await apiClient.post('addTagsToEntities', data)).data;
  } catch (error: any) {
    return error.response && error.response.data;
  }
};

export interface IAssignTagToEntities {
  projectId: string;
  entityIds: string[];
  tagId: string;
}

export const assignTagToEntities = async (data: IAssignTagToEntities) => {
  try {
    return (await apiClient.post('assignTagToEntities', data)).data;
  } catch (error: any) {
    return error.response && error.response.data;
  }
};

export const detachTagFromEntities = async (data: IAssignTagToEntities) => {
  try {
    return (await apiClient.post('detachTagFromEntities', data)).data;
  } catch (error: any) {
    return error.response && error.response.data;
  }
};

export interface IDeleteTag {
  projectId: string;
  tagId: string;
}

export const deleteTag = async (data: IDeleteTag) => {
  try {
    return (await apiClient.post('deleteTag', data)).data;
  } catch (error: any) {
    return error.response && error.response.data;
  }
};

export interface IUpdateTag extends ITag {
  projectId: string;
}

export const updateTag = async (data: IUpdateTag) => {
  try {
    return (await apiClient.post('updateTag', data)).data;
  } catch (error: any) {
    return error.response && error.response.data;
  }
};
