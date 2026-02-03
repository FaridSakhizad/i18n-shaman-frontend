import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

import { DndContext } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { restrictToParentElement } from '@dnd-kit/modifiers';

import { IRootState, AppDispatch } from 'store';

import { savePreferences } from 'api/user';

import {
  updateProject,
  deleteProject,
  getProjects,
} from 'store/projects';

import Header from 'components/Header';

import './Projects.css';

import {
  ILanguage,
  IProject,
} from 'interfaces';

import ExportProject from 'components/ExportProject/ExportProject';
import Modal from 'components/Modal';
import EditProject from './EditProject';
import CreateProject from './CreateProject';
import SortableProjectItem from './SortableProjectItem';

export default function Projects() {
  const dispatch = useDispatch<AppDispatch>();

  const { id: userId, preferences } = useSelector((state: IRootState) => state.user);

  const { projects } = useSelector((state: IRootState) => state.projects);

  const [projectToDeleteId, setProjectToDeleteId] = useState<string | null>(null);
  const [isDeleteConfirmationVisible, setIsDeleteConfirmationVisible] = useState<boolean>(false);

  const handleDeleteClick = (projectId: string) => {
    setProjectToDeleteId(projectId);
    setIsDeleteConfirmationVisible(true);
  };

  const renderDeleteConfirmationModal = () => {
    const handleDeleteConfirmationCloseButtonClick = () => {
      setIsDeleteConfirmationVisible(false);
    };

    const handleDeleteConfirmationCancelButtonClick = () => {
      setIsDeleteConfirmationVisible(false);
    };

    const handleDeleteConfirmationConfirmButtonClick = () => {
      dispatch(deleteProject(projectToDeleteId as string));

      setIsDeleteConfirmationVisible(false);
    };

    return (
      <Modal customClassNames="dialogModal">
        <div className="modal-header">
          <h4 className="modal-title">Delete Project?</h4>

          <button
            type="button"
            className="modal-closeButton"
            onClick={handleDeleteConfirmationCloseButtonClick}
            aria-label="Close modal"
          />
        </div>

        <div className="modal-content">
          <div className="dialogModal-content">
            <i className="dialogBadge question danger dialogModal-badge" />
            <div className="dialogModal-contentText">
              <p className="dialogModal-contentPara">Are you sure you want to Delete Project <b>Warning: this action can not be reverted.</b></p>
            </div>
          </div>
        </div>

        <div className="modal-buttonBox">
          <button
            type="button"
            className="button secondary dialogModal-button"
            onClick={handleDeleteConfirmationCancelButtonClick}
          >
            Cancel
          </button>
          <button
            type="button"
            className="button danger dialogModal-button"
            onClick={handleDeleteConfirmationConfirmButtonClick}
          >
            Delete
          </button>
        </div>
      </Modal>
    );
  };

  const [isNewProjectModalVisible, setIsNewProjectModalVisible] = useState<boolean>(false);

  const handleNewProjectClick = () => {
    setIsNewProjectModalVisible(true);
  };

  const [projectIdInEdit, setProjectIdInEdit] = useState<string | null>(null);

  const handleEditClick = (projectId: string) => {
    setProjectIdInEdit(projectId);
  };

  const [projectToExportId, setProjectToExportId] = useState<string | null>(null);
  const [isExportProjectModalVisible, setIsExportProjectModalVisible] = useState<boolean>(false);

  const handleExportClick = (projectId: string) => {
    setProjectToExportId(projectId);

    setIsExportProjectModalVisible(true);
  };

  const handleProjectSave = (data: IProject) => {
    dispatch(updateProject(data));

    setProjectIdInEdit(null);
  };

  useEffect(() => {
    dispatch(getProjects(userId as string));
  }, []);

  const [projectsOrder, setProjectsOrder] = useState<string[]>(preferences.projectsOrder);

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;

    if ((!active || !over) || active.id === over.id) {
      return;
    }

    const oldIndex = projectsOrder.indexOf(active.id);
    const newIndex = projectsOrder.indexOf(over.id);

    const newOrder = arrayMove(projectsOrder, oldIndex, newIndex);

    setProjectsOrder(newOrder);

    await savePreferences(userId as string, { projectsOrder: newOrder });
  };

  const getOrderedProjects = () => {
    if (!projects) {
      return null;
    }

    if (!projectsOrder) {
      return projects;
    }

    const projectsMap: Map<string, IProject> = new Map<string, IProject>(projects.map((project) => [project.projectId, project]));

    const result = [];

    for (const id of projectsOrder) {
      result.push(projectsMap.get(id));
    }

    return result;
  };

  const orderedProjects: IProject[] = getOrderedProjects() as IProject[];

  if (!projects) {
    return null;
  }

  return (
    <>
      {isDeleteConfirmationVisible && renderDeleteConfirmationModal()}

      {isExportProjectModalVisible && (
        <ExportProject
          onClose={() => setIsExportProjectModalVisible(false)}
          onCancel={() => setIsExportProjectModalVisible(false)}
          onConfirm={() => setIsExportProjectModalVisible(false)}
          project={projects.find((project: IProject) => project.projectId === projectToExportId) as IProject}
        />
      )}

      <Header />

      <div className="pageHeader">
        <h1 className="h1 pageHeader-title">Projects</h1>
        <div className="pageHeader-controlsEnd">
          <button type="button" className="button success" onClick={handleNewProjectClick}>Create New Project</button>
        </div>
      </div>

      <div className="pageBody pageBody_projectsPage">

        <div className="projectsList">
          <DndContext
            onDragEnd={handleDragEnd}
            modifiers={[restrictToParentElement]}
          >
            <SortableContext
              items={projectsOrder || []}
              strategy={verticalListSortingStrategy}
            >
              {orderedProjects && orderedProjects.map((project: IProject) => (
                <SortableProjectItem key={project.projectId} id={project.projectId}>
                  {({
                    attributes,
                    listeners,
                    setActivatorNodeRef,
                    isDragging,
                  }: any) => (
                    <div className={`projectsList-item ${isDragging ? 'projectsList-item_isDragging' : ''}`}>
                      <i
                        className="projectsList-dragHandle"
                        ref={setActivatorNodeRef}
                        {...attributes} // eslint-disable-line react/jsx-props-no-spreading
                        {...listeners} // eslint-disable-line react/jsx-props-no-spreading
                      />
                      <div className="project">
                        <button type="button" className="project-expandButton" aria-label="Expand Project" style={{ display: 'none' }} />

                        <div className="project-content">
                          <Link to={`/project/${project.projectId}`} className="h2 link project-name">{project.projectName}</Link>

                          {project.languages && project.languages.length > 0 && (
                            <ul className="project-languages">
                              {project.languages.map((language: ILanguage) => (
                                <li key={language.id} className="project-languageItem">{language.label}</li>
                              ))}
                            </ul>
                          )}
                        </div>

                        <div className="project-controls">
                          <button type="button" className="button project-controlsButton project-controlsButton_edit" onClick={() => handleEditClick(project.projectId)}>Edit</button>
                          <button type="button" className="button project-controlsButton project-controlsButton_download" onClick={() => handleExportClick(project.projectId)}>Download</button>
                          <button type="button" className="button project-controlsButton project-controlsButton_delete" onClick={() => handleDeleteClick(project.projectId)}>Delete</button>
                        </div>
                      </div>
                    </div>
                  )}
                </SortableProjectItem>
              ))}
            </SortableContext>
          </DndContext>
        </div>
      </div>

      {isNewProjectModalVisible && (
        <CreateProject
          onClose={() => setIsNewProjectModalVisible(false)}
          onCancel={() => setIsNewProjectModalVisible(false)}
        />
      )}

      {projectIdInEdit && (
        <EditProject
          project={projects.find((project: IProject) => project.projectId === projectIdInEdit) as IProject}
          onSave={handleProjectSave}
          onClose={() => setProjectIdInEdit(null)}
          onCancel={() => setProjectIdInEdit(null)}
        />
      )}
    </>
  );
}
