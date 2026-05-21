import React, { Fragment } from 'react';
import { Link } from 'react-router-dom';
import './Breadcrumbs.scss';
import { IKey, IProject } from '../../interfaces';

interface IProps {
  project: IProject | null
}

export default function Breadcrumbs(props: IProps) {
  const { project } = props;

  const { upstreamParents } = project || {};

  if (!upstreamParents || !project) {
    return null;
  }

  const upstreamParentsMap = new Map<string, IKey>(upstreamParents.map((entity) => [entity.id, entity]));

  const { subfolder } = project;

  if (!subfolder) {
    return null;
  }

  const { pathCache } = subfolder;

  const pathWay: IKey[] = [];

  pathCache.split('/').forEach((entityId: string) => {
    if (upstreamParentsMap.has(entityId)) {
      pathWay.push(upstreamParentsMap.get(entityId) as IKey);
    }
  });

  return (
    <div className="breadcrumbs">
      <Link className="breadcrumbs-link breadcrumbs-link_home" to={`/project/${project.projectId}`}>Home</Link>
      {pathWay.map((entity: IKey) => (
        <Fragment key={entity.id}>
          <span className="breadcrumbs-separator" />
          <Link className="breadcrumbs-link" to={`/project/${project.projectId}/${entity.id}`}>{entity.label}</Link>
        </Fragment>
      ))}
      <span className="breadcrumbs-separator" />
      <span>{subfolder.label}</span>
    </div>
  );
}
