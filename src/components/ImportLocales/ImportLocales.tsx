import React, { useState } from 'react';

import Modal from 'components/Modal';
import { useSelector } from 'react-redux';
import { IRootState } from 'store';
import { IProjectLanguage, IUserLanguagesMapItem } from '../../interfaces';

import './ImportLocales.scss';
import AddLanguageControl from '../AddProjectLanguage/AddLanguageControl';
import { importDataToProject } from '../../api/projects';

interface IProps {
  projectId: string;
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

export default function ImportLocales(props: IProps) {
  const {
    projectId,
    onClose,
    onCancel,
    onConfirm,
  } = props;

  const { languages } = useSelector((state: IRootState) => state.app);

  const generateLanguagesMap = (languagesData: IProjectLanguage[]) => {
    const result:IUserLanguagesMapItem = {};

    languagesData.forEach((language: IProjectLanguage) => {
      result[language.code] = language;
    });

    return result;
  };

  const languagesMap:IUserLanguagesMapItem = generateLanguagesMap(languages);

  const [, setLoading] = useState(true);

  const [formDataInState] = useState(new FormData());

  const [filesList, setFilesList] = useState<IFileListItem[]>([]);

  const handleUploadFileChange = ({ target }: React.ChangeEvent<HTMLInputElement>) => {
    const { files }: { files: FileList | null } = target;

    if (!files) {
      return;
    }

    formDataInState.set('projectId', projectId as string);

    const newFilesList = [...filesList];

    for (let i = 0; i < files.length; i += 1) {
      const { name, type } = files[i];

      formDataInState.append('files', files[i]);

      const assumedLanguage = name.split('.')[0];
      const format = type.split('/')[1];

      const languageData = languagesMap[assumedLanguage] || {};

      newFilesList.push({
        name,
        format,
        language: languageData.label,
        code: languageData.code,
      });
    }

    setFilesList(newFilesList);
  };

  const handleFileDeleteClick = (index: number) => {
    const { name } = filesList[index];

    formDataInState.delete(name);

    filesList.splice(index, 1);
    setFilesList([...filesList]);
  };

  const handleCloseButtonClick = () => {
    onClose();
  };

  const handleCancelButtonClick = async () => {
    onCancel();
  };

  const onSelectedLanguagesChange = (data: any, fileIndex: number) => {
    if (data.length < 1) {
      return;
    }

    const [selectedLanguage] = data;

    const { code, label } = selectedLanguage;

    const newFilesList = [...filesList];

    newFilesList[fileIndex] = {
      ...newFilesList[fileIndex],
      code,
      language: label,
    };

    setFilesList(newFilesList);
  };

  const handleImportButtonClick = async () => {
    setLoading(true);

    formDataInState.set('metaData', JSON.stringify(filesList));

    await importDataToProject(formDataInState);

    setLoading(false);
    onConfirm();
  };

  const [openDropdownId, setOpenDropdownId] = useState<string>('');

  const onDropDownOpen = (id: string) => {
    setOpenDropdownId(id);
  };

  return (
    <Modal
      customClassNames="modal_withBottomButtons modal_import"
      onEscapeKeyPress={onClose}
    >
      <div className="modal-header">
        <h4 className="modal-title">Import Language Files to project</h4>
        <button
          type="button"
          className="modal-closeButton"
          onClick={handleCloseButtonClick}
          aria-label="Close modal"
        />
      </div>

      <div className="modal-content">
        {filesList.length > 0 && (
          <div className="importedFilesList">
            {filesList.map((file: IFileListItem, idx: number) => (
              <div
                key={`${file.code}-${file.format}-${idx}`} // eslint-disable-line react/no-array-index-key
                className="importedFilesList-item"
              >
                <div className="importedFilesList-itemName">{file.name}</div>
                <AddLanguageControl
                  id={`${idx}-${file.code}-${file.format}`}
                  selected={file.code ? [languagesMap[file.code]] : []}
                  classNames={`importedFilesList-itemLanguage ${file.code ? 'importedFilesList-itemLanguage_preselected' : ''}`}
                  multiple={false}
                  fullLanguagesList={languages}
                  chipsSelectable={false}
                  onSelectedLanguagesChange={(data) => onSelectedLanguagesChange(data, idx)}
                  onOpen={onDropDownOpen}
                  isOpen={`${idx}-${file.code}-${file.format}` === openDropdownId}
                />
                <i
                  className="importedFilesList-itemDelete"
                  onClick={() => handleFileDeleteClick(idx)}
                />
              </div>
            ))}
          </div>
        )}

        <span className="button success importedFilesList-upload">
          Open Files
          <input
            type="file"
            onChange={handleUploadFileChange}
            accept="application/json"
            multiple
            className="buttonUploadInput"
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
        >
          Import
        </button>
      </div>
    </Modal>
  );
}
