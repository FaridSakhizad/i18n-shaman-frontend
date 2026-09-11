import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import Modal from 'components/Modal';
import { createProject } from '../../store/projects';
import { AppDispatch } from '../../store';
import { createSystemNotification, EMessageType } from '../../store/systemNotifications';
import { getApiErrorMessage } from '../../api/errors';

interface IProps {
  onClose: () => void;
  onCancel: () => void;
}

export default function CreateProject({
  onClose,
  onCancel,
}: IProps) {
  const dispatch = useDispatch<AppDispatch>();

  const [loading, setLoading] = useState<boolean>(false);

  const handleCloseButtonClick = () => {
    onClose();
  };

  const handleCancelClick = () => {
    onCancel();
  };

  const [newProjectName, setNewProjectName] = useState<string>('');

  const handleNewProjectNameChange = ({ target: { value } }: React.ChangeEvent<HTMLInputElement>) => {
    setNewProjectName(value);
  };

  const handleSaveClick = async () => {
    const projectName = newProjectName.trim();

    if (!projectName || loading) {
      return;
    }

    setLoading(true);

    try {
      await dispatch(createProject({
        newProjectName: projectName,
      })).unwrap();

      onClose();
    } catch (error) {
      dispatch(createSystemNotification({
        content: getApiErrorMessage(error, 'Error Creating Project'),
        type: EMessageType.Error,
      }));
    }

    setLoading(false);
  };

  return (
    <Modal customClassNames="modal_withBottomButtons modal_newProject">
      {loading && (
        <div className="loading modal-loading" />
      )}

      <div className="modal-header">
        <h4 className="modal-title">Create New Project</h4>

        <button
          type="button"
          className="modal-closeButton"
          onClick={handleCloseButtonClick}
          aria-label="Close modal"
        />
      </div>

      <div className="modal-content">
        <div className="formControl">
          <div className="formControl-header">
            <label className="formControl-label" htmlFor="key-name">Name</label>
          </div>
          <div className="formControl-body">
            <div className="formControl-wrapper">
              <input
                type="text"
                className="input formControl-input"
                placeholder="Please Enter Project Name..."
                onChange={handleNewProjectNameChange}
                value={newProjectName}
              />
            </div>
            <div className="formControl-footer">
            </div>
          </div>
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
          className="button success modal-button"
          onClick={handleSaveClick}
          disabled={loading || newProjectName.trim().length < 1}
        >
          Save
        </button>
      </div>
    </Modal>
  );
}
