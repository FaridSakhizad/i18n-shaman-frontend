import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import './Dropdown.scss';

interface IProps {
  open?: boolean;
  anchor: string;
  orientation?: string;
  classNames?: string;
  onOutsideClick?: (e: any) => void | any
  children: React.ReactNode;
}

interface IPosition {
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
}

export default function Dropdown(props: IProps) {
  const {
    open = true,
    anchor,
    orientation = 'tl-bl',
    onOutsideClick = () => {},
    children = null,
    classNames = '',
  } = props;

  const dropdownRef = useRef(null);

  const [position, setPosition] = useState<IPosition>({});

  const calculatePosition = useCallback(() => {
    const $target = document.querySelector(anchor);

    if (!$target) {
      return;
    }

    if (!dropdownRef.current) {
      return;
    }

    const targetData = $target.getBoundingClientRect();

    const $dropdown = dropdownRef.current as HTMLElement;

    if (!targetData || !$dropdown) {
      return;
    }

    const {
      width: anchorWidth,
      left: anchorLeft,
      top: anchorTop,
      bottom: anchorBottom,
    } = targetData;

    const {
      width: dropDownWidth,
      height: dropDownHeight,
    } = $dropdown.getBoundingClientRect();

    if (orientation === 'tl-bl') {
      setPosition({
        top: anchorBottom,
        left: anchorLeft,
      });
    }

    if (orientation === 'tl-br') {
      setPosition({
        top: anchorBottom,
        left: anchorLeft + anchorWidth,
      });
    }

    if (orientation === 'tl-tr') {
      setPosition({
        top: anchorTop,
        left: anchorLeft + anchorWidth,
      });
    }

    if (orientation === 'tr-br') {
      setPosition({
        top: anchorBottom,
        left: anchorLeft - dropDownWidth + anchorWidth,
      });
    }

    if (orientation === 'bl-tl') {
      setPosition({
        top: anchorTop - dropDownHeight,
        left: anchorLeft,
      });
    }

    if (orientation === 'br-tr') {
      setPosition({
        top: anchorTop - dropDownHeight,
        left: anchorLeft - dropDownWidth + anchorWidth,
      });
    }
  }, [anchor, orientation]);

  const getPositionStyleObject = () => {
    const result: {
      top?: string;
      left?: string;
      right?: string;
      bottom?: string;
    } = {
      top: '-9999px',
      left: '-9999px',
    };

    if (position.left) {
      result.left = `${position.left}px`;
    }

    if (position.top) {
      result.top = `${position.top}px`;
    }

    if (position.right) {
      result.right = `${position.right}px`;
    }

    if (position.bottom) {
      result.bottom = `${position.bottom}px`;
    }

    return result;
  };

  const positionStyle = getPositionStyleObject();

  const handleOutsideClick = useCallback((e: MouseEvent) => {
    if (!dropdownRef.current) {
      return;
    }

    const $target = document.querySelector(anchor);

    if (e.target === $target) {
      return;
    }

    const $dropdown: HTMLElement = dropdownRef.current;

    if (!$dropdown.contains(e.target as Node)) {
      onOutsideClick(e);
    }
  }, [anchor, onOutsideClick]);

  const attachOutsideClickListeners = useCallback(() => {
    document.addEventListener('mousedown', handleOutsideClick);
  }, [handleOutsideClick]);

  const detachOutsideClickListeners = useCallback(() => {
    document.removeEventListener('mousedown', handleOutsideClick);
  }, [handleOutsideClick]);

  useEffect(() => {
    calculatePosition();
    attachOutsideClickListeners();

    return () => {
      detachOutsideClickListeners();
    };
  }, [attachOutsideClickListeners, calculatePosition, detachOutsideClickListeners]);

  const attachWindowMutateListeners = useCallback(() => {
    window.addEventListener('resize', calculatePosition);
  }, [calculatePosition]);

  const detachWindowMutateListeners = useCallback(() => {
    window.removeEventListener('resize', calculatePosition);
  }, [calculatePosition]);

  useEffect(() => {
    attachWindowMutateListeners();

    return () => {
      detachWindowMutateListeners();
    };
  }, [attachWindowMutateListeners, detachWindowMutateListeners]);

  if (!open) {
    return null;
  }

  return (
    <div
      ref={dropdownRef}
      className={`dropdown ${classNames}`}
      style={positionStyle}
    >
      {children}
    </div>
  );
}
