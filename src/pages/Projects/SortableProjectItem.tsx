import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
// eslint-disable-next-line import/no-extraneous-dependencies
import { CSS } from '@dnd-kit/utilities';

export default function SortableProjectItem(props: any) {
  const { children, id } = props;

  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <div ref={setNodeRef} style={{ position: 'relative', zIndex: isDragging ? 10 : 1, ...style }}>
      {children({
        attributes,
        listeners,
        setActivatorNodeRef,
        isDragging,
      })}
    </div>
  );
}
