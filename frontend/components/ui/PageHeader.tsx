import type { HTMLAttributes } from "react";

export type PageHeaderProps = HTMLAttributes<HTMLElement> & {
  description?: string;
  headingLevel?: "h1" | "h2" | "h3";
  title: string;
};

/** A route or section heading with a short, plain-language introduction. */
export function PageHeader({
  className,
  description,
  headingLevel = "h1",
  title,
  ...props
}: PageHeaderProps) {
  const Heading = headingLevel;

  return (
    <header className={`page-header${className ? ` ${className}` : ""}`} {...props}>
      <Heading className="type-h1 page-header__title">{title}</Heading>
      {description && <p className="type-body page-header__description">{description}</p>}
    </header>
  );
}
