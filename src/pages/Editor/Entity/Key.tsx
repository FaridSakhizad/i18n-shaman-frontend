import React, {
  useState,
  useRef,
  Fragment,
  useEffect,
} from 'react';

import clsx from 'clsx';

import {
  EntityType,
  IKeyTag,
  IKeyValue,
  IProjectLanguage,
  ITag,
} from 'interfaces';
import { useSelector, useDispatch } from 'react-redux';

import { createSystemNotification, EMessageType } from 'store/systemNotifications';

import { updateKey } from 'api/projects';
import { IRootState } from 'store';

import './Key.scss';
import { ROOT } from '../../../constants/app';
import { setSelectedEntities } from '../../../store/editorPage';

interface IProps {
  id: string;
  label: string;
  values: {
    [key: string]: IKeyValue;
  },
  projectId: string;
  parentId: string;
  languages: IProjectLanguage[];
  description: string;
  path?: string;
  pathCache: string;
  tags: IKeyTag[]
  projectTags: ITag[]
}

export default function Key(props: IProps) {
  const {
    id,
    label,
    languages,
    values: valuesFromProps,
    projectId,
    parentId,
    description,
    path = null,
    pathCache,
    tags,
    projectTags = [],
  } = props;

  const dispatch = useDispatch();

  const { keyValues: valuesFromState } = useSelector((state: IRootState) => state.search);
  const { id: userId } = useSelector((state: IRootState) => state.user);

  const { selectedEntities } = useSelector((state: IRootState) => state.editorPage);

  const [loading, setLoading] = useState(false);

  const getInitialValues = () => {
    if (valuesFromState && valuesFromState[id]) {
      return { ...valuesFromState[id] };
    }

    if (valuesFromProps) {
      return valuesFromProps;
    }

    return {};
  };

  const [values, setValues] = useState(getInitialValues());
  const [editValueId, setEditValueId] = useState('');

  const keyEditValueFieldRef = useRef<HTMLTextAreaElement>(null);

  const handleValueChange = ({ target: { value } }: React.ChangeEvent<HTMLTextAreaElement>, valueLanguageId: string) => {
    if (values && values[valueLanguageId] && values[valueLanguageId].value) {
      values[valueLanguageId].value = value;
    } else {
      values[valueLanguageId] = {
        languageId: valueLanguageId,
        value,
        keyId: id,
        projectId,
        parentId,
        pathCache: `${pathCache}/${id}`,
      };
    }

    setValues(structuredClone(values));
  };

  const handleValueSave = async () => {
    setLoading(true);

    const preparedValues: IKeyValue[] = Object.entries(values).map(([, keyValue]) => keyValue);

    const result = await updateKey({
      id,
      label,
      projectId,
      parentId,
      userId: userId as string,
      values: preparedValues,
      description,
    });

    if ('error' in result) {
      dispatch(createSystemNotification({
        content: 'Error While Saving Key',
        type: EMessageType.Error,
      }));
    } else {
      setValues(result.values);

      dispatch(createSystemNotification({
        content: 'Key Saved Successfully',
        type: EMessageType.Success,
      }));
    }

    setEditValueId('');
    setLoading(false);
  };

  const handleValueNameClick = (e: React.MouseEvent<HTMLSpanElement>, languageId: string) => {
    e.preventDefault();
    setEditValueId(languageId);
  };

  useEffect(() => {
    if (editValueId.length > 0 && keyEditValueFieldRef && keyEditValueFieldRef.current) {
      keyEditValueFieldRef.current.focus();

      const { length } = keyEditValueFieldRef.current.value;
      keyEditValueFieldRef.current.setSelectionRange(length, length);
    }
  }, [editValueId]);

  const handleValueEditCancel = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setEditValueId('');
  };

  const handleSelectEntityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = e.target;

    const uniqueEntityIds = new Set<string>(selectedEntities);

    if (checked) {
      uniqueEntityIds.add(id);
    } else {
      uniqueEntityIds.delete(id);
    }

    dispatch(setSelectedEntities(Array.from(uniqueEntityIds)));
  };

  const projectTagsByIdMap = new Map((projectTags || []).map((tag) => [tag.id, tag]));

  return (
    <section className="key key_string">
      <div className="keyHeader">
        <input
          type="checkbox"
          checked={selectedEntities.includes(id)}
          onChange={handleSelectEntityChange}
          className="checkbox keySelectCheckbox"
        />

        <button
          type="button"
          className="keyName"
          title={description}
          data-click-target="keyName"
          data-id={id}
          data-path={`${ROOT}/${path !== ROOT ? `${path}/` : ''}${label}`}
        >
          {label}
        </button>

        {tags && (
          <div className="keyHeader-tags">
            {tags.map((tag) => {
              if (!projectTagsByIdMap.has(tag.id)) {
                return null;
              }

              const { color, customColor } = projectTagsByIdMap.get(tag.id) || {};

              return (
                <span
                  className={clsx({
                    tag: true,
                    [color as string]: !customColor || customColor === null,
                    custom: customColor && customColor !== null,
                  })}
                  style={{ '--custom-color': customColor as string } as React.CSSProperties}
                  key={tag.id}
                  data-click-target="tag"
                  data-id={tag.id}
                >
                  <span
                    className="tag-name"
                    data-click-target="tag"
                    data-id={tag.id}
                  >
                    {projectTagsByIdMap.get(tag.id)?.name}
                  </span>
                </span>
              );
            })}
          </div>
        )}

        <div className="keyHeader-controls">
          <div className="keyHeader-controlsGroup">
            <button
              type="button"
              className="_tags-edit buttonInline keyHeader-control keyHeader-editTags"
              data-click-target="editTags"
              data-id={id}
              aria-label="Edit Tags"
            />

            <button
              type="button"
              className="_entity-edit buttonInline keyHeader-control keyHeader-edit"
              data-click-target="editEntity"
              data-entity-type={EntityType.String}
              data-id={id}
              aria-label="Edit"
            />

            <button
              type="button"
              className="_entity-duplicate buttonInline keyHeader-control keyHeader-duplicate"
              data-click-target="duplicateEntity"
              data-entity-type={EntityType.String}
              data-id={id}
              aria-label="Copy"
            />

            <button
              type="button"
              className="_entity-move buttonInline keyHeader-control keyHeader-move"
              data-click-target="moveEntity"
              data-id={id}
              aria-label="Move"
            />
          </div>

          <div className="keyHeader-controlsGroup">
            <button
              type="button"
              className="_entity-delete buttonInline keyHeader-control keyHeader-delete"
              data-click-target="deleteEntity"
              data-id={id}
              aria-label="Delete"
            />
          </div>
        </div>
      </div>
      <div className="keyContent">
        {languages && languages.map((language: IProjectLanguage) => {
          if (!language.visible) {
            return null;
          }

          return (
            <Fragment key={language.id}>
              <div className="keyContent-lang">
                <span
                  data-click-target="keyLanguage"
                  data-language-id={language.id}
                >
                  {language.customLabelEnabled ? language.customLabel : language.label}
                </span>
              </div>

              <div className="keyContent-value">
                {language.id !== editValueId && (
                  <span className="keyContent-valueName" onClick={(e) => handleValueNameClick(e, language.id)}>
                    {values && values[language.id] && values[language.id].value}
                  </span>
                )}

                {language.id === editValueId && (
                  <div className="keyEdit">
                    {loading && <div className="loading" />}
                    <div className="keyEdit-valueFieldBox">
                      <textarea
                        ref={keyEditValueFieldRef}
                        className="textarea keyEdit-valueField"
                        value={values && values[language.id] && values[language.id].value}
                        onChange={(e) => handleValueChange(e, language.id)}
                      />
                      <span className="keyEdit-valueSymbolsCount">
                        {(values[language.id] && values[language.id].value) ? values[language.id].value.length : 0}
                      </span>
                    </div>

                    <div className="keyEdit-controls">
                      <button
                        type="button"
                        className="button primary keyEdit-saveButton"
                        onClick={handleValueSave}
                      >
                        Save
                      </button>

                      <button
                        type="button"
                        className="button secondary keyEdit-cancelButton"
                        onClick={handleValueEditCancel}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </Fragment>
          );
        })}
      </div>
    </section>
  );
}
