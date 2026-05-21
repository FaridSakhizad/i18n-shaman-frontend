import React, { useRef, useState } from 'react';
import {
  addTagToEntities,
  assignTagToEntities,
  detachTagFromEntities,
} from 'api/projects';
import clsx from 'clsx';
import { IProject } from '../../interfaces';

interface IProps {
  project: IProject;
  entityId: string;
  onCreate: () => void;
  onAttach: () => void;
  onDetach: () => void;
}

export default function EntityTagsMenu(props: IProps) {
  const {
    project,
    entityId,
    onCreate = () => {},
    onAttach = () => {},
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onDetach = () => {},
  } = props;

  const { projectId: currentProjectId } = project;

  const theEntity = project.keys.find((key) => key.id === entityId);

  const entityTagsSet = new Set((theEntity?.tags || []).map((tag) => tag.id));

  const [newTagName, setNewTagName] = useState<string | null>(null);

  const newTagNameRef = useRef<string>(newTagName || '');
  newTagNameRef.current = newTagName || '';

  const onTagNameChange = ({ target: { value } }: React.ChangeEvent<HTMLInputElement>) => {
    setNewTagName(value);
  };

  const projectTagsByIdMap = new Map((project.tags || []).map((tag) => [tag.id, tag]));

  const getFilteredTagsList = () => {
    const { tags } = project as IProject || {};

    if (!tags || tags.length < 1) {
      return null;
    }

    if (!newTagNameRef.current) {
      return tags;
    }

    const searchQuery = newTagNameRef.current.trim().toLowerCase();

    if (!searchQuery || searchQuery.length < 1) {
      return tags;
    }

    return tags.filter((tag) => tag.name.toLowerCase().includes(searchQuery));
  };

  const filteredTagsList = getFilteredTagsList();

  const getTagsListToRender = () => {
    const list = (filteredTagsList && filteredTagsList.length > 0) ? filteredTagsList : [];

    return list.filter((tag) => !entityTagsSet.has(tag.id));
  };

  const tagsListToRender = getTagsListToRender();

  const onCreateTagClick = async () => {
    if (!newTagName || newTagName.length === 0 || !entityId) {
      return;
    }

    const colorIndex = Math.floor(Math.random() * (24 - 1 + 1) + 1);

    await addTagToEntities({
      projectId: currentProjectId,
      entityIds: [entityId as string],
      tagName: newTagName,
      color: `color${colorIndex}`,
    });

    onCreate();
  };

  const handleProjectTagClick = async (id: string) => {
    await assignTagToEntities({
      projectId: currentProjectId,
      entityIds: [entityId as string],
      tagId: id,
    });

    onAttach();
  };

  const handleDetachTag = async (id: string) => {
    await detachTagFromEntities({
      projectId: currentProjectId,
      entityIds: [entityId as string],
      tagId: id,
    });

    onAttach();
  };

  const displayCreateButton: boolean = (() => {
    if (!project.tags || project.tags.length < 1) {
      return true;
    }

    return !!newTagName && newTagName.length > 0 && (!filteredTagsList || filteredTagsList.length < 1);
  })();

  return (
    <>
      {theEntity && theEntity.tags && theEntity.tags.length > 0 && (
        <div className="entityTags">
          <div className="tagsMenu-list">
            {theEntity.tags.map(({ id: tagId }) => {
              if (!projectTagsByIdMap.has(tagId)) {
                return null;
              }

              const { color, name, customColor } = projectTagsByIdMap.get(tagId) || {};

              return (
                <span
                  className={clsx({
                    tag: true,
                    [color as string]: !customColor || customColor === null,
                    custom: customColor && customColor !== null,
                  })}
                  style={{ '--custom-color': customColor as string } as React.CSSProperties}
                  key={tagId}
                >
                  <span className="tag-name">{name}</span>
                  <span className="tag-controls">
                    <button
                      type="button"
                      className="tag-control tag-control_detach"
                      onClick={() => handleDetachTag(tagId)}
                      aria-label="Detach Tag"
                    />
                  </span>
                </span>
              );
            })}
          </div>
        </div>
      )}

      <div className="addTagControl">
        <input
          type="text"
          className="input addTagControl-input"
          placeholder="Add Tag..."
          onChange={onTagNameChange}
          value={newTagName || ''}
        />
        {displayCreateButton && (
          <button
            type="button"
            className="button success"
            aria-label="Create New Tag"
            onClick={onCreateTagClick}
          >Create
          </button>
        )}
      </div>

      {tagsListToRender.length > 0 && (
        <div className="projectTagsMenu-list">
          {tagsListToRender.map((tag, idx) => (
            <span
              className={`tag ${tag.color}`}
              key={`${idx + tag.id}`}
              onClick={() => handleProjectTagClick(tag.id)}
            >
              {tag.name}
            </span>
          ))}
        </div>
      )}
    </>
  );
}
