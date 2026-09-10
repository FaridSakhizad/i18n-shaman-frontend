import React from 'react';
import { useDispatch } from 'react-redux';

import { AppDispatch } from 'store';
import { removeGlobalMessage } from 'store/globalMessages';

import './CookieMessage.css';

interface IProps {
  messageId: string;
}

export default function CookieMessage({ messageId }: IProps) {
  const dispatch = useDispatch<AppDispatch>();

  const handleAgreeButtonClick = () => {
    document.cookie = 'userAgreedToCookie=true';

    dispatch(removeGlobalMessage(messageId));
  };

  return (
    <div className="cookieMessageWrapper">
      <div className="cookieMessage">
        <div className="cookieMessage-content">
          <p className="cookieMessage-para">This website uses cookies that are required for user authentication and session management. Without cookies, signing in and staying logged in is not possible. By continuing to use the site, you agree to the use of these cookies.</p>

          <button type="button" className="button primary cookieMessage-button" onClick={handleAgreeButtonClick}>OK</button>
        </div>
      </div>
    </div>
  );
}
