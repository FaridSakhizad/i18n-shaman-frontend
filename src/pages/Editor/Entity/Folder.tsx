import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import clsx from 'clsx';

import { getUserProjectById } from 'api/projects';
import { useSelector, useDispatch } from 'react-redux';

import { ROOT } from 'constants/app';

import {
  EntityType,
  IKey, IKeyTag,
  IKeyValue,
  INavigationData,
  IProjectLanguage, ITag,
} from 'interfaces';

// eslint-disable-next-line import/no-cycle
import ItemsList from '../ItemsList';

import './Key.scss';
import { IRootState } from '../../../store';
import { setSelectedEntities } from '../../../store/editorPage';

interface IProps {
  id: string;
  label: string;
  type: EntityType;
  projectId: string;
  keys?: IKey[];
  description: string;
  languages: IProjectLanguage[];
  path: string;
  pathCache: string;
  iteration?: number;
  navigationData?: INavigationData | {};
  tags: IKeyTag[];
  projectTags: ITag[];
}

export default function FolderComponent({
  id,
  label,
  type,
  projectId,
  keys: initialKeys = [],
  description,
  languages,
  path,
  pathCache,
  iteration = 0,
  navigationData = {},
  tags,
  projectTags = [],
}: IProps) {
  const { projectId: currentProjectId = '' } = useParams();

  const dispatch = useDispatch();

  const [keys, setKeys] = useState<IKey[]>(initialKeys);
  const [isExpanded, setIsExpanded] = useState(initialKeys.length > 0);
  const [keyValues, setKeyValues] = useState<{ [parentId: string]: { [languageId: string]: IKeyValue } }>({});

  const { selectedEntities } = useSelector((state: IRootState) => state.editorPage);

  const handleExpandIconClick = async () => {
    setIsExpanded(!isExpanded);

    if (keys.length > 0 && Object.keys(keyValues).length > 0) {
      return;
    }

    const result = await getUserProjectById({
      projectId: currentProjectId,
      subFolderId: id,
      ...navigationData,
    });

    const { keys: newKeys = [], values: newValues = {} } = result;

    setKeyValues(newValues);
    setKeys(newKeys);
  };

  const handleSelectEntityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = e.target;

    const uniqueEntityIds = new Set<string>(selectedEntities);

    if (checked) {
      uniqueEntityIds.add(id);
    } else {
      uniqueEntityIds.delete(id);
    }

    dispatch(setSelectedEntities(Array.from(uniqueEntityIds)));
  };

  const projectTagsByIdMap = new Map((projectTags || []).map((tag) => [tag.id, tag]));

  return (
    <section
      className={clsx({
        key: true,
        key_folder: type === 'folder',
        key_component: type === 'component',
        isOpen: isExpanded,
      })}
      data-path={`${ROOT}/${path !== ROOT ? `${path}/` : ''}${label}`}
    >
      <div className="keyHeader">
        <i className={`keyHeader-expandIcon ${isExpanded ? 'expanded' : ''}`} onClick={handleExpandIconClick} />

        <input
          type="checkbox"
          checked={selectedEntities.includes(id)}
          onChange={handleSelectEntityChange}
          className="checkbox keySelectCheckbox"
        />

        <Link title={description} className="keyName" to={`/project/${currentProjectId}/${id}`}>{label}</Link>

        {tags && (
          <div className="keyHeader-tags">
            {tags.map((tag) => {
              if (!projectTagsByIdMap.has(tag.id)) {
                return null;
              }

              const { color, customColor } = projectTagsByIdMap.get(tag.id) || {};

              return (
                <span
                  className={clsx({
                    tag: true,
                    [color as string]: !customColor || customColor === null,
                    custom: customColor && customColor !== null,
                  })}
                  style={{ '--custom-color': customColor as string } as React.CSSProperties}
                  key={tag.id}
                  data-click-target="tag"
                  data-id={tag.id}
                >
                  <span
                    className="tag-name"
                    data-click-target="tag"
                    data-id={tag.id}
                  >
                    {projectTagsByIdMap.get(tag.id)?.name}
                  </span>
                </span>
              );
            })}
          </div>
        )}

        {/*
          <button
            type="button"
            className="keyName"
            title={description}
            data-click-target="keyName"
            data-id={id}
          >
            {label}
          </button>
        */}

        <div className="keyHeader-controls">
          <div className="keyHeader-controlsGroup">
            <button
              type="button"
              className="_new-key buttonInline keyHeader-control keyHeader-createKey"
              data-click-target="newEntity"
              data-parent-id={id}
              data-parent-path={`${pathCache}/${id}`}
              data-new-entity-type={EntityType.String}
              aria-label="Create New Key"
            />

            <button
              type="button"
              className="_new-folder buttonInline keyHeader-control keyHeader-createFolder"
              data-click-target="newEntity"
              data-parent-id={id}
              data-parent-path={`${pathCache}/${id}`}
              data-new-entity-type={EntityType.Folder}
              aria-label="Create New Folder"
            />
          </div>

          <div className="keyHeader-controlsGroup">
            <button
              type="button"
              className="_tags-edit buttonInline keyHeader-control keyHeader-editTags"
              data-click-target="editTags"
              data-id={id}
              aria-label="Edit Tags"
            />

            <button
              type="button"
              className="_entity-edit buttonInline keyHeader-control keyHeader-edit"
              data-click-target="editEntity"
              data-entity-type={type}
              data-id={id}
              aria-label="Edit"
            />

            <button
              type="button"
              className="_entity-duplicate buttonInline keyHeader-control keyHeader-duplicate"
              data-click-target="duplicateEntity"
              data-entity-type={EntityType.String}
              data-id={id}
              aria-label="Copy"
            />

            <button
              type="button"
              className="_entity-move buttonInline keyHeader-control keyHeader-move"
              data-click-target="moveEntity"
              data-id={id}
              aria-label="Move"
            />
          </div>

          <div className="keyHeader-controlsGroup">
            <button
              type="button"
              className="_entity-delete buttonInline keyHeader-control keyHeader-delete"
              data-click-target="deleteEntity"
              data-id={id}
              aria-label="Delete"
            />
          </div>
        </div>
      </div>

      <div className={`keyContentWrapper ${isExpanded ? 'expanded' : ''}`}>
        <div className="keyContent">
          {(keys.length > 0) && (
            <ItemsList
              keys={keys}
              values={keyValues}
              parentId={id}
              projectId={projectId}
              languages={languages}
              iteration={1 + iteration}
              path={`${path !== ROOT ? `${path}/` : ''}${label}`}
              pathCache={`${pathCache}/${id}`}
              navigationData={navigationData}
              projectTags={projectTags}
            />
          )}
        </div>
      </div>
    </section>
  );
}
