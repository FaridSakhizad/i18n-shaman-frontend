import React, { useState } from 'react';
import { IProject } from '../../interfaces';
import {
  addTagToEntities,
  assignTagToEntities,
  deleteTag,
  detachTagFromEntities
} from 'api/projects';
import { retry } from '@reduxjs/toolkit/query';

interface IProps {
  project: IProject;
  entityId: string;
}

export default function EntityTagsMenu(props: IProps) {
  const { project, entityId } = props;

  const { projectId: currentProjectId } = project;

  const theEntity = project.keys.find((key) => key.id === entityId);

  const entityTagsSet = new Set((theEntity?.tags || []).map((tag) => tag.id));

  const [newTagName, setNewTagName] = useState<string | null>(null);

  const onTagNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewTagName(e.target.value);
  };

  const projectTagsByIdMap = new Map((project.tags || []).map((tag) => [tag.id, tag]));

  const getFilteredTagsList = () => {
    const { tags } = project as IProject || {};

    if (!tags || tags.length < 1) {
      return null
    }

    const searchQuery = newTagName?.trim().toLowerCase();

    if (!searchQuery || searchQuery.length < 1) {
      return null;
    }

    return tags.filter(tag => tag.name.toLowerCase().includes(searchQuery));
  }

  const filteredTagsList = getFilteredTagsList();

  const getTagsListToRender = () => {
    const list = (filteredTagsList && filteredTagsList.length > 0) ? filteredTagsList : (project?.tags || [])


    return list.filter((tag) => !entityTagsSet.has(tag.id))
  }

  const tagsListToRender = getTagsListToRender();

  const onCreateTagClick = async () => {
    if (!newTagName || newTagName.length === 0 || !entityId) {
      return;
    }

    const colorIndex = Math.floor(Math.random() * (24 - 1 + 1) + 1);

    const result = await addTagToEntities({
      projectId: currentProjectId,
      entityIds: [entityId as string],
      tagName: newTagName,
      color: `color${colorIndex}`,
    });
  };

  const handleProjectTagClick = async (id: string) => {
    const result = await assignTagToEntities({
      projectId: currentProjectId,
      entityIds: [entityId as string],
      tagId: id
    });
  }

  const handleDetachTag = async (id: string) => {
    const result = await detachTagFromEntities({
      projectId: currentProjectId,
      entityIds: [entityId as string],
      tagId: id
    });
  }

  const handleDeleteTag = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, id: string) => {
    e.preventDefault();
    e.stopPropagation();

    const result = await deleteTag({
      projectId: currentProjectId,
      tagId: id
    });
  }

  //

  const displayCreateButton: boolean = (() => {
    if (!project.tags || project.tags.length < 1) {
      return true;
    }

    return !!newTagName && newTagName.length > 0 && (!filteredTagsList || filteredTagsList.length < 1)
  })();

  return (
    <>
      {theEntity && theEntity.tags && theEntity.tags.length > 0 && (
        <>
          <div className="entityTags">
            <div className="tagsMenu-list">
              {theEntity.tags.map(({id: tagId}) => {
                if (!projectTagsByIdMap.has(tagId)) {
                  return null;
                }

                const { color, name } = projectTagsByIdMap.get(tagId) || {};

                return (
                  <span
                    className={`tag ${color}`}
                    key={tagId}
                  >
                    <span className="tag-name">{name}</span>
                    <span className="tag-controls">
                      <button
                        type="button"
                        className="tag-control tag-control_detach"
                        onClick={() => handleDetachTag(tagId)}
                      />
                    </span>
                  </span>
                )
              })}
            </div>
          </div>

          <hr className="tagsMenuSeparator" />
        </>
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
          >Create</button>
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
              <span className="tag-name">{tag.name}</span>
              <span className="tag-controls">
                  <button
                    type="button"
                    className="tag-control tag-control_delete"
                    onClick={(e) => handleDeleteTag(e, tag.id)}
                  />
                </span>
            </span>
          ))}
        </div>
      )}
    </>
  )
}
