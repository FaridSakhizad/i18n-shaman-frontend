import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import clsx from 'clsx';

import { AppDispatch } from 'store';
import Modal from 'components/Modal';
import {
  IError,
  IProject,
  IProjectLanguage,
  IUserLanguagesMapItem,
} from 'interfaces';
import { getApiErrorMessage, isApiError } from 'api/errors';

import 'components/ImportLocales/ImportLocales.scss';
import './ImportComponents.scss';
import { importComponentsToProject } from '../../api/projects';
import { createSystemNotification, EMessageType } from '../../store/systemNotifications';
import QuickLanguageAdd from '../QuickLanguageAdd';

interface IProps {
  project: IProject | null;
  onClose: () => void;
  onCancel: () => void;
  onConfirm: () => void;
}

interface IFileListItem {
  name: string;
  format: string;
  language: string;
  code: string;
}

const ITEMS_PER_ROW = 5;

export default function ImportComponents(props: IProps) {
  const {
    project,
    onClose,
    onCancel,
    onConfirm,
  } = props;

  const dispatch = useDispatch<AppDispatch>();

  const [loading, setLoading] = useState(false);

  const [projectLanguages, setProjectLanguages] = useState<IProjectLanguage[]>(project?.languages as IProjectLanguage[] || []);

  const [selectedTargetLanguageCode, setSelectedTargetLanguageCode] = useState<string>(project?.languages[0]?.code || '');

  const [formDataInState, setFormDataInState] = useState(new FormData());

  const [filesList, setFilesList] = useState<IFileListItem[]>([]);

  const generateLanguagesMap = (languagesData: IProjectLanguage[]) => {
    const result:IUserLanguagesMapItem = {};

    languagesData.forEach((language: IProjectLanguage) => {
      result[language.code] = language;
    });

    return result;
  };

  const languagesMap:IUserLanguagesMapItem = generateLanguagesMap(project?.languages || []);

  const handleUploadFileChange = ({ target }: React.ChangeEvent<HTMLInputElement>) => {
    if (!project) {
      return;
    }

    const { files }: { files: FileList | null } = target;

    if (!files) {
      return;
    }

    formDataInState.set('projectId', project.projectId as string);

    const newFilesList = [...filesList];

    for (let i = 0; i < files.length; i += 1) {
      const { name, type } = files[i];

      formDataInState.append('files', files[i]);

      const format = type.split('/')[1];

      const nameWOExtension = name.replace(`.${format}`, '');

      const languageData = languagesMap[selectedTargetLanguageCode];

      const metaData = {
        name: nameWOExtension,
        format,
        language: languageData.label,
        code: languageData.code,
        languageId: languageData.id,
      };

      formDataInState.append('metaData', JSON.stringify(metaData));

      newFilesList.push(metaData);
    }

    setFilesList(newFilesList);
  };

  const handleCloseButtonClick = () => {
    onClose();
  };

  const handleCancelButtonClick = () => {
    onCancel();
  };

  const handleImportButtonClick = async () => {
    if (loading || !project || filesList.length < 1) {
      return;
    }

    setLoading(true);

    const result: { success: boolean } | IError = await importComponentsToProject(formDataInState);

    if (isApiError(result)) {
      dispatch(createSystemNotification({
        content: getApiErrorMessage(result, 'Error Importing Components'),
        type: EMessageType.Error,
      }));
      setLoading(false);

      return;
    }

    if (result.success) {
      dispatch(createSystemNotification({
        content: 'Success!',
        type: EMessageType.Success,
      }));

      setLoading(false);
      onConfirm();

      return;
    }

    dispatch(createSystemNotification({
      content: 'Error Importing Components',
      type: EMessageType.Error,
    }));

    setLoading(false);
  };

  const getLanguageSelectorItems = () => {
    if (!project) {
      return null;
    }

    const items: any[] = [];

    let itemsGroupIdx = 0;

    projectLanguages.forEach((language, idx) => {
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

  const handleTargetLanguageClick = (languageCode: string) => {
    setSelectedTargetLanguageCode(languageCode);
  };

  const handleFileDeleteClick = (idx: number) => {
    const newFilesList = [...filesList];

    newFilesList.splice(idx, 1);

    setFilesList(newFilesList);

    if (!project) {
      return;
    }

    const newFormData = new FormData();

    newFormData.set('projectId', project.projectId as string);

    for (let i = 0; i < formDataInState.getAll('files').length; i += 1) {
      const file = formDataInState.getAll('files')[i];
      const metaData = formDataInState.getAll('metaData')[i];

      if (i !== idx) {
        newFormData.append('files', file);
        newFormData.append('metaData', metaData);
      }
    }

    setFormDataInState(newFormData);
  };

  const afterLanguagesAdded = (languagesData: IProjectLanguage[]) => {
    setProjectLanguages(languagesData);
  };

  const getLanguageCounters = () => {
    const result: { [key: string]: number } = {};

    for (let i = 0; i < filesList.length; i += 1) {
      const { code } = filesList[i];

      if (!result[code]) {
        result[code] = 0;
      }

      result[code] += 1;
    }

    return result;
  };

  const languageCountersMap = getLanguageCounters();

  return (
    <Modal
      customClassNames="modal_withBottomButtons modal_import"
      onEscapeKeyPress={onClose}
    >
      {loading && (
        <div className="loading modal-loading" />
      )}

      <div className="modal-header">
        <h4 className="modal-title">Import Component Files to project</h4>
        <button
          type="button"
          className="modal-closeButton"
          onClick={handleCloseButtonClick}
          aria-label="Close modal"
        />
      </div>

      <div className="modal-content">
        <table className="targetLanguageSelector">
          <tbody>
            {targetLanguages && targetLanguages.map((
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
                          className={`targetLanguageSelector-item ${language.code === selectedTargetLanguageCode ? 'isActive' : ''}`}
                          onClick={() => handleTargetLanguageClick(language.code)}
                        >
                          {language.code}

                          {languageCountersMap[language.code] && (
                            <span className="targetLanguageSelector-filesCount">
                              &nbsp;({languageCountersMap[language.code]})
                            </span>
                          )}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              )
            ))}
          </tbody>
        </table>

        {filesList.length > 0 && (
          <h4 className="h4">Component Files For {languagesMap[selectedTargetLanguageCode].label} language:</h4>
        )}

        <div className="importedFilesList">
          {filesList.map((file: IFileListItem, idx: number) => {
            if (file.code !== selectedTargetLanguageCode) {
              return null;
            }

            return (
              <div
                key={`${file.code}-${file.format}-${idx}`} // eslint-disable-line react/no-array-index-key
                className="importedFilesList-item"
              >
                <div className="importedFilesList-itemName">{file.name}</div>
                <i
                  className="importedFilesList-itemDelete"
                  onClick={() => handleFileDeleteClick(idx)}
                />
              </div>
            );
          })}
        </div>

        <QuickLanguageAdd
          project={project as IProject}
          afterLanguagesAdded={afterLanguagesAdded}
        />

        <span
          className={clsx({ 'button success importedFilesList-upload': true, disabled: !targetLanguages || targetLanguages.length < 1 })}
        >
          {languagesMap[selectedTargetLanguageCode] ? (
            <>Open Files for {languagesMap[selectedTargetLanguageCode].label} language</>
          ) : (
            <>Open Files</>
          )}
          <input
            type="file"
            onChange={handleUploadFileChange}
            accept="application/json"
            multiple
            className="buttonUploadInput"
            disabled={!targetLanguages || targetLanguages.length < 1}
          />
        </span>
      </div>

      <div className="modal-buttonBox">
        <button
          type="button"
          className="button secondary"
          onClick={handleCancelButtonClick}
        >
          Close
        </button>
        <button
          type="button"
          className="button primary"
          onClick={handleImportButtonClick}
          disabled={loading || filesList.length < 1}
        >
          Import
        </button>
      </div>
    </Modal>
  );
}
