import React, { useState } from 'react';

import Modal from 'components/Modal';
import { IProject } from 'interfaces';
import { EExportFormats, exportProject, IExportProject } from 'api/projects';

import './ExportProject.scss';
import clsx from 'clsx';

interface IProps {
  project: IProject | null;
  onClose: () => void;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function ExportProject(props: IProps) {
  const {
    project,
    onClose,
    onCancel,
    onConfirm,
  } = props;

  const { projectId = '', projectName } = project || {};

  const [loading, setLoading] = useState(false);
  const [exportFormat, setExportFormat] = useState<EExportFormats>();

  const handleSelectFormatButtonClick = (format: EExportFormats) => {
    setExportFormat(format);
  };

  const handleCloseButtonClick = () => {
    onClose();
  };

  const handleCancelButtonClick = () => {
    onCancel();
  };

  const handleExportButtonClick = async () => {
    setLoading(true);

    if (!project || !exportFormat) {
      return;
    }

    const exportSettings: IExportProject = {
      projectId,
      format: exportFormat,
    };

    const response = await exportProject(exportSettings);

    const url = window.URL.createObjectURL(new Blob([response.data]));

    const $link = document.createElement('a');
    $link.href = url;
    $link.download = `${projectName}.zip`;

    document.body.appendChild($link);

    $link.click();
    $link.remove();

    window.URL.revokeObjectURL(url);

    setLoading(false);
    onConfirm();
  };

  return (
    <Modal
      customClassNames="modal_withBottomButtons modal_export"
      onEscapeKeyPress={onClose}
    >
      {loading && (
        <div className="loading modal-loading" />
      )}

      <div className="modal-header">
        <h4 className="modal-title">Export Project</h4>
        <button
          type="button"
          className="modal-closeButton"
          onClick={handleCloseButtonClick}
          aria-label="Close modal"
        />
      </div>

      <div className="modal-content">
        <div className="exportFormatSelect">
          <button
            type="button"
            className={clsx('button exportFormatSelect-button', exportFormat === EExportFormats.json ? 'primary' : 'aqua')}
            onClick={() => handleSelectFormatButtonClick(EExportFormats.json)}
          >
            JSON
          </button>
          <button
            type="button"
            className={clsx('button exportFormatSelect-button', exportFormat === EExportFormats.androidXml ? 'primary' : 'aqua')}
            onClick={() => handleSelectFormatButtonClick(EExportFormats.androidXml)}
          >
            Android XML
          </button>
          <button
            type="button"
            className={clsx('button exportFormatSelect-button', exportFormat === EExportFormats.appleStrings ? 'primary' : 'aqua')}
            onClick={() => handleSelectFormatButtonClick(EExportFormats.appleStrings)}
          >
            Apple Strings
          </button>
        </div>
      </div>

      <div className="modal-buttonBox">
        <button
          type="button"
          className="button modal-button secondary"
          onClick={handleCancelButtonClick}
        >
          Close
        </button>
        <button
          type="button"
          className="button modal-button primary"
          onClick={handleExportButtonClick}
          disabled={!exportFormat}
        >
          Export
        </button>
      </div>
    </Modal>
  );
}
