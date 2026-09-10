import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, IRootState } from 'store';
import { Link, useNavigate } from 'react-router-dom';

import { logout } from 'api/user';
import { IProject } from 'interfaces';
import { clearSession } from 'store/user';
import { createSystemNotification, EMessageType } from 'store/systemNotifications';
import { getApiErrorMessage, isApiError } from 'api/errors';

import Dropdown from '../Dropdown';
import ImportLocales from '../ImportLocales';
import ImportComponents from '../ImportComponents';
import ExportProject from '../ExportProject/ExportProject';

import './Header.css';

export enum EHeaderModes {
  DEFAULT = 'Default',
  EDITOR = 'Editor',
}

interface IProps {
  mode?: EHeaderModes,
  project?: IProject | null
}

export default function Header(props: IProps) {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { mode = EHeaderModes.DEFAULT, project } = props;

  const { email } = useSelector((state: IRootState) => state.user);

  const { projectId = '' } = project || {};

  const [userMenuVisible, setUserMenuVisible] = useState<boolean>(false);

  const toggleUserMenu = () => {
    setUserMenuVisible(!userMenuVisible);
  };

  const [isImportLocalesModalVisible, setImportLocalesModalVisible] = useState<boolean>(false);
  const [isImportComponentsModalVisible, setImportComponentsModalVisible] = useState<boolean>(false);
  const [isExportProjectModalVisible, setIsExportProjectModalVisible] = useState<boolean>(false);

  const handleImportLocalesClick = () => {
    setImportLocalesModalVisible(true);
  };

  const handleImportComponentsClick = () => {
    setImportComponentsModalVisible(true);
  };

  const handleExportClick = async () => {
    setIsExportProjectModalVisible(true);
  };

  const handleLogoutClick = async () => {
    const result = await logout();

    if (isApiError(result)) {
      dispatch(createSystemNotification({
        content: getApiErrorMessage(result, 'Error Logging Out'),
        type: EMessageType.Error,
      }));

      return;
    }

    dispatch(clearSession());
    navigate('/auth');
  };

  return (
    <>
      {isImportLocalesModalVisible && (
        <ImportLocales
          projectId={projectId}
          onClose={() => setImportLocalesModalVisible(false)}
          onCancel={() => setImportLocalesModalVisible(false)}
          onConfirm={() => setImportLocalesModalVisible(false)}
        />
      )}

      {isImportComponentsModalVisible && (
        <ImportComponents
          onClose={() => setImportComponentsModalVisible(false)}
          onCancel={() => setImportComponentsModalVisible(false)}
          onConfirm={() => setImportComponentsModalVisible(false)}
          project={project as IProject}
        />
      )}

      {isExportProjectModalVisible && (
        <ExportProject
          onClose={() => setIsExportProjectModalVisible(false)}
          onCancel={() => setIsExportProjectModalVisible(false)}
          onConfirm={() => setIsExportProjectModalVisible(false)}
          project={project as IProject}
        />
      )}

      <header className="header">
        <a href="/" className="logo" aria-label="logo" />
        <ul className="headerMenu headerMenu_start">
          <li className="headerMenuItem">
            <Link to="/projects" className="button ghost headerMenu-link">Projects</Link>
          </li>
          <li className="headerMenuItem">
            <Link to="/projects" className="button ghost headerMenu-link">Master of Keys</Link>
          </li>
          <li className="headerMenuItem">
            <Link to="/projects" className="button ghost headerMenu-link">Releases</Link>
          </li>
        </ul>

        {(mode === EHeaderModes.EDITOR && project) && (
          <ul className="headerMenu headerMenu_editorMenu">
            <li className="headerMenuItem">
              <button
                type="button"
                className="button ghost headerMenu-link"
                onClick={handleImportLocalesClick}
              >
                Import Locales
              </button>
            </li>
            <li className="headerMenuItem">
              <button
                type="button"
                className="button ghost headerMenu-link"
                onClick={handleImportComponentsClick}
              >
                Import Components
              </button>
            </li>
            <li className="headerMenu-item">
              <button
                type="button"
                className="button ghost headerMenu-link"
                onClick={handleExportClick}
              >
                Export
              </button>
            </li>
          </ul>
        )}

        <ul className="headerMenu headerMenu_end">
          <li className="headerMenuItem">
            <button type="button" className="userMenuButton _button-user-menu" onClick={toggleUserMenu}>User Menu
            </button>

            {userMenuVisible && (
              <Dropdown
                anchor="._button-user-menu"
                onOutsideClick={() => setUserMenuVisible(false)}
                classNames="userMenuDropdown"
                orientation="tr-br"
              >
                <div className="userMenu">
                  <h3 className="userMenu-title">{email}</h3>
                  <ul className="userMenuList">
                    <li className="userMenuList-item">
                      <Link className="button ghost userMenuList-link" to="/settings">Settings</Link>
                    </li>
                    <li className="userMenuList-item">
                      <Link className="button ghost userMenuList-link" to="/profile">Profile</Link>
                    </li>
                    <li className="userMenuList-item">
                      <hr className="userMenuList-separator" />
                    </li>
                    <li className="userMenuList-item">
                      <button type="button" className="button ghost link userMenuList-link" onClick={handleLogoutClick}>Logout</button>
                    </li>
                  </ul>
                </div>
              </Dropdown>
            )}
          </li>
        </ul>
      </header>
    </>
  );
}
