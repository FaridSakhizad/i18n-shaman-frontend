import {
  IFilter,
  IKey,
  IKeyUpdateError,
  IKeyValue,
  IProject, ISearchParams, ITag,
} from 'interfaces';

import {
  apiClient,
  buildQueryString,
  requestEnvelope,
  requestPayload,
} from './client';

interface ICreateProject {
  projectName: string;
  projectId: string;
}

interface IImportResult {
  addProjectLanguagesResult: unknown;
  createDocumentsResult: unknown;
  createValuesResult: unknown;
}

interface ITagListResponse {
  tags: ITag[];
}

interface IEntitiesResponse {
  entities: IKey[];
}

interface IOkResponse {
  ok: string;
}

interface IKeyDataResponse {
  key: IKey;
  values: {
    [key: string]: {
      [key: string]: IKeyValue;
    };
  };
}

export const createUserProject = async ({ projectName, projectId }: ICreateProject) => requestPayload<IProject[]>(apiClient.post('/createProject', {
  projectName,
  projectId,
}));

export const updateUserProject = async (data: IProject) => requestPayload<IProject>(apiClient.post('/updateProject', data));

export const deleteUserProject = async (projectId: string) => requestPayload<IProject[]>(apiClient.delete('/deleteProject', {
  data: { projectId },
}));

export const getUserProjects = async () => requestPayload<IProject[]>(apiClient.get('getUserProjects'));

interface IGetUserProjectById {
  projectId: string;
  subFolderId?: string;
  page?: number;
  itemsPerPage?: number;
  sortBy?: string;
  sortDirection?: string;
  filters?: IFilter | null;
  tags?: string[];
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
    tags = [],
    search = null,
    searchParams,
  } = params;

  const filtersToQueryString = filters && Object.entries(filters).length > 0
    ? Object.entries(filters).filter(([,value]) => value).map(([filter]) => filter)
    : [];
  const searchParamsToQueryString = searchParams && Object.entries(searchParams).length > 0
    ? Object.entries(searchParams).filter(([,value]) => value).map(([value]) => value)
    : [];

  const queryString = buildQueryString('getUserProjectById', {
    projectId,
    subFolderId,
    page,
    itemsPerPage,
    sortBy,
    sortDirection,
    filters: filtersToQueryString,
    tags,
    search,
    searchParams: search && search.length > 0 ? searchParamsToQueryString : [],
  });

  return requestPayload<IProject>(apiClient.get(queryString));
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

export const createProjectEntity = async (data: ICreateEntity) => requestPayload<IKey>(apiClient.post('/createProjectEntity', data));

export interface IDeleteEntitiesRequest {
  projectId: string;
  entityIds: string[]
}

export const deleteProjectEntities = async (data: IDeleteEntitiesRequest) => requestPayload<IKey[]>(apiClient.delete('/deleteProjectEntities', { data }));

interface IUpdateKey {
  id: string;
  projectId: string;
  parentId: string;
  label: string;
  values: IKeyValue[];
  description: string;
}

export const updateKey = async (data: IUpdateKey): Promise<IKey | IKeyUpdateError> => requestPayload<IKey | IKeyUpdateError>(apiClient.post('/updateKey', data));

interface IDuplicateEntities {
  projectId: string;
  entityIds: string[];
}

export const duplicateEntities = async (data: IDuplicateEntities) => requestPayload<IKey[]>(apiClient.post('/duplicateEntities', data));

interface IMoveEntities {
  projectId: string;
  destinationEntityId: string;
  entityIds: string[];
}

export const moveEntities = async (data: IMoveEntities) => requestPayload<IKey[]>(apiClient.post('/moveEntities', data));

interface IGetKeyData {
  projectId: string;
  keyId: string;
}

export const getKeyData = async ({ projectId, keyId }: IGetKeyData) => requestPayload<IKeyDataResponse>(apiClient.get(buildQueryString('getKeyData', {
  projectId,
  keyId,
})));

interface IGetMultipleEntitiesDataByParentId {
  projectId: string;
  parentId: string;
}

export const getMultipleEntitiesDataByParentId = async ({ projectId, parentId }: IGetMultipleEntitiesDataByParentId) => requestPayload<IKey[]>(apiClient.get(buildQueryString('getMultipleEntitiesDataByParentId', {
  projectId,
  parentId,
})));

interface IGetEntitiesChildrenByIds {
  projectId: string,
  ids: string[]
}

export const getEntitiesChildrenByIds = async (data: IGetEntitiesChildrenByIds) => requestPayload<IKey[]>(apiClient.post('getEntitiesChildrenByIds', data));

export enum EExportFormats {
  json = 'json',
  androidXml = 'android_xml',
  appleStrings = 'apple_string',
}

export interface IExportProject {
  projectId: string;
  format: EExportFormats
}

export const exportProject = async ({ projectId, format }: IExportProject) => apiClient.get(buildQueryString('/exportProject', {
  projectId,
  format,
}), {
  responseType: 'blob',
});

export const importDataToProject = async (data: FormData) => requestEnvelope<IImportResult>(apiClient.post('importJsonDataToProject', data));

export const importComponentsToProject = async (data: FormData) => requestEnvelope<IImportResult>(apiClient.post('importComponentsDataToProject', data));

export interface ICreateTag {
  projectId: string;
  tagName: string;
}

export const createTag = async (data: ICreateTag) => requestEnvelope<ITagListResponse>(apiClient.post('createTag', data));

export interface IAddTagToEntities {
  projectId: string;
  entityIds: string[];
  tagName: string;
  color: string;
}

export const addTagToEntities = async (data: IAddTagToEntities) => requestEnvelope<ITagListResponse>(apiClient.post('addTagsToEntities', data));

export interface IAssignTagToEntities {
  projectId: string;
  entityIds: string[];
  tagId: string;
}

export const assignTagToEntities = async (data: IAssignTagToEntities) => requestEnvelope<IEntitiesResponse>(apiClient.post('assignTagToEntities', data));

export const detachTagFromEntities = async (data: IAssignTagToEntities) => requestEnvelope<IEntitiesResponse>(apiClient.post('detachTagFromEntities', data));

export interface IDeleteTag {
  projectId: string;
  tagId: string;
}

export const deleteTag = async (data: IDeleteTag) => requestEnvelope<ITagListResponse>(apiClient.post('deleteTag', data));

export interface IUpdateTag extends ITag {
  projectId: string;
}

export const updateTag = async (data: IUpdateTag) => requestEnvelope<IOkResponse>(apiClient.post('updateTag', data));
