import React, { useState } from 'react';
import Modal from 'components/Modal';

import {
  IProject,
} from 'interfaces';

interface IProps {
  project: IProject;
  onClose: () => void;
  onCancel: () => void;
  onSave: (project: IProject) => Promise<boolean>;
}

export default function EditProject({
  project: projectFromProps,
  onClose,
  onCancel,
  onSave,
}: IProps) {
  const [loading, setLoading] = useState<boolean>(false);

  const [project, setProject] = useState<IProject>(projectFromProps);

  const handleProjectNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProject({
      ...project,
      projectName: e.target.value,
    });
  };

  const handleCancelClick = () => {
    onCancel();
  };

  const handleCloseButtonClick = () => {
    onClose();
  };

  const handleSaveClick = async () => {
    if (loading || project.projectName.trim().length < 1) {
      return;
    }

    setLoading(true);
    const saved = await onSave({
      ...project,
      projectName: project.projectName.trim(),
    });

    if (!saved) {
      setLoading(false);
    }
  };

  return (
    <Modal customClassNames="modal_withBottomButtons modal_editProject">
      {loading && (
        <div className="loading modal-loading" />
      )}

      <div className="modal-header">
        <h4 className="modal-title">Edit Project</h4>

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
                onChange={handleProjectNameChange}
                value={project.projectName}
              />
            </div>
            <div className="formControl-footer">
              {false && (
                <div className="formControl-error">EDIT PROJECT ERROR</div>
              )}
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
          className="button primary modal-button"
          onClick={handleSaveClick}
          disabled={loading || project.projectName.trim().length < 1}
        >
          Save
        </button>
      </div>
    </Modal>
  );
}
