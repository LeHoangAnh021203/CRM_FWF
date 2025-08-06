import * as React from "react";

// Main Select component
interface SelectProps {
  value: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}
export const Select = ({ value, onValueChange, children, className }: SelectProps) => (
  <select
    value={value}
    onChange={e => onValueChange?.(e.target.value)}
    className={className}
  >
    {children}
  </select>
);

export const SelectTrigger = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={className}>{children}</div>
);
export const SelectValue = ({ children }: { children: React.ReactNode }) => <>{children}</>;
export const SelectContent = ({ children }: { children: React.ReactNode }) => <>{children}</>;

interface SelectItemProps {
  value: string;
  children: React.ReactNode;
}
export const SelectItem = ({ value, children }: SelectItemProps) => (
  <option value={value}>{children}</option>
);
