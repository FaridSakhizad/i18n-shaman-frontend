import React, { useEffect, useState } from 'react';
import Modal from 'components/Modal';

import { getUserProjectById } from 'api/projects';
import { IProjectLanguage } from 'interfaces';

import './EditProjectLanguage.scss';
import { updateLanguage, IUpdateLanguage } from '../../api/languages';

interface IProps {
  projectId: string;
  languageId: string;
  onClose: () => void;
  onCancel: () => void;
  onSave: () => void;
}

export default function EditProjectLanguage({
  projectId,
  languageId,
  onClose,
  onCancel,
  onSave,
}: IProps) {
  const [loading, setLoading] = useState(true);
  const [languageInEdit, setLanguageInEdit] = useState<IProjectLanguage | null>(null);

  const getProjectsLanguages = async () => {
    const result = await getUserProjectById({ projectId });

    const language = result.languages.find(({ id }: IProjectLanguage) => id === languageId);

    setLanguageInEdit(language);

    setLoading(false);
  };

  const handleCustomCodeSwitcherChange = ({ target: { checked } }: React.ChangeEvent<HTMLInputElement>) => {
    setLanguageInEdit({
      ...languageInEdit,
      customCodeEnabled: checked,
    } as IProjectLanguage);
  };

  const handleCustomCodeChange = ({ target: { value } }: React.ChangeEvent<HTMLInputElement>) => {
    setLanguageInEdit({
      ...languageInEdit,
      customCode: value,
    } as IProjectLanguage);
  };

  const handleCustomLabelSwitcherChange = ({ target: { checked } }: React.ChangeEvent<HTMLInputElement>) => {
    setLanguageInEdit({
      ...languageInEdit,
      customLabelEnabled: checked,
    } as IProjectLanguage);
  };

  const handleCustomLabelChange = ({ target: { value } }: React.ChangeEvent<HTMLInputElement>) => {
    setLanguageInEdit({
      ...languageInEdit,
      customLabel: value,
    } as IProjectLanguage);
  };

  const handleBaseLanguageChange = ({ target: { checked } }: React.ChangeEvent<HTMLInputElement>) => {
    setLanguageInEdit({
      ...languageInEdit,
      baseLanguage: checked,
    } as IProjectLanguage);
  };

  const handleCloseButtonClick = () => {
    onClose();
  };

  const handleCancelButtonClick = () => {
    onCancel();
  };

  const handleSaveButtonClick = async () => {
    setLoading(true);

    await updateLanguage({
      projectId,
      ...languageInEdit,
    } as IUpdateLanguage);

    setLoading(false);

    onSave();
  };

  useEffect(() => {
    getProjectsLanguages();
  }, []);

  if (!languageInEdit) {
    return null;
  }

  return (
    <Modal
      onEscapeKeyPress={onClose}
      customClassNames="modal_withBottomButtons modal_editProjectLang"
    >
      {loading && (
        <div className="addProjectLang-loading" />
      )}

      <div className="modal-header">
        <h4 className="modal-title">Edit Language {languageInEdit.label}</h4>
        <button
          type="button"
          className="modal-closeButton"
          onClick={handleCloseButtonClick}
          aria-label="Close modal"
        />
      </div>

      <div className="modal-content">
        <form className="formMk1">
          <div className="formMk1-row">
            <div className="formControl">
              <div className="formControl-header">
                <label className="formControl-label" htmlFor="custom_code">
                  Custom language code <i className="formControl-infoIcon" />
                </label>
              </div>
              <div className="formControl-body addProjectLang-switchableControl">
                <input
                  type="checkbox"
                  className="switcher"
                  onChange={handleCustomCodeSwitcherChange}
                  checked={languageInEdit.customCodeEnabled}
                />

                <div className="formControl-wrapper">
                  <input
                    type="text"
                    id="custom_code"
                    className="input formControl-input"
                    disabled={!languageInEdit.customCodeEnabled}
                    value={languageInEdit.customCodeEnabled ? languageInEdit.customCode : languageInEdit.code}
                    onChange={handleCustomCodeChange}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="formMk1-row">
            <div className="formControl">
              <div className="formControl-header">
                <label className="formControl-label" htmlFor="custom_language">
                  Custom language name <i className="formControl-infoIcon" />
                </label>
              </div>
              <div className="formControl-body addProjectLang-switchableControl">
                <input
                  type="checkbox"
                  className="switcher"
                  onChange={handleCustomLabelSwitcherChange}
                  checked={languageInEdit.customLabelEnabled}
                />

                <div className="formControl-wrapper">
                  <input
                    type="text"
                    id="custom_language"
                    className="input formControl-input"
                    disabled={!languageInEdit.customLabelEnabled}
                    value={languageInEdit.customLabelEnabled ? languageInEdit.customLabel : languageInEdit.label}
                    onChange={handleCustomLabelChange}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="formMk1-row">
            <label className="checkboxControl">
              <input
                type="checkbox"
                className="checkbox"
                checked={languageInEdit.baseLanguage}
                onChange={handleBaseLanguageChange}
              />
              <span className="checkboxControl-text">Main Language</span>
              <i className="formControl-infoIcon" />
            </label>
          </div>
        </form>
      </div>

      <div className="modal-buttonBox">
        <button
          type="button"
          className="button secondary addProjectLang-cancelButton"
          onClick={handleCancelButtonClick}
        >
          Close
        </button>
        <button
          type="button"
          className="button primary addProjectLang-addButton"
          onClick={handleSaveButtonClick}
        >
          Save
        </button>
      </div>
    </Modal>
  );
}
