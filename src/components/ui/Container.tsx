import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "header" | "footer" | "main";
};

export function Container({ children, className = "", as: Tag = "div" }: Props) {
  return (
    <Tag
      className={`mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-12 ${className}`}
    >
      {children}
    </Tag>
  );
}
