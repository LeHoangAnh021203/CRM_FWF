import * as React from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

// Main Select component
interface SelectProps {
  value: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

export const Select = ({ value, onValueChange, children, className }: SelectProps) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedValue, setSelectedValue] = React.useState(value);
  const selectRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setSelectedValue(value);
  }, [value]);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (newValue: string) => {
    setSelectedValue(newValue);
    onValueChange?.(newValue);
    setIsOpen(false);
  };

  return (
    <div ref={selectRef} className={`relative ${className}`}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          if (child.type === SelectTrigger) {
            return React.cloneElement(child, {
              onClick: () => setIsOpen(!isOpen),
              isOpen,
              selectedValue,
            });
          }
          if (child.type === SelectContent && isOpen) {
            return React.cloneElement(child, {
              onSelect: handleSelect,
              selectedValue,
            });
          }
        }
        return null;
      })}
    </div>
  );
};

interface SelectTriggerProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  isOpen?: boolean;
  selectedValue?: string;
}

export const SelectTrigger = ({ children, className, onClick, isOpen, selectedValue }: SelectTriggerProps) => (
  <Button
    variant="outline"
    role="combobox"
    aria-expanded={isOpen}
    className={`w-full justify-between ${className}`}
    onClick={onClick}
  >
    <span>{selectedValue || children}</span>
    <ChevronDown className={`ml-2 h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
  </Button>
);

export const SelectValue = ({ children }: { children: React.ReactNode }) => <>{children}</>;

interface SelectContentProps {
  children: React.ReactNode;
  onSelect?: (value: string) => void;
  selectedValue?: string;
}

export const SelectContent = ({ children, onSelect, selectedValue }: SelectContentProps) => (
  <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
    {React.Children.map(children, (child) => {
      if (React.isValidElement(child) && child.type === SelectItem) {
        return React.cloneElement(child, {
          onSelect,
          isSelected: child.props.value === selectedValue,
        });
      }
      return null;
    })}
  </div>
);

interface SelectItemProps {
  value: string;
  children: React.ReactNode;
  onSelect?: (value: string) => void;
  isSelected?: boolean;
}

export const SelectItem = ({ value, children, onSelect, isSelected }: SelectItemProps) => (
  <div
    className={`px-3 py-2 cursor-pointer hover:bg-gray-100 transition-colors ${
      isSelected ? 'bg-gray-100' : ''
    }`}
    onClick={() => onSelect?.(value)}
  >
    {children}
  </div>
);
