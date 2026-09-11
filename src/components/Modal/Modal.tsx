import React, { useCallback, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

import './Modal.scss';

interface IProps {
  children: React.ReactNode;
  customClassNames?: string;
  onEscapeKeyPress?: (e: KeyboardEvent) => void;
}

export default function Modal({ children, customClassNames, onEscapeKeyPress = () => {} }: IProps) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const [domReady, setDomReady] = useState(false);

  useEffect(() => {
    setDomReady(true);
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.code === 'Escape') {
      onEscapeKeyPress(e);
    }
  }, [onEscapeKeyPress]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  const $portalEl = document.getElementById('modal-portal') as Element;

  return domReady ? (
    createPortal(
      <div className="modal">
        <div className="modal-backdrop">
          <div className={`modal-window ${customClassNames || ''}`}>
            {children}
          </div>
        </div>
      </div>,
      $portalEl,
    )
  ) : null;
}
