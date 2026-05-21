import React from 'react';
import { AppDispatch } from 'store';
import { useDispatch } from 'react-redux';

import {
  EContentType,
  IMessage,
  removeGlobalMessage,
} from 'store/globalMessages';

import { getSystemMessageComponent } from './SystemMessageRegistry';

export default function SystemMessageRenderer(props: IMessage) {
  const {
    id,
    type,
    contentType,
    component,
    content,
    componentProps,
    closeButton = true,
  } = props;

  const dispatch = useDispatch<AppDispatch>();

  const handleCloseClick = (notificationId: string) => {
    dispatch(removeGlobalMessage(notificationId));
  };

  if (contentType === EContentType.Component && component) {
    const Component = getSystemMessageComponent(component);

    if (!Component) {
      return null;
    }

    return (
      <Component {...componentProps} /> // eslint-disable-line react/jsx-props-no-spreading
    );
  }

  return (
    <div
      key={id}
      className={`systemMessage ${type}`}
    >
      {closeButton && (
        <button
          className="systemMessage-close"
          type="button"
          aria-label="Close"
          onClick={() => handleCloseClick(id)}
        />
      )}

      <div className="systemMessage-content">
        {(contentType === EContentType.Html) ? (
          <div dangerouslySetInnerHTML={{ __html: content as string }} />
        ) : (
          <>{content}</> // eslint-disable-line react/jsx-no-useless-fragment
        )}
      </div>
    </div>
  );
}
