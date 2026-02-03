import React, { Fragment } from 'react';
import { DEFAULT_ITEMS_PER_PAGE, PROJECT_ITEMS_MAX_DEPTH } from 'constants/app';
import {
  IKey,
  IKeyValue,
  IProjectLanguage,
  INavigationData,
  ITag,
} from 'interfaces';
import clsx from 'clsx';

import Key from './Entity/Key';
// eslint-disable-next-line import/no-cycle
import FolderComponent from './Entity/Folder';

interface IProps {
  keys: IKey[],
  values?: {
    [ keyId: string ]: {
      [languageId: string]: IKeyValue;
    }
  },
  parentId: string,
  projectId: string,
  languages: IProjectLanguage[];
  path: string;
  pathCache: string;
  iteration?: number;
  page?: number;
  totalCount?: number;
  itemsPerPage?: number;
  navigationData?: INavigationData | {};
  projectTags: ITag[]
}

const TOTAL_PAGES = 10;

export default function ItemsList({
  keys = [],
  values = {},
  parentId,
  projectId,
  languages,
  path,
  pathCache,
  iteration = 0,
  page = 0,
  totalCount = 0,
  itemsPerPage = DEFAULT_ITEMS_PER_PAGE,
  navigationData = {},
  projectTags = [],
}: IProps) {
  if (iteration > PROJECT_ITEMS_MAX_DEPTH) {
    return null;
  }

  const pagesCount = Math.ceil(totalCount / itemsPerPage);

  let pagesArray = new Array(pagesCount).fill('').map((item, idx) => ({
    idx,
    page: 1 + idx,
  }));

  const pagesFrom = Math.floor(page / TOTAL_PAGES) * TOTAL_PAGES;
  const pagesTo = pagesFrom + TOTAL_PAGES;

  pagesArray = pagesArray.slice(pagesFrom, pagesTo);

  return (
    <section className="itemsList">
      {keys.map((key: IKey) => {
        if (key.type === 'string') {
          return (
            <Fragment key={key.id}>
              <Key
                id={key.id}
                label={key.label}
                projectId={projectId}
                parentId={parentId}
                values={values ? values[key.id] : {}}
                languages={languages}
                description={key.description}
                path={path}
                pathCache={pathCache}
                tags={key.tags}
                projectTags={projectTags}
              />
            </Fragment>
          );
        }

        if (key.type === 'component') {
          return (
            <Fragment key={key.id}>
              <FolderComponent
                id={key.id}
                label={key.label}
                type={key.type}
                keys={key.children || []}
                projectId={projectId}
                languages={languages}
                description={key.description}
                iteration={iteration}
                path={path}
                pathCache={pathCache}
                navigationData={navigationData}
                tags={key.tags}
                projectTags={projectTags}
              />
            </Fragment>
          );
        }

        if (key.type === 'folder') {
          return (
            <Fragment key={key.id}>
              <FolderComponent
                id={key.id}
                label={key.label}
                type={key.type}
                keys={key.children || []}
                projectId={projectId}
                languages={languages}
                description={key.description}
                iteration={iteration}
                path={path}
                pathCache={pathCache}
                navigationData={navigationData}
                tags={key.tags}
                projectTags={projectTags}
              />
            </Fragment>
          );
        }

        return null;
      })}

      {pagesArray.length > 1 && (
        <div className="keyFooter">
          <div className="pagination">
            <button
              type="button"
              className={clsx({ 'pagination-rew': true, disabled: page === 0 })}
              aria-label="Rewind"
              data-click-target="pageRew"
            />

            <button
              type="button"
              className={clsx({'pagination-left': true, disabled: page === 0})}
              aria-label="Previous"
              data-click-target="pagePrev"
            />

            {pagesArray.map((item) => (
              <button
                type="button"
                key={item.idx}
                className={clsx({ 'pagination-item': true, isActive: page === item.idx })}
                data-click-target="pageN"
                data-page-index={item.idx}
              >
                {item.page}
              </button>
            ))}

            <button
              type="button"
              className={clsx({ 'pagination-right': true, disabled: page === (pagesCount - 1) })}
              aria-label="Next"
              data-click-target="pageNext"
            />

            <button
              type="button"
              className={clsx({ 'pagination-ffwd': true, disabled: page === (pagesCount - 1) })}
              aria-label="Fast Forward"
              data-click-target="pageFFwd"
            />
          </div>
        </div>
      )}
    </section>
  );
}
