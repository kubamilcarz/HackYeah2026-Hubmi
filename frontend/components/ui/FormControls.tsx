"use client";

import { useId, useRef, useState } from "react";
import type {
  ChangeEvent,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { CaretDown, MagnifyingGlass, Minus, Plus, WarningCircle } from "@phosphor-icons/react";
import type { Icon } from "@phosphor-icons/react/lib";

type FieldProps = {
  className?: string;
  error?: string;
  helperText?: string;
  hideLabel?: boolean;
  label: string;
  optional?: boolean;
};

type FieldIds = {
  describedBy?: string;
  errorId: string;
  helperId: string;
  inputId: string;
};

function useFieldIds(id?: string): FieldIds {
  const generatedId = useId();
  const inputId = id ?? `field-${generatedId}`;

  return {
    inputId,
    helperId: `${inputId}-helper`,
    errorId: `${inputId}-error`,
  };
}

function describedBy(ids: FieldIds, helperText?: string, error?: string) {
  return [helperText ? ids.helperId : undefined, error ? ids.errorId : undefined].filter(Boolean).join(" ") || undefined;
}

function Field({
  children,
  className,
  error,
  helperText,
  hideLabel,
  ids,
  label,
  optional,
  required,
}: FieldProps & { children: ReactNode; ids: FieldIds; required?: boolean }) {
  return (
    <div className={`field${error ? " field--error" : ""}${className ? ` ${className}` : ""}`}>
      <label className={hideLabel ? "sr-only" : "field__label"} htmlFor={ids.inputId}>
        {label}{required ? " (wymagane)" : optional ? " (opcjonalne)" : ""}
      </label>
      {children}
      {helperText && <p className="field__helper" id={ids.helperId}>{helperText}</p>}
      {error && <p className="field__error" id={ids.errorId}>{error}</p>}
    </div>
  );
}

export type TextFieldProps = FieldProps & Omit<InputHTMLAttributes<HTMLInputElement>, "className">;

export function TextField({
  className,
  error,
  helperText,
  hideLabel,
  id,
  label,
  optional,
  required,
  type = "text",
  ...props
}: TextFieldProps) {
  const ids = useFieldIds(id);

  return (
    <Field className={className} error={error} helperText={helperText} hideLabel={hideLabel} ids={ids} label={label} optional={optional} required={required}>
      <div className="control-input-wrap">
        <input
          aria-describedby={describedBy(ids, helperText, error)}
          aria-invalid={error ? true : undefined}
          className={`control-input${error ? " control-input--with-trailing-icon" : ""}`}
          id={ids.inputId}
          required={required}
          type={type}
          {...props}
        />
        {error && <WarningCircle aria-hidden="true" className="control-input__error-icon" size={24} weight="fill" />}
      </div>
    </Field>
  );
}

export type TextAreaFieldProps = FieldProps & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "className"> & {
  showCharacterCount?: boolean;
};

export function TextAreaField({
  className,
  defaultValue,
  error,
  helperText,
  hideLabel,
  id,
  label,
  maxLength,
  onChange,
  optional,
  required,
  showCharacterCount = false,
  value,
  ...props
}: TextAreaFieldProps) {
  const ids = useFieldIds(id);
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState(String(defaultValue ?? ""));
  const currentValue = isControlled ? String(value ?? "") : internalValue;
  const counterId = `${ids.inputId}-count`;
  const description = [describedBy(ids, helperText, error), showCharacterCount && maxLength !== undefined ? counterId : undefined].filter(Boolean).join(" ") || undefined;

  function handleChange(event: ChangeEvent<HTMLTextAreaElement>) {
    if (!isControlled) setInternalValue(event.target.value);
    onChange?.(event);
  }

  return (
    <Field className={className} error={error} helperText={helperText} hideLabel={hideLabel} ids={ids} label={label} optional={optional} required={required}>
      <textarea
        aria-describedby={description}
        aria-invalid={error ? true : undefined}
        className="control-input control-textarea"
        defaultValue={isControlled ? undefined : defaultValue}
        id={ids.inputId}
        maxLength={maxLength}
        onChange={handleChange}
        required={required}
        value={isControlled ? value : undefined}
        {...props}
      />
      {showCharacterCount && maxLength !== undefined && <p className="field__character-count" id={counterId}>{currentValue.length}/{maxLength}</p>}
    </Field>
  );
}

export type SearchFieldProps = FieldProps & Omit<InputHTMLAttributes<HTMLInputElement>, "className" | "type">;

export function SearchField({
  className,
  defaultValue,
  error,
  helperText,
  hideLabel,
  id,
  label,
  onChange,
  optional,
  required,
  value,
  ...props
}: SearchFieldProps) {
  const ids = useFieldIds(id);
  const inputRef = useRef<HTMLInputElement>(null);
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState(String(defaultValue ?? ""));
  const currentValue = isControlled ? String(value ?? "") : internalValue;

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    if (!isControlled) setInternalValue(event.target.value);
    onChange?.(event);
  }

  function clear() {
    const input = inputRef.current;
    if (!input) return;

    const valueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
    valueSetter?.call(input, "");
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.focus();
  }

  return (
    <Field className={className} error={error} helperText={helperText} hideLabel={hideLabel} ids={ids} label={label} optional={optional} required={required}>
      <div className="control-input-wrap">
        <MagnifyingGlass aria-hidden="true" className="control-input__leading-icon" size={20} weight="bold" />
        <input
          aria-describedby={describedBy(ids, helperText, error)}
          aria-invalid={error ? true : undefined}
          className="control-input control-input--with-leading-icon"
          defaultValue={isControlled ? undefined : defaultValue}
          id={ids.inputId}
          onChange={handleChange}
          ref={inputRef}
          required={required}
          type="search"
          value={isControlled ? value : undefined}
          {...props}
        />
        {currentValue && (
          <button aria-label={`Wyczyść pole: ${label}`} className="control-input__clear" onClick={clear} type="button">
            <span aria-hidden="true">×</span>
          </button>
        )}
      </div>
    </Field>
  );
}

export type SelectOption = { disabled?: boolean; label: string; value: string };
export type SelectFieldProps = FieldProps & Omit<SelectHTMLAttributes<HTMLSelectElement>, "children" | "className"> & {
  options: SelectOption[];
  placeholder?: string;
};

export function SelectField({
  className,
  error,
  helperText,
  hideLabel,
  id,
  label,
  optional,
  options,
  placeholder,
  required,
  ...props
}: SelectFieldProps) {
  const ids = useFieldIds(id);

  return (
    <Field className={className} error={error} helperText={helperText} hideLabel={hideLabel} ids={ids} label={label} optional={optional} required={required}>
      <div className="control-input-wrap">
        <select aria-describedby={describedBy(ids, helperText, error)} aria-invalid={error ? true : undefined} className="control-input control-select" id={ids.inputId} required={required} {...props}>
          {placeholder && <option disabled value="">{placeholder}</option>}
          {options.map((option) => <option disabled={option.disabled} key={option.value} value={option.value}>{option.label}</option>)}
        </select>
        <CaretDown aria-hidden="true" className="control-select__icon" size={20} weight="bold" />
      </div>
    </Field>
  );
}

export type DateFieldProps = FieldProps & Omit<InputHTMLAttributes<HTMLInputElement>, "className" | "type">;

export function DateField({ className, error, helperText, hideLabel, id, label, optional, required, ...props }: DateFieldProps) {
  const ids = useFieldIds(id);

  return (
    <Field className={className} error={error} helperText={helperText} hideLabel={hideLabel} ids={ids} label={label} optional={optional} required={required}>
      <input aria-describedby={describedBy(ids, helperText, error)} aria-invalid={error ? true : undefined} className="control-input" id={ids.inputId} required={required} type="date" {...props} />
    </Field>
  );
}

export type ChoiceOption = { description?: string; disabled?: boolean; label: string; value: string };
type ChoiceGroupProps = FieldProps & { name: string; options: ChoiceOption[]; required?: boolean };

function ChoiceMessages({ error, helperText, ids }: Pick<FieldProps, "error" | "helperText"> & { ids: FieldIds }) {
  return <>{helperText && <p className="field__helper" id={ids.helperId}>{helperText}</p>}{error && <p className="field__error" id={ids.errorId}>{error}</p>}</>;
}

export type RadioGroupProps = ChoiceGroupProps & { defaultValue?: string; onValueChange?: (value: string) => void; value?: string };

export function RadioGroup({ className, defaultValue, error, helperText, label, name, onValueChange, options, required, value }: RadioGroupProps) {
  const ids = useFieldIds();
  const isControlled = value !== undefined;

  return (
    <fieldset aria-describedby={describedBy(ids, helperText, error)} aria-invalid={error ? true : undefined} className={`field choice-group${error ? " field--error" : ""}${className ? ` ${className}` : ""}`}>
      <legend className="field__label">{label}{required ? " (wymagane)" : ""}</legend>
      <div className="choice-group__options">
        {options.map((option) => (
          <label className="choice-option" key={option.value}>
            <input
              {...(isControlled ? { checked: value === option.value } : { defaultChecked: defaultValue === option.value })}
              disabled={option.disabled}
              name={name}
              onChange={() => onValueChange?.(option.value)}
              required={required}
              type="radio"
              value={option.value}
            />
            <span><strong>{option.label}</strong>{option.description && <small>{option.description}</small>}</span>
          </label>
        ))}
      </div>
      <ChoiceMessages error={error} helperText={helperText} ids={ids} />
    </fieldset>
  );
}

export type CheckboxGroupProps = ChoiceGroupProps & { defaultValue?: string[]; onValueChange?: (value: string[]) => void; value?: string[] };

export function CheckboxGroup({ className, defaultValue = [], error, helperText, label, name, onValueChange, options, required, value }: CheckboxGroupProps) {
  const ids = useFieldIds();
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue);
  const selectedValues = isControlled ? value : internalValue;

  function toggle(optionValue: string, checked: boolean) {
    const next = checked ? [...selectedValues, optionValue] : selectedValues.filter((item) => item !== optionValue);
    if (!isControlled) setInternalValue(next);
    onValueChange?.(next);
  }

  return (
    <fieldset aria-describedby={describedBy(ids, helperText, error)} aria-invalid={error ? true : undefined} className={`field choice-group${error ? " field--error" : ""}${className ? ` ${className}` : ""}`}>
      <legend className="field__label">{label}{required ? " (wymagane)" : ""}</legend>
      <div className="choice-group__options">
        {options.map((option) => (
          <label className="choice-option" key={option.value}>
            <input checked={selectedValues.includes(option.value)} disabled={option.disabled} name={name} onChange={(event) => toggle(option.value, event.target.checked)} required={required} type="checkbox" value={option.value} />
            <span><strong>{option.label}</strong>{option.description && <small>{option.description}</small>}</span>
          </label>
        ))}
      </div>
      <ChoiceMessages error={error} helperText={helperText} ids={ids} />
    </fieldset>
  );
}

export type ChipOption = {
  disabled?: boolean;
  icon?: Icon;
  label: string;
  value: string;
};

export type CheckboxChipGroupProps = FieldProps & {
  defaultValue?: string[];
  name: string;
  onValueChange?: (value: string[]) => void;
  options: ChipOption[];
  required?: boolean;
  value?: string[];
};

export function CheckboxChipGroup({ className, defaultValue = [], error, helperText, label, name, onValueChange, options, required, value }: CheckboxChipGroupProps) {
  const ids = useFieldIds();
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue);
  const selectedValues = isControlled ? value : internalValue;

  function toggle(optionValue: string, checked: boolean) {
    const next = checked ? [...selectedValues, optionValue] : selectedValues.filter((item) => item !== optionValue);
    if (!isControlled) setInternalValue(next);
    onValueChange?.(next);
  }

  return (
    <fieldset aria-describedby={describedBy(ids, helperText, error)} aria-invalid={error ? true : undefined} className={`field chip-group${error ? " field--error" : ""}${className ? ` ${className}` : ""}`}>
      <legend className="field__label">{label}{required ? " (wymagane)" : ""}</legend>
      <div className="chip-group__options">
        {options.map((option, index) => {
          const Icon = option.icon;
          const selected = selectedValues.includes(option.value);

          return (
            <label className="chip-group__option" key={option.value}>
              <input
                checked={selected}
                className="chip-group__input"
                disabled={option.disabled}
                name={name}
                onChange={(event) => toggle(option.value, event.target.checked)}
                required={required && index === 0}
                type="checkbox"
                value={option.value}
              />
              {Icon && <Icon aria-hidden="true" className="chip-group__icon" size={20} weight="fill" />}
              {selected && <span aria-hidden="true" className="chip-group__check">✓</span>}
              <span>{option.label}</span>
            </label>
          );
        })}
      </div>
      <ChoiceMessages error={error} helperText={helperText} ids={ids} />
    </fieldset>
  );
}

export type StepProgressStep = { label: string };

export type StepProgressProps = {
  className?: string;
  currentStep: number;
  label: string;
  steps: StepProgressStep[];
};

export function StepProgress({ className, currentStep, label, steps }: StepProgressProps) {
  const safeCurrentStep = Math.min(Math.max(Math.round(currentStep), 1), Math.max(steps.length, 1));

  return (
    <ol aria-label={label} className={`step-progress${className ? ` ${className}` : ""}`}>
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const status = stepNumber < safeCurrentStep ? "ukończony" : stepNumber === safeCurrentStep ? "bieżący" : "kolejny";

        return (
          <li aria-current={stepNumber === safeCurrentStep ? "step" : undefined} className={`step-progress__step step-progress__step--${status}`} key={step.label}>
            <span aria-hidden="true" className="step-progress__number">{stepNumber}</span>
            <span className="step-progress__label">{step.label}</span>
            <span className="step-progress__status">{status === "ukończony" ? "Ukończony" : status === "bieżący" ? "Bieżący krok" : "Kolejny krok"}</span>
          </li>
        );
      })}
    </ol>
  );
}

export type SegmentedControlProps = ChoiceGroupProps & { defaultValue?: string; onValueChange?: (value: string) => void; value?: string };

export function SegmentedControl({ className, defaultValue, error, helperText, label, name, onValueChange, options, required, value }: SegmentedControlProps) {
  const ids = useFieldIds();
  const isControlled = value !== undefined;

  return (
    <fieldset aria-describedby={describedBy(ids, helperText, error)} aria-invalid={error ? true : undefined} className={`field segmented-control${error ? " field--error" : ""}${className ? ` ${className}` : ""}`}>
      <legend className="field__label">{label}{required ? " (wymagane)" : ""}</legend>
      <div className="segmented-control__options">
        {options.map((option) => (
          <label className="segmented-control__option" key={option.value}>
            <input
              {...(isControlled ? { checked: value === option.value } : { defaultChecked: defaultValue === option.value })}
              disabled={option.disabled}
              name={name}
              onChange={() => onValueChange?.(option.value)}
              required={required}
              type="radio"
              value={option.value}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
      <ChoiceMessages error={error} helperText={helperText} ids={ids} />
    </fieldset>
  );
}

export type SliderProps = FieldProps & Omit<InputHTMLAttributes<HTMLInputElement>, "className" | "defaultValue" | "onChange" | "type" | "value"> & {
  defaultValue?: number;
  formatValue?: (value: number) => string;
  onValueChange?: (value: number) => void;
  value?: number;
};

export function Slider({ className, defaultValue = 0, error, formatValue = String, helperText, id, label, onValueChange, value, ...props }: SliderProps) {
  const ids = useFieldIds(id);
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue);
  const currentValue = isControlled ? value : internalValue;

  return (
    <Field className={className} error={error} helperText={helperText} ids={ids} label={label}>
      <div className="slider">
        <input
          aria-describedby={describedBy(ids, helperText, error)}
          aria-invalid={error ? true : undefined}
          aria-valuetext={formatValue(currentValue)}
          id={ids.inputId}
          onChange={(event) => {
            const next = Number(event.target.value);
            if (!isControlled) setInternalValue(next);
            onValueChange?.(next);
          }}
          type="range"
          value={currentValue}
          {...props}
        />
        <output aria-live="off">{formatValue(currentValue)}</output>
      </div>
    </Field>
  );
}

export type StepperProps = FieldProps & Omit<InputHTMLAttributes<HTMLInputElement>, "className" | "defaultValue" | "onChange" | "type" | "value"> & {
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  value?: number;
};

function decimalPlaces(value: number) {
  return value.toString().split(".")[1]?.length ?? 0;
}

export function Stepper({ className, defaultValue = 0, disabled, error, helperText, id, label, max, min = 0, onValueChange, readOnly, required, step = 1, value, ...props }: StepperProps) {
  const ids = useFieldIds(id);
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : defaultValue;
  const [internalValue, setInternalValue] = useState(currentValue);
  const [textState, setTextState] = useState({ forValue: currentValue, text: String(currentValue) });
  const displayedValue = isControlled ? value : internalValue;
  const textValue = textState.forValue === displayedValue ? textState.text : String(displayedValue);
  const increment = Number(step);
  const minimum = Number(min);
  const maximum = max === undefined ? Number.POSITIVE_INFINITY : Number(max);

  function normalize(next: number) {
    const clamped = Math.min(Math.max(next, minimum), maximum);
    const snapped = minimum + Math.round((clamped - minimum) / increment) * increment;
    return Number(Math.min(Math.max(snapped, minimum), maximum).toFixed(Math.max(decimalPlaces(increment), decimalPlaces(minimum))));
  }

  function commit(next: number) {
    const normalized = normalize(next);
    if (!isControlled) setInternalValue(normalized);
    setTextState({ forValue: normalized, text: String(normalized) });
    onValueChange?.(normalized);
  }

  function commitText() {
    const parsed = Number(textValue);
    if (Number.isFinite(parsed)) commit(parsed);
    else setTextState({ forValue: displayedValue, text: String(displayedValue) });
  }

  const cannotDecrease = disabled || readOnly || displayedValue <= minimum;
  const cannotIncrease = disabled || readOnly || displayedValue >= maximum;

  return (
    <Field className={className} error={error} helperText={helperText} ids={ids} label={label} required={required}>
      <div className="stepper">
        <button aria-label={`Zmniejsz: ${label}`} className="stepper__button" disabled={cannotDecrease} onClick={() => commit(displayedValue - increment)} type="button"><Minus aria-hidden="true" size={18} weight="bold" /></button>
        <input
          aria-describedby={describedBy(ids, helperText, error)}
          aria-invalid={error ? true : undefined}
          aria-label={label}
          className="stepper__input"
          disabled={disabled}
          id={ids.inputId}
          inputMode="decimal"
          max={max}
          min={min}
          onBlur={commitText}
          onChange={(event) => setTextState({ forValue: displayedValue, text: event.target.value })}
          onKeyDown={(event) => {
            if (event.key === "Enter") event.currentTarget.blur();
          }}
          readOnly={readOnly}
          required={required}
          step={step}
          type="number"
          value={textValue}
          {...props}
        />
        <button aria-label={`Zwiększ: ${label}`} className="stepper__button" disabled={cannotIncrease} onClick={() => commit(displayedValue + increment)} type="button"><Plus aria-hidden="true" size={18} weight="bold" /></button>
      </div>
    </Field>
  );
}
