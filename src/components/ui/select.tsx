import * as React from "react";

// Simple Select component using native HTML select
interface SelectProps {
  value: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

export const Select = ({ value, onValueChange, children, className }: SelectProps) => {
  return (
    <div className={className}>
      <select
        value={value}
        onChange={(e) => onValueChange?.(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {children}
      </select>
    </div>
  );
};

export const SelectTrigger = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={className}>{children}</div>
);

export const SelectValue = ({ children }: { children: React.ReactNode }) => <>{children}</>;

export const SelectContent = ({ children }: { children: React.ReactNode }) => <>{children}</>;

export const SelectItem = ({ value, children }: { value: string; children: React.ReactNode }) => (
  <option value={value}>{children}</option>
);
