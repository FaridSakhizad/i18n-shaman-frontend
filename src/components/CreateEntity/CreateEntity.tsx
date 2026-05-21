import React, { useState } from 'react';

import Modal from 'components/Modal';

import { createProjectEntity, getMultipleEntitiesDataByParentId } from 'api/projects';
import {
  EntityType,
  IKey,
  IKeyValue,
  IProject, IProjectLanguage,
} from 'interfaces';

import { validateKeyName } from 'utils/validators';

import './CreateEntity.scss';

const ITEMS_PER_ROW = 5;

interface IPros {
  projectId: string;
  parentId: string;
  entityPath: string;
  entityType: EntityType,
  project: IProject;
  onCancel: () => void;
  onConfirm: () => void;
  onClose: () => void;
}

export default function CreateEntity({
  projectId,
  parentId,
  entityPath,
  entityType,
  project,
  onCancel,
  onConfirm,
  onClose,
}: IPros) {
  const [loading, setLoading] = useState<boolean>(false);

  const [keyName, setName] = useState<string>('');
  const [siblingKeys, setSiblingKeys] = useState<IKey[] | null>(null);

  const [keyValues, setValues] = useState<{ [key: string]: string }>({});

  const getInitialSelectedLanguageId = () => {
    if (!project) {
      return '';
    }

    const firstLang = project.languages[0];

    return firstLang ? firstLang.id : '';
  };

  const [selectedLanguageId, setSelectedLanguageId] = useState<string>(getInitialSelectedLanguageId());

  const [keyDescription, setDescription] = useState<string>('');

  const [submitAttemptMade, setSubmitAttemptMade] = useState<boolean>(false);
  const [keyNameError, setKeyNameError] = useState<string>('');

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!project) {
      return;
    }

    setKeyNameError('');

    const { value } = e.target;

    if (submitAttemptMade) {
      const validationResult = validateKeyName(value, null, parentId, siblingKeys as IKey[]);

      if (!validationResult.success) {
        setKeyNameError(validationResult.errors[0].message);
      }
    }

    setName(value);
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = e.target;

    const newValue = { [selectedLanguageId]: value };

    setValues({
      ...keyValues,
      ...newValue,
    });
  };

  const handleTargetLanguageClick = (id: string) => {
    setSelectedLanguageId(id);
  };

  const handleDescriptionChange = ({ target: { value } }: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(value);
  };

  const handleCloseButtonClick = () => {
    onClose();
  };

  const handleCancelClick = () => {
    onCancel();
  };

  const handleCreateClick = async () => {
    if (!project) {
      return;
    }

    setSubmitAttemptMade(true);
    setLoading(true);

    const siblingKeysData = await getMultipleEntitiesDataByParentId({
      projectId,
      parentId,
    });

    setSiblingKeys(siblingKeysData);

    const validationResult = validateKeyName(keyName, project.projectId, parentId, siblingKeysData);

    if (!validationResult.success) {
      setLoading(false);
      setKeyNameError(validationResult.errors[0].message);
      return;
    }

    const newValues: IKeyValue[] = [];

    const newKeyId = Math.random().toString(16).substring(2);

    Object.keys(keyValues).forEach((key) => {
      newValues.push({
        value: keyValues[key],
        languageId: key,
        keyId: newKeyId,
        projectId,
        parentId,
      });
    });

    await createProjectEntity({
      projectId,
      parentId,
      id: newKeyId,
      label: keyName,
      description: keyDescription,
      values: newValues,
      type: entityType,
      pathCache: entityPath,
    });

    setLoading(false);

    onConfirm();
  };

  const getLanguageSelectorItems = () => {
    if (!project) {
      return null;
    }

    const items: any[] = [];

    const { languages } = project;

    let itemsGroupIdx = 0;

    languages.forEach((language, idx) => {
      if (idx > 0 && idx % ITEMS_PER_ROW === 0) {
        itemsGroupIdx += 1;
      }

      if (!items[itemsGroupIdx]) {
        items[itemsGroupIdx] = [];
      }

      items[itemsGroupIdx].push(language);
    });

    if (items.length > ITEMS_PER_ROW) {
      const lastLineItemsToAdd = ITEMS_PER_ROW - items[items.length - 1].length;

      const itemsToAdd = (new Array(lastLineItemsToAdd)).fill({ id: 'dummy' });

      items[items.length - 1] = items[items.length - 1].concat(itemsToAdd);
    }

    return items;
  };

  const targetLanguages = getLanguageSelectorItems();

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <Modal
      customClassNames="modal_withBottomButtons modal_createKey"
      onEscapeKeyPress={handleCloseButtonClick}
    >
      {loading && (
        <div className="loading modal-loading" />
      )}

      <div className="modal-header">
        {entityType === EntityType.String && (
          <h4 className="modal-title">Create New Key</h4>
        )}
        {entityType === EntityType.Folder && (
          <h4 className="modal-title">Create New Folder</h4>
        )}
        {entityType === EntityType.Component && (
          <h4 className="modal-title">Create New Component</h4>
        )}

        <button
          type="button"
          className="modal-closeButton"
          onClick={handleCloseButtonClick}
          aria-label="Close modal"
        />
      </div>

      <div className="modal-content">
        <form className="formMk1" onSubmit={handleFormSubmit}>
          <div className="formMk1-row">
            <div className="formControl">
              <div className="formControl-header">
                <label className="formControl-label" htmlFor="key-name">Name*</label>
              </div>
              <div className="formControl-body">
                <div className="formControl-wrapper">
                  <input
                    id="key-name"
                    type="text"
                    className="input formControl-input"
                    placeholder="Please Enter Unique Key Name..."
                    onChange={handleNameChange}
                    value={keyName}
                  />
                </div>
                <div className="formControl-footer">
                  {(submitAttemptMade && keyNameError.length > 0) && (
                    <div className="formControl-error">{keyNameError}</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {entityType === EntityType.String && (
            <div className="formMk1-row">
              <div className="formControl">
                <table className="targetLanguageSelector">
                  <tbody>
                    {(targetLanguages) && targetLanguages.map((
                      (languagesRow, idx) => (
                        // eslint-disable-next-line react/no-array-index-key
                        <tr className="targetLanguageSelector-row" key={idx}>
                          {languagesRow.map((language: IProjectLanguage, cellIdx: number) => {
                            if (language.id === 'dummy') {
                              return (
                                // eslint-disable-next-line react/no-array-index-key
                                <td className="targetLanguageSelector-cell" key={`dummy-${cellIdx}`}>
                                  <span className="targetLanguageSelector-item targetLanguageSelector-item_dummy" />
                                </td>
                              );
                            }

                            return (
                              <td className="targetLanguageSelector-cell" key={language.id}>
                                <span
                                  className={`targetLanguageSelector-item ${language.id === selectedLanguageId ? 'isActive' : ''}`}
                                  onClick={() => handleTargetLanguageClick(language.id)}
                                >
                                  {language.label}
                                </span>
                              </td>
                            );
                          })}
                        </tr>
                      )
                    ))}
                  </tbody>
                </table>

                <div className="formControl-body">
                  <div className="formControl-wrapper">
                    <textarea
                      id="key-value"
                      className="textarea formControl-textarea createKey-valueTextarea"
                      onChange={handleValueChange}
                      value={keyValues[selectedLanguageId]}
                      key={selectedLanguageId}
                      placeholder="Please Enter Key Value..."
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="formMk1-row">
            <div className="formControl">
              <div className="formControl-header">
                <label className="formControl-label" htmlFor="key-description">Description</label>
              </div>
              <div className="formControl-body">
                <div className="formControl-wrapper">
                  <textarea
                    id="key-description"
                    className="textarea formControl-textarea"
                    onChange={handleDescriptionChange}
                    value={keyDescription}
                  />
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
      <div className="modal-buttonBox">
        <button
          type="button"
          className="button secondary modal-button"
          onClick={handleCancelClick}
        >Cancel
        </button>
        <button
          type="button"
          className="button primary modal-button"
          onClick={handleCreateClick}
          disabled={keyName.length < 1}
        >Create
        </button>
      </div>
    </Modal>
  );
}
