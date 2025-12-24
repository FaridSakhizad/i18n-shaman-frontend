export enum EStatusCode {
  OK = 200,
  Created = 201,
  Unauthorized = 401,
  Forbidden = 403,
  Not_Found = 404,
}

export interface IResponse {
  message?: string;
  statusCode: EStatusCode;
  metaData?: any
}

export interface IError {
  message: string;
  error: string;
  statusCode: number;
}

export interface IKeyValue {
  languageId: string;
  value: string;
  keyId: string;
  projectId: string;
  parentId: string;
  pathCache?: string;
}

export interface IKeyTag {
  id: string;
}

export interface IKey {
  projectId: string;
  id: string;
  label: string;
  children?: IKey[];
  parentId: string;
  values: {
    [key: string]: IKeyValue;
  };
  description: string;
  type: EntityType;
  pathCache: string;
  tags: IKeyTag[]
}

export interface IKeyUpdateError extends IError {}

export interface ILanguage {
  id: string;
  label: string;
  code: string;
}

export interface IProjectLanguage extends ILanguage {
  baseLanguage: boolean,
  visible: boolean,
  customCodeEnabled?: boolean,
  customLabelEnabled?: boolean,
  customCode?: string,
  customLabel?: string,
}

export interface ITag {
  id: string;
  name: string;
  color: string;
  customColor?: string;
}

export interface IProject {
  projectName: string;
  projectId: string;
  userId: string;
  keys: [IKey];
  values: any;
  languages: IProjectLanguage[];
  keysTotalCount?: number;
  subfolder?: IKey;
  upstreamParents?: [IKey]
  tags: ITag[];
}

export interface IProjectUpdateError extends IError {}

export interface IUserLanguagesMapItem {
  [key: string]: IProjectLanguage;
}

export enum EntityType {
  String = 'string',
  Folder = 'folder',
  Component = 'component',
}

export enum ESorting {
  created = 'created',
  name = 'name',
  type = 'type',
}

export enum ESortDirection {
  asc = 'asc',
  desc = 'desc',
}

export interface ISorting {
  sortBy: ESorting;
  sortDirection: ESortDirection;
}

export enum ESearchParams {
  caseSensitive = 'case_sensitive',
  exactMatch = 'exact_match',
  skipKeys = 'skip_keys',
  skipValues = 'skip_values',
  skipFolders = 'skip_folders',
  skipComponents = 'skip_components',
}

export interface ISearchParams {
  [ESearchParams.caseSensitive]: boolean;
  [ESearchParams.exactMatch]: boolean;
  [ESearchParams.skipKeys]: boolean;
  [ESearchParams.skipValues]: boolean;
  [ESearchParams.skipFolders]: boolean;
  [ESearchParams.skipComponents]: boolean;
}

export enum EFilter {
  hideEmpty = 'hideEmpty',
  hidePartiallyPopulated = 'hidePartiallyPopulated',
  hideFullyPopulated = 'hideFullyPopulated',
  hideFolders = 'hideFolders',
  hideComponents = 'hideComponents',
  hideKeys = 'hideKeys',
}

export interface IFilter {
  [EFilter.hideEmpty]: boolean;
  [EFilter.hidePartiallyPopulated]: boolean;
  [EFilter.hideFullyPopulated]: boolean;
  [EFilter.hideFolders]: boolean;
  [EFilter.hideComponents]: boolean;
  [EFilter.hideKeys]: boolean;
}

export interface INavigationData {
  subFolderId?: string;
  page?: number;
  itemsPerPage?: number;
  sorting: ISorting;
  filters: IFilter;
}
