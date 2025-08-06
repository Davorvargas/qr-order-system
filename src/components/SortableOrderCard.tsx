"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ReactNode } from "react";

interface SortableOrderCardProps {
  id: string | number;
  children: ReactNode;
  disabled?: boolean;
}

export default function SortableOrderCard({
  id,
  children,
  disabled = false,
}: SortableOrderCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: id.toString(),
    disabled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`${isDragging ? "z-50" : ""} ${
        disabled ? "cursor-not-allowed" : "cursor-grab active:cursor-grabbing"
      }`}
    >
      {children}
    </div>
  );
}
