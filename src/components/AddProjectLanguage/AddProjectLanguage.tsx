import React, { useCallback, useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';

import Modal from 'components/Modal';

import { createSystemNotification, EMessageType } from 'store/systemNotifications';

import { ILanguage, IProjectLanguage, IUserLanguagesMapItem } from 'interfaces';
import { addMultipleLanguages, getAppLanguagesData } from 'api/languages';
import { getUserProjectById } from 'api/projects';
import { getApiErrorMessage, isApiError } from 'api/errors';
import { trackEvent } from 'api/tracking';

import AddLanguageControl from './AddLanguageControl';

import './AddProjectLanguage.scss';

interface IProps {
  projectId: string;
  onClose: () => void;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function AddProjectLanguage({
  projectId,
  onClose,
  onCancel,
  onConfirm,
}: IProps) {
  const dispatch = useDispatch();

  const [loading, setLoading] = useState<boolean>(true);
  const [fullLanguagesList, setFullLanguagesList] = useState<ILanguage[]>([]);

  const [selectedLanguages, setSelectedLanguages] = useState<IProjectLanguage[]>([]);

  const getProjectLanguages = useCallback(async () => {
    const result = await getUserProjectById({ projectId });

    const languages = await getAppLanguagesData();

    const languagesMap:IUserLanguagesMapItem = {};

    if (isApiError(result)) {
      dispatch(createSystemNotification({
        content: getApiErrorMessage(result, 'Error Loading Project Languages'),
        type: EMessageType.Error,
      }));
    } else if (isApiError(languages)) {
      dispatch(createSystemNotification({
        content: getApiErrorMessage(languages, 'Error Loading Languages'),
        type: EMessageType.Error,
      }));
    } else {
      result.languages.forEach((language: IProjectLanguage) => {
        languagesMap[language.code] = language;
      });

      const availableLanguages = languages.filter(({ code }: ILanguage) => languagesMap[code] === undefined);

      setFullLanguagesList(availableLanguages);
    }

    setLoading(false);
  }, [dispatch, projectId]);

  useEffect(() => {
    getProjectLanguages();
  }, [getProjectLanguages]);

  const [currentLanguageIdx, setCurrentLanguageIdx] = useState<number>(-1);

  const handleCustomCodeSwitcherChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedLanguages || !selectedLanguages[currentLanguageIdx]) {
      return;
    }

    setSelectedLanguages(selectedLanguages.map((language, idx) => (
      idx === currentLanguageIdx
        ? { ...language, customCodeEnabled: e.currentTarget.checked }
        : language
    )));
  };

  const handleCustomCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedLanguages(selectedLanguages.map((language, idx) => (
      idx === currentLanguageIdx
        ? { ...language, customCode: e.currentTarget.value }
        : language
    )));
  };

  const handleCustomLabelSwitcherChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedLanguages || !selectedLanguages[currentLanguageIdx]) {
      return;
    }

    setSelectedLanguages(selectedLanguages.map((language, idx) => (
      idx === currentLanguageIdx
        ? { ...language, customLabelEnabled: e.currentTarget.checked }
        : language
    )));
  };

  const handleCustomLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedLanguages(selectedLanguages.map((language, idx) => (
      idx === currentLanguageIdx
        ? { ...language, customLabel: e.currentTarget.value }
        : language
    )));
  };

  const handleBaseLanguageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedLanguages(selectedLanguages.map((language, idx) => (
      idx === currentLanguageIdx
        ? { ...language, baseLanguage: e.currentTarget.checked }
        : language
    )));
  };

  const handleCancelButtonClick = () => {
    onCancel();
  };

  const handleCloseButtonClick = () => {
    onClose();
  };

  const handleAddButtonClick = async () => {
    setLoading(true);

    const languagesData: IProjectLanguage[] = selectedLanguages.map((language: IProjectLanguage) => {
      const languageData = {
        ...language,
      };

      if (language.customLabelEnabled && !language.customLabel) {
        languageData.customLabel = language.label;
      }

      if (language.customCodeEnabled && !language.customCode) {
        languageData.customCode = language.code;
      }

      return languageData;
    });

    const result = await addMultipleLanguages({
      languages: languagesData,
      projectId,
    });

    if (isApiError(result)) {
      dispatch(createSystemNotification({
        content: getApiErrorMessage(result, 'Error Adding Project Language'),
        type: EMessageType.Error,
      }));
    } else {
      dispatch(createSystemNotification({
        content: 'Language Added Successfully',
        type: EMessageType.Success,
      }));

      void trackEvent('language_added', {
        project_id: projectId,
        language_count: selectedLanguages.length,
      });

      onConfirm();
    }

    setLoading(false);
  };

  const handleSelectedLanguagesChange = (data: ILanguage[]) => {
    setSelectedLanguages(data.map((item) => ({
      baseLanguage: false,
      visible: true,
      customLabelEnabled: false,
      customLabel: '',
      customCodeEnabled: false,
      customCode: '',
      ...item,
    })));
  };

  const handleCurrentLanguageIdxChange = (index: number) => {
    setCurrentLanguageIdx(index);
  };

  return (
    <Modal
      customClassNames="modal_withBottomButtons modal_addProjectLang"
      onEscapeKeyPress={onClose}
    >
      {loading && (
        <div className="addProjectLang-loading" />
      )}
      <div className="modal-header">
        <h4 className="modal-title">Add New Languages</h4>
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
              {fullLanguagesList.length > 0 && (
                <AddLanguageControl
                  fullLanguagesList={fullLanguagesList}
                  onSelectedLanguagesChange={handleSelectedLanguagesChange}
                  onCurrentLanguageIdxChange={handleCurrentLanguageIdxChange}
                />
              )}
            </div>
          </div>

          <div className={`languagesOptionsBox ${selectedLanguages[currentLanguageIdx] ? 'isActive' : ''}`}>
            {selectedLanguages[currentLanguageIdx] && (
              <section key={currentLanguageIdx} className="formMk1 languagesOptions">
                <div className="row">
                  <h3 className="h3">
                    Options for <b>{selectedLanguages[currentLanguageIdx].label} ({selectedLanguages[currentLanguageIdx].code})</b>
                  </h3>
                </div>
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
                        disabled={!selectedLanguages[currentLanguageIdx]}
                        checked={selectedLanguages[currentLanguageIdx] && selectedLanguages[currentLanguageIdx].customCodeEnabled}
                      />

                      <div className="formControl-wrapper">
                        <input
                          type="text"
                          id="custom_code"
                          className="input formControl-input"
                          disabled={!selectedLanguages[currentLanguageIdx] || !selectedLanguages[currentLanguageIdx].customCodeEnabled}
                          value={selectedLanguages[currentLanguageIdx] ? (selectedLanguages[currentLanguageIdx].customCode || selectedLanguages[currentLanguageIdx].code) : ''}
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
                        disabled={!selectedLanguages[currentLanguageIdx]}
                        checked={selectedLanguages[currentLanguageIdx] && selectedLanguages[currentLanguageIdx].customLabelEnabled}
                      />

                      <div className="formControl-wrapper">
                        <input
                          type="text"
                          id="custom_language"
                          className="input formControl-input"
                          disabled={!selectedLanguages[currentLanguageIdx] || !selectedLanguages[currentLanguageIdx].customLabelEnabled}
                          value={selectedLanguages[currentLanguageIdx] ? (selectedLanguages[currentLanguageIdx].customLabel || selectedLanguages[currentLanguageIdx].label) : ''}
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
                      disabled={!selectedLanguages[currentLanguageIdx]}
                      checked={selectedLanguages[currentLanguageIdx] && selectedLanguages[currentLanguageIdx].baseLanguage}
                      onChange={handleBaseLanguageChange}
                    />
                    <span className="checkboxControl-text">Main Language</span>
                    <i className="formControl-infoIcon" />
                  </label>
                </div>
              </section>
            )}
          </div>
        </form>
      </div>
      <div className="modal-buttonBox">
        <button
          type="button"
          className="button secondary modal-button addProjectLang-cancelButton"
          onClick={handleCancelButtonClick}
        >
          Close
        </button>
        <button
          type="button"
          className="button primary modal-button addProjectLang-addButton"
          onClick={handleAddButtonClick}
          disabled={selectedLanguages.length === 0}
        >
          Add
        </button>
      </div>
    </Modal>
  );
}
