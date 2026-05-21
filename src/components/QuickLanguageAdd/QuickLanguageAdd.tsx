import React, { useEffect, useState } from 'react';

import AddLanguageControl from 'components/AddProjectLanguage/AddLanguageControl';
import { addMultipleLanguages, getAppLanguagesData } from 'api/languages';
import { createSystemNotification, EMessageType } from 'store/systemNotifications';

import {
  ILanguage,
  IProject,
  IProjectLanguage,
  IUserLanguagesMapItem,
} from 'interfaces';

import './QuickLanguageAdd.scss';
import { useDispatch } from 'react-redux';

interface IProps {
  project: IProject;
  afterLanguagesAdded?: (data: IProjectLanguage[]) => void;
}

export default function QuickLanguageAdd(props: IProps) {
  const { project, afterLanguagesAdded = () => {} } = props;
  const { projectId, languages: existingLanguages } = project || {};

  const dispatch = useDispatch();

  const [availableLanguagesList, setAvailableLanguagesList] = useState<ILanguage[]>([]);

  const [languageData, setLanguageData] = useState<ILanguage[] | undefined>();

  const [selectedLanguages, setSelectedLanguages] = useState<ILanguage[]>([]);

  const [loading, setLoading] = useState<boolean>(false);

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

  const fetchLanguagesData = async () => {
    setLoading(true);

    const result = await getAppLanguagesData();

    const availableLanguages = getAvailableLanguages(existingLanguages, result);

    setLanguageData(result);
    setAvailableLanguagesList(availableLanguages);

    setLoading(false);
  };

  useEffect(() => {
    fetchLanguagesData();
  }, []);

  const handleAddSelectedClick = async () => {
    if (loading) {
      return;
    }

    if (!selectedLanguages || selectedLanguages.length < 1) {
      return;
    }

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
      projectId: projectId as string,
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

      setAvailableLanguagesList(getAvailableLanguages(resultProject.languages, languageData));
      setSelectedLanguages([]);
    }

    setLoading(false);

    afterLanguagesAdded(resultProject.languages);
  };

  const handleSelectedLanguagesChange = (data: ILanguage[]) => {
    setSelectedLanguages(data);
  };

  return (
    <div className="quickLanguageAdd">
      {loading && (
        <div className="loading" />
      )}
      <AddLanguageControl
        fullLanguagesList={availableLanguagesList as ILanguage[]}
        chipsSelectable={false}
        onSelectedLanguagesChange={handleSelectedLanguagesChange}
        selected={selectedLanguages}
      />

      <button
        type="button"
        className="button primary quickLanguageAdd-addButton"
        onClick={handleAddSelectedClick}
        aria-label="Add Selected Languages"
        disabled={selectedLanguages.length < 1}
      />
    </div>
  );
}
