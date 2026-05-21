import React, { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';

import { createSystemNotification, EMessageType } from 'store/systemNotifications';

import {
  IProjectLanguage,
  IProjectUpdateError,
  IProject,
  IUserLanguagesMapItem,
  ILanguage,
} from 'interfaces';

import {
  setMultipleLanguagesVisibility,
  setLanguageVisibility,
  deleteLanguage,
  addMultipleLanguages,
  getAppLanguagesData,
} from 'api/languages';

import Modal from 'components/Modal';
import AddLanguageControl from 'components/AddProjectLanguage/AddLanguageControl';

import './ProjectLanguages.scss';

interface IProps {
  project: any;
  onClose: () => void;
  onHideAll: () => void;
  onHide: (langId: string) => void;
  onAddLanguage?: () => void;
  onEdit: (langId: string) => void;
  onDelete: (langId: string) => void;
}

export default function ProjectLanguages({
  project,
  onHideAll,
  onHide,
  onEdit,
  onAddLanguage = () => {},
  onDelete,
  onClose,
}: IProps) {
  const dispatch = useDispatch();

  const [projectLanguages, setProjectLanguages] = useState(project.languages);
  const [languageData, setLanguageData] = useState<ILanguage[] | undefined>();

  const getAvailableLanguages = (languages: IProjectLanguage[], allLanguages: ILanguage[] | undefined) => {
    const languagesMap:IUserLanguagesMapItem = {};

    languages.forEach((language: IProjectLanguage) => {
      languagesMap[language.code] = language;
    });

    if (!allLanguages) {
      return [];
    }

    return allLanguages.filter(({ code }: ILanguage) => languagesMap[code] === undefined);
  };

  const [availableLanguagesList, setAvailableLanguagesList] = useState<ILanguage[]>();

  const [loading, setLoading] = useState<boolean>(false);

  const fetchLanguagesData = async () => {
    setLoading(true);

    const result = await getAppLanguagesData();

    const availableLanguages = getAvailableLanguages(project.languages, result);

    setLanguageData(result);
    setAvailableLanguagesList(availableLanguages);

    setLoading(false);
  };

  useEffect(() => {
    fetchLanguagesData();
  }, []);

  const toggleAllVisibilityClick = async (allVisible: boolean) => {
    setLoading(true);

    const visibilityData = project.languages.map(({ id }: IProjectLanguage) => ({
      languageId: id,
      visible: allVisible,
    }));

    const result: IProject | IProjectUpdateError = await setMultipleLanguagesVisibility(project.projectId, visibilityData);

    if ('error' in result) {
      dispatch(createSystemNotification({
        content: result.message || 'Error updating All Project Languages visibility',
        type: EMessageType.Error,
      }));
    } else {
      setProjectLanguages(result.languages);
    }

    setLoading(false);

    onHideAll();
  };

  const handleHideLangClick = async (e: React.MouseEvent<HTMLButtonElement>, langId: string) => {
    setLoading(true);

    const result: IProject | IProjectUpdateError = await setLanguageVisibility(project.projectId, langId, false);

    if ('error' in result) {
      dispatch(createSystemNotification({
        content: result.message || 'Error updating Project Language visibility',
        type: EMessageType.Error,
      }));
    } else {
      setProjectLanguages(result.languages);
    }

    setLoading(false);

    onHide(langId);
  };

  const handleShowLangClick = async (e: React.MouseEvent<HTMLButtonElement>, langId: string) => {
    setLoading(true);

    const result: IProject | IProjectUpdateError = await setLanguageVisibility(project.projectId, langId, true);

    if ('error' in result) {
      dispatch(createSystemNotification({
        content: result.message || 'Error updating Project Language information',
        type: EMessageType.Error,
      }));
    } else {
      setProjectLanguages(result.languages);
    }

    setLoading(false);

    onHide(langId);
  };

  const handleEditClick = (e: React.MouseEvent<HTMLButtonElement>, langId: string) => {
    onEdit(langId);
  };

  const [isDeleteConfirmationVisible, setIsDeleteConfirmationVisible] = useState<boolean>(false);
  const isDeleteConfirmationVisibleRef = useRef<boolean>(isDeleteConfirmationVisible);
  isDeleteConfirmationVisibleRef.current = isDeleteConfirmationVisible;

  const [langToBeDeletedId, setLangToBeDeletedId] = useState<string>('');

  const deleteProjectLanguage = async (langId: string) => {
    setLoading(true);

    const result: IProject | IProjectUpdateError = await deleteLanguage(project.projectId, langId);

    if ('error' in result) {
      dispatch(createSystemNotification({
        content: result.message || 'Error Deleting Project Language',
        type: EMessageType.Error,
      }));
    } else {
      setProjectLanguages(result.languages);

      const availableLanguages = getAvailableLanguages(result.languages, languageData);

      setAvailableLanguagesList(availableLanguages);
    }

    setLangToBeDeletedId('');

    setLoading(false);

    onDelete(langId);
  };

  const handleDeleteClick = async (e: React.MouseEvent<HTMLButtonElement>, langId: string) => {
    setLangToBeDeletedId(langId);
    setIsDeleteConfirmationVisible(true);
  };

  const [isQuickAddVisible, setIsQuickAddVisible] = useState(false);

  const handleQuickAddClick = () => {
    setIsQuickAddVisible(!isQuickAddVisible);
  };

  const [selectedLanguages, setSelectedLanguages] = useState<ILanguage[]>([]);

  const handleQuickAddSaveClick = async () => {
    if (loading) {
      return;
    }

    setIsQuickAddVisible(true);
    setLoading(true);

    const languagesData: IProjectLanguage[] = selectedLanguages.map((language: ILanguage) => ({
      baseLanguage: false,
      visible: true,
      customLabelEnabled: false,
      customLabel: '',
      customCodeEnabled: false,
      customCode: '',
      ...language,
    }));

    const resultProject = await addMultipleLanguages({
      languages: languagesData,
      projectId: project.projectId,
    });

    if (resultProject.error) {
      dispatch(createSystemNotification({
        content: resultProject.message || 'Error Adding Project Language',
        type: EMessageType.Error,
      }));
    } else {
      dispatch(createSystemNotification({
        content: 'Language Added Successfully',
        type: EMessageType.Success,
      }));

      setIsQuickAddVisible(false);
      setAvailableLanguagesList(getAvailableLanguages(resultProject.languages, languageData));
      setProjectLanguages(resultProject.languages);
    }

    setLoading(false);

    onAddLanguage();
  };

  const handleSelectedLanguagesChange = (data: ILanguage[]) => {
    setSelectedLanguages(data);
  };

  const handleCloseButtonClick = () => {
    onClose();
  };

  const renderDeleteConfirmationModal = () => {
    const handleDeleteConfirmationCloseButtonClick = () => {
      setIsDeleteConfirmationVisible(false);
    };

    const handleDeleteConfirmationCancelButtonClick = () => {
      setIsDeleteConfirmationVisible(false);
    };

    const handleDeleteConfirmationConfirmButtonClick = () => {
      deleteProjectLanguage(langToBeDeletedId);
      setIsDeleteConfirmationVisible(false);
    };

    return (
      <Modal customClassNames="dialogModal">
        <div className="modal-header">
          <h4 className="modal-title">Delete Project Language</h4>

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
              <p className="dialogModal-contentPara">Are you sure you want to Delete Project Language <b>Russian (Ru)</b> and all it’s translations? <b>Warning: this action can not be reverted.</b></p>
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

  const handleProjectLangsEscapeKeyPress = () => {
    if (!isDeleteConfirmationVisibleRef.current) {
      onClose();
    }
  };

  return (
    <>
      <Modal
        customClassNames="modal_withBottomButtons projectLangsModal"
        onEscapeKeyPress={handleProjectLangsEscapeKeyPress}
      >
        {loading && (<div className="loading projectLangsModal-loading" />)}

        <div className="modal-header">
          <h4 className="modal-title">Project Languages</h4>

          <button
            type="button"
            className="modal-closeButton"
            onClick={handleCloseButtonClick}
            aria-label="Close modal"
          />
        </div>

        <div className="modal-content">
          <div className="projectLangs">
            {projectLanguages && projectLanguages.map(({
              id,
              label,
              code,
              visible,
            }: IProjectLanguage) => (
              <div className={`projectLangs-item ${visible ? '' : 'isHidden'}`} key={id}>
                <div className="projectLangs-itemIcon" />
                <div className="projectLangs-itemTitle">
                  <span className="projectLangs-itemName">{label}</span>
                  <span className="projectLangs-itemCode">{code}</span>
                </div>
                <div className="projectLangs-itemControls">
                  {visible ? (
                    <button
                      type="button"
                      className="projectLangs-itemControl projectLangs-itemControl_hide"
                      aria-label="Hide Language"
                      onClick={(e) => handleHideLangClick(e, id)}
                    />
                  ) : (
                    <button
                      type="button"
                      className="projectLangs-itemControl projectLangs-itemControl_show"
                      aria-label="Hide Language"
                      onClick={(e) => handleShowLangClick(e, id)}
                    />
                  )}
                  <button
                    type="button"
                    className="projectLangs-itemControl projectLangs-itemControl_edit"
                    aria-label="Edit Language"
                    onClick={(e) => handleEditClick(e, id)}
                  />
                  <button
                    type="button"
                    className="projectLangs-itemControl projectLangs-itemControl_delete"
                    aria-label="Delete Language"
                    onClick={(e) => handleDeleteClick(e, id)}
                  />
                </div>
              </div>
            ))}
            {(isQuickAddVisible && availableLanguagesList && availableLanguagesList.length > 0) && (
              <div className="projectLangs-quickControl">
                <AddLanguageControl
                  fullLanguagesList={availableLanguagesList as ILanguage[]}
                  chipsSelectable={false}
                  onSelectedLanguagesChange={handleSelectedLanguagesChange}
                />
                <button
                  type="button"
                  className="button primary projectLangs-quickAddSave"
                  onClick={handleQuickAddSaveClick}
                  aria-label="Save Language"
                />
              </div>
            )}
          </div>
        </div>
        <div className="modal-buttonBox">
          <button
            type="button"
            className="button success projectLangs-quickAddButton"
            onClick={handleQuickAddClick}
          >
            Quick Add Language
          </button>

          <button
            type="button"
            className="buttonInline link projectLangs-showAllButton"
            onClick={() => toggleAllVisibilityClick(true)}
          >
            <i className="projectLangs-hideAllIcon" />
            <i className="projectLangs-hideAllIcon" />
            <i className="projectLangs-hideAllIcon" />
            Show All
          </button>

          <button
            type="button"
            className="buttonInline link projectLangs-hideAllButton"
            onClick={() => toggleAllVisibilityClick(false)}
          >
            <i className="projectLangs-hideAllIcon" />
            <i className="projectLangs-hideAllIcon" />
            <i className="projectLangs-hideAllIcon" />
            Hide All
          </button>
        </div>
      </Modal>
      {isDeleteConfirmationVisible && renderDeleteConfirmationModal()}
    </>
  );
}
