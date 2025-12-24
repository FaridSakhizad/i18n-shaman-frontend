import React, { useState } from 'react';
import clsx from 'clsx';

import { IProject, ITag } from 'interfaces';

import './TagsEditor.css';
import { deleteTag, updateTag } from '../../api/projects';
import Modal from '../../components/Modal';

interface IProps {
  project: IProject
}

export default function TagsEditor(props: IProps) {
  const { project } = props

  const { tags } = project;

  const [ tagsList, setTagsList] = useState<ITag[]>(tags);

  const [tagInEdit, setTagInEdit] = useState<ITag | null>(null);
  const [showColorPicker, setShowColorPicker] = useState<boolean>(false);

  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedCustomColor, setSelectedCustomColor] = useState<string | null>(null);

  const [tagToDelete, setTagToDelete] = useState<ITag | null>(null);

  const handleEditTagButtonClick = (tag: ITag) => {
    setTagInEdit(tag);
  }

  const handleDeleteTagButtonClick = (tag: ITag) => {
    setTagToDelete(tag);
  }

  const handleTagNameChange = ({ target: { value: name } }: React.ChangeEvent<HTMLInputElement>) => {
    if (!tagInEdit) {
      return null
    };

    setTagInEdit({
      ...tagInEdit,
      name
    });
  }

  const handleCancelClick = () => {
    setTagInEdit(null);
  }

  const handleSaveClick = async () => {
    if (!tagInEdit) {
      return;
    }

    const result = await updateTag({
      projectId: project.projectId,
      ...tagInEdit as ITag
    });

    const tagIdx = tagsList.findIndex(tag => tag.id === tagInEdit.id);

    tagsList[tagIdx] = tagInEdit;

    setTagsList([...tagsList]);

    setTagInEdit(null);
  }

  const colorsArray = [
    1, 4, 7, 10, 13, 16, 19, 22,
    2, 5, 8, 11, 14, 17, 20, 23,
    3, 6, 9, 12, 15, 18, 21, 24,
  ];

  const handleColorClick = (color: string) => {
    setSelectedCustomColor(null);
    setSelectedColor(color);
  }

  const handleColorPickerCancelClick = () => {
    setSelectedCustomColor(null);
    setSelectedColor(null);
    setShowColorPicker(false);
  }

  const handleColorPickerOkayClick = () => {
    setTagInEdit({
      ...tagInEdit as ITag,
      color: selectedColor as string,
      customColor: selectedCustomColor as string,
    });

    setSelectedColor(null);
    setSelectedCustomColor(null);
    setShowColorPicker(false);
  }

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedCustomColor(e.target.value);
  }

  const handleColorPickerClick = () => {
    if (!tagInEdit) {
      return;
    }

    setSelectedColor(tagInEdit.color);
    setSelectedCustomColor(tagInEdit.customColor as string);
    setShowColorPicker(true);
  }

  const handleCancelDeleteClick = () => {
    setTagToDelete(null);
  }

  const handleConfirmDeleteClick = async () => {
    if (!tagToDelete) {
      return
    }

    const result = await deleteTag({
      projectId: project.projectId,
      tagId: tagToDelete.id as string,
    });

    setTagToDelete(null);
  }

  return (
    <>
      <div className="tagsEditor">
        <div className="tagsEditor-list">
          {tagsList.map((tag: ITag) => {
            if (tagInEdit && (tag.id === tagInEdit.id)) {
              return (
                <div key={tag.id} className="tagsEditor-listItem">
                  <div className="tagsEdit">
                    <div className="formControl tagsEdit-input">
                      <div className="formControl-body">
                        <div className="formControl-wrapper">
                          <i
                            className={clsx({
                              'formControl-iconStart tagColorIcon': true,
                              [tagInEdit.color as string]: !tagInEdit.customColor || tagInEdit.customColor === null,
                              custom: tagInEdit.customColor && tagInEdit.customColor !== null
                            })}
                            style={{ '--custom-color': tagInEdit.customColor as string } as React.CSSProperties}
                            onClick={handleColorPickerClick}
                          />
                          <i
                            className="formControl-iconEnd tagsEdit-colorPicker"
                            onClick={handleColorPickerClick}
                          />
                          <input
                            className="input formControl-input"
                            value={tagInEdit.name}
                            onChange={handleTagNameChange}
                          />
                        </div>
                      </div>
                      <div className="formControl-footer">
                        {false && (
                          <div className="formControl-error">Please Enter Your Name</div>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      className="button secondary tagsEdit-cancelButton"
                      aria-label="Cancel"
                      onClick={handleCancelClick}
                    />
                    <button
                      type="button"
                      className="button success tagsEdit-saveButton"
                      aria-label="Save"
                      onClick={handleSaveClick}
                    />
                  </div>
                </div>
              )
            }

            return (
              <div key={tag.id} className="tagsEditor-listItem">
                <span
                  className={clsx({
                    tag: true,
                    [tag.color as string]: !tag.customColor || tag.customColor === null,
                    custom: tag.customColor && tag.customColor !== null
                  })}
                  style={{ '--custom-color': tag.customColor as string } as React.CSSProperties}
                >{tag.name}</span>

                <div className="tagsEditor-listItemControls">
                  {tagToDelete && tagToDelete.id === tag.id ? (
                    <>
                      <button
                        type="button"
                        className="button secondary tagsEditor-listItemControlButton"
                        onClick={handleCancelDeleteClick}
                      >Cancel</button>
                      <button
                        type="button"
                        className="button danger tagsEditor-listItemControlButton"
                        onClick={handleConfirmDeleteClick}
                      >Delete</button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="buttonInline tagsEditor-listItemControl tagsEditor-listItemControl_edit"
                        aria-label="Edit"
                        onClick={() => handleEditTagButtonClick(tag)}
                      />
                      <button
                        type="button"
                        className="buttonInline tagsEditor-listItemControl tagsEditor-listItemControl_delete"
                        aria-label="Delete"
                        onClick={() => handleDeleteTagButtonClick(tag)}
                      />
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {showColorPicker && tagInEdit && (
        <Modal customClassNames="tagsEditor-colorPicker">
          <div className="modal-content">
            <div className="tagsEditor-tagRow">
              <span
                className={clsx({
                  tag: true,
                  [selectedColor as string]: selectedCustomColor === null,
                  custom: selectedCustomColor !== null
                })}
                style={{'--custom-color': selectedCustomColor as string } as React.CSSProperties}
              >{tagInEdit.name}</span>

              <div className="button primary tagsEditor-moreColorsButton">
                More colors...
                <input
                  type="color"
                  className="tagsEditor-moreColorsInput"
                  onChange={handleCustomColorChange}
                  value={selectedCustomColor as string || ''}
                />
              </div>
            </div>

            <div className="tagsEditor-colorSwatch">
            {colorsArray.map((color) => (
                <i
                  role="icon"
                  key={color}
                  className={`tagsEditor-color color${color}`}
                  onClick={() => handleColorClick(`color${color}`)}
                />
              ))}
            </div>
          </div>

          <div className="modal-buttonBox">
            <button
              type="button"
              className="button secondary dialogModal-button"
              onClick={handleColorPickerCancelClick}
            >
              Cancel
            </button>
            <button
              type="button"
              className="button primary dialogModal-button"
              onClick={handleColorPickerOkayClick}
            >
              OK
            </button>
          </div>
        </Modal>
      )}
    </>
  )
};
