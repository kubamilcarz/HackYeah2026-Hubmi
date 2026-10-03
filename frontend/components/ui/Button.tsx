import Link from "next/link";
import type { ComponentProps, ButtonHTMLAttributes, ReactNode } from "react";
import type { Icon } from "@phosphor-icons/react/lib";

export type ButtonVariant = "primary" | "secondary" | "tertiary" | "destructive";
export type ButtonSize = "sm" | "md" | "lg";

type SharedButtonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
};

type ButtonContentProps = {
  children: ReactNode;
  leadingIcon?: Icon;
  trailingIcon?: Icon;
};

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & SharedButtonProps & ButtonContentProps;

export type ButtonLinkProps = Omit<ComponentProps<typeof Link>, "children" | "className"> & SharedButtonProps & ButtonContentProps;

function buttonClassName(variant: ButtonVariant, size: ButtonSize, className?: string) {
  return `button button--${variant} button--size-${size}${className ? ` ${className}` : ""}`;
}

function buttonIconSize(size: ButtonSize) {
  return size === "sm" ? 18 : size === "lg" ? 22 : 20;
}

export function Button({
  children,
  className,
  leadingIcon: LeadingIcon,
  trailingIcon: TrailingIcon,
  size = "md",
  type = "button",
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button className={buttonClassName(variant, size, className)} type={type} {...props}>
      {LeadingIcon && <LeadingIcon aria-hidden="true" className="button__icon" size={buttonIconSize(size)} weight="bold" />}
      <span>{children}</span>
      {TrailingIcon && <TrailingIcon aria-hidden="true" className="button__icon" size={buttonIconSize(size)} weight="bold" />}
    </button>
  );
}

export function ButtonLink({
  children,
  className,
  leadingIcon: LeadingIcon,
  trailingIcon: TrailingIcon,
  size = "md",
  variant = "primary",
  ...props
}: ButtonLinkProps) {
  return (
    <Link className={buttonClassName(variant, size, className)} {...props}>
      {LeadingIcon && <LeadingIcon aria-hidden="true" className="button__icon" size={buttonIconSize(size)} weight="bold" />}
      <span>{children}</span>
      {TrailingIcon && <TrailingIcon aria-hidden="true" className="button__icon" size={buttonIconSize(size)} weight="bold" />}
    </Link>
  );
}

export type IconButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "aria-label" | "children"> & SharedButtonProps & {
  icon: Icon;
  label: string;
};

export function IconButton({
  className,
  icon: Icon,
  label,
  size = "md",
  type = "button",
  variant = "secondary",
  ...props
}: IconButtonProps) {
  return (
    <button
      aria-label={label}
      className={`icon-button icon-button--${variant} icon-button--size-${size}${className ? ` ${className}` : ""}`}
      type={type}
      {...props}
    >
      <Icon aria-hidden="true" size={buttonIconSize(size)} weight="bold" />
    </button>
  );
}
