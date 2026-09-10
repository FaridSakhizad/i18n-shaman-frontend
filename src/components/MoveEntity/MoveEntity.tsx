import React, { useEffect, useState } from 'react';

import { useDispatch, useSelector } from 'react-redux';

import Modal from 'components/Modal';

import { IKey, IProject } from 'interfaces';

import {
  getEntitiesChildrenByIds,
  getUserProjectById,
  moveEntities,
} from 'api/projects';
import { getApiErrorMessage, isApiError } from 'api/errors';

import { AppDispatch, IRootState } from 'store';
import { createSystemNotification, EMessageType } from 'store/systemNotifications';

import './MoveEntity.css';

interface IProps {
  projectId: string;
  onClose?: () => void;
  onCancel?: () => void;
  onConfirm?: () => void;
}

interface IChildrenStatistics {
  [key: string]: {
    entities: IKey[],
    keys: number,
    folders: number,
    components: number,
  }
}

export default function MoveEntity(props: IProps) {
  const {
    projectId,
    onClose = () => {},
    onCancel = () => {},
    onConfirm = () => {},
  } = props;

  const dispatch = useDispatch<AppDispatch>();
  const { selectedEntities } = useSelector((state: IRootState) => state.editorPage);

  const [loading, setLoading] = useState<boolean>(true);
  const [project, setProject] = useState<IProject | null>(null);
  const [childrenByParentIds, setChildrenByParentIds] = useState<IChildrenStatistics>({});

  const [destinationFolderId, setDestinationFolderId] = useState<string>();
  const [showConfirmationDialog, setShowConfirmationDialog] = useState<boolean>(false);

  const getChildrenByParentIds = (children: IKey[]): IChildrenStatistics => {
    const result: IChildrenStatistics = {};

    children.forEach((entity: IKey) => {
      if (!result[entity.parentId]) {
        result[entity.parentId] = {
          entities: [],
          keys: 0,
          folders: 0,
          components: 0,
        };
      }

      if (entity.type === 'string') {
        result[entity.parentId].keys += 1;
      }

      if (entity.type === 'folder') {
        result[entity.parentId].folders += 1;
      }

      if (entity.type === 'component') {
        result[entity.parentId].components += 1;
      }

      result[entity.parentId].entities.push(entity);
    });

    return result;
  };

  const fetchProjectData = async (theProjectId: string, subFolderId?: string) => {
    setLoading(true);

    const result = await getUserProjectById({
      projectId: theProjectId,
      subFolderId,
    });

    if (isApiError(result)) {
      dispatch(createSystemNotification({
        content: getApiErrorMessage(result, 'Error Loading Project'),
        type: EMessageType.Error,
      }));
      setLoading(false);

      return;
    }

    const children = await getEntitiesChildrenByIds({
      projectId,
      ids: result.keys.map((key: IKey) => key.id),
    });

    if (isApiError(children)) {
      dispatch(createSystemNotification({
        content: getApiErrorMessage(children, 'Error Loading Child Entities'),
        type: EMessageType.Error,
      }));
      setLoading(false);

      return;
    }

    setChildrenByParentIds(getChildrenByParentIds(children));
    setProject(result);

    setLoading(false);
  };

  useEffect(() => {
    fetchProjectData(projectId);
  }, []);

  const handleOpenEntityClick = async (id: string) => {
    setLoading(true);

    const result = await getUserProjectById({
      projectId,
      subFolderId: id,
    });

    if (isApiError(result)) {
      dispatch(createSystemNotification({
        content: getApiErrorMessage(result, 'Error Loading Project'),
        type: EMessageType.Error,
      }));
      setLoading(false);

      return;
    }

    const children = await getEntitiesChildrenByIds({
      projectId,
      ids: result.keys.map((key: IKey) => key.id),
    });

    if (isApiError(children)) {
      dispatch(createSystemNotification({
        content: getApiErrorMessage(children, 'Error Loading Child Entities'),
        type: EMessageType.Error,
      }));
      setLoading(false);

      return;
    }

    setChildrenByParentIds(getChildrenByParentIds(children));
    setProject(result);

    setDestinationFolderId(undefined);

    setLoading(false);
  };

  const handleBackClick = async () => {
    setLoading(true);

    const result = await getUserProjectById({
      projectId,
      subFolderId: project?.subfolder?.parentId,
    });

    if (isApiError(result)) {
      dispatch(createSystemNotification({
        content: getApiErrorMessage(result, 'Error Loading Project'),
        type: EMessageType.Error,
      }));
      setLoading(false);

      return;
    }

    const children = await getEntitiesChildrenByIds({
      projectId,
      ids: result.keys.map((key: IKey) => key.id),
    });

    if (isApiError(children)) {
      dispatch(createSystemNotification({
        content: getApiErrorMessage(children, 'Error Loading Child Entities'),
        type: EMessageType.Error,
      }));
      setLoading(false);

      return;
    }

    setChildrenByParentIds(getChildrenByParentIds(children));
    setProject(result);

    setDestinationFolderId(undefined);

    setLoading(false);
  };

  const handleDestinationFolderChange = (id: string) => {
    setDestinationFolderId(id);
  };

  const handleCloseButtonClick = () => {
    onClose();
  };

  const handleCancelClick = () => {
    onCancel();
  };

  const handleMoveClick = async () => {
    if (!destinationFolderId || !selectedEntities || selectedEntities.length < 1) {
      return;
    }

    setShowConfirmationDialog(true);
  };

  const onMoveConfirmation = async () => {
    if (!destinationFolderId || !selectedEntities || selectedEntities.length < 1) {
      return;
    }

    setLoading(true);

    const result = await moveEntities({
      projectId,
      destinationEntityId: destinationFolderId,
      entityIds: selectedEntities,
    });

    if (isApiError(result)) {
      dispatch(createSystemNotification({
        content: getApiErrorMessage(result, 'Error Moving Entities'),
        type: EMessageType.Error,
      }));
      setLoading(false);
      setShowConfirmationDialog(false);

      return;
    }

    setLoading(false);

    onConfirm();
  };

  return (
    <>
      <Modal
        onEscapeKeyPress={onClose}
        customClassNames="modal_withBottomButtons modal_moveEntities"
      >
        {loading && (
          <div className="loading modal-loading" />
        )}
        <div className="modal-header">
          <h4 className="modal-title">Move to...</h4>

          <button
            type="button"
            className="modal-closeButton"
            onClick={handleCloseButtonClick}
            aria-label="Close modal"
          />
        </div>

        <div className="modal-content">
          {(project && project.subfolder) && (
            <button
              type="button"
              className="button secondary"
              onClick={handleBackClick}
            >
              &lt; Back
            </button>
          )}

          <div className="entitiesList">
            {(project && !project.subfolder) && (
              <div className="entitiesList-item">
                <label className="radioControl entitiesList-itemControl entitiesList-itemControl_root">
                  <input
                    type="radio"
                    className="radio"
                    value={project?.projectId}
                    checked={project?.projectId === destinationFolderId}
                    onChange={() => handleDestinationFolderChange(project?.projectId as string)}
                  />
                  <span className="radioControl-text">Root</span>
                </label>
              </div>
            )}

            {project?.keys.map((key: IKey) => {
              if (key.type === 'string') {
                return null;
              }

              if (selectedEntities.includes(key.id)) {
                return null;
              }

              return (
                <div
                  className="entitiesList-item"
                  key={key.id}
                >
                  <label
                    className="radioControl entitiesList-itemControl"
                  >
                    <input
                      type="radio"
                      className="radio"
                      value={key.id}
                      checked={key.id === destinationFolderId}
                      onChange={() => handleDestinationFolderChange(key.id)}
                    />
                    <span className="radioControl-text">{key.label}</span>
                  </label>

                  {childrenByParentIds[key.id] && childrenByParentIds[key.id].folders > 0 && (
                    <button
                      type="button"
                      className="button ghost entitiesList-openButton"
                      onClick={() => handleOpenEntityClick(key.id)}
                    >
                      Open
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="modal-buttonBox">
          <button
            type="button"
            className="button secondary modal-button"
            onClick={handleCancelClick}
          >
            Cancel
          </button>
          <button
            type="button"
            className="button primary modal-button"
            onClick={handleMoveClick}
            disabled={!destinationFolderId}
          >
            Move to selected
          </button>
        </div>
      </Modal>

      {showConfirmationDialog && (
        <Modal customClassNames="dialogModal">
          <div className="modal-header">
            <h4 className="modal-title">Confirm Moving Entities</h4>

            <button
              type="button"
              className="modal-closeButton"
              onClick={() => {
                setShowConfirmationDialog(false);
              }}
              aria-label="Close modal"
            />
          </div>
          <div className="modal-content">
            <div className="dialogModal-content">
              <i className="dialogBadge question danger dialogModal-badge" />
              <div className="dialogModal-contentText">
                <p className="dialogModal-contentPara">Are you sure you want move Selected Entities?</p>
              </div>
            </div>
          </div>
          <div className="modal-buttonBox">
            <button
              type="button"
              className="button secondary dialogModal-button"
              onClick={() => { setShowConfirmationDialog(false); }}
            >
              Cancel
            </button>
            <button
              type="button"
              className="button warning dialogModal-button"
              onClick={onMoveConfirmation}
            >
              Yes, Move
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
