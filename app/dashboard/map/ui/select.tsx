"use client"

import * as React from "react"
import { Check, ChevronDown, ChevronUp } from "lucide-react"

interface SelectProps {
  value?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
}

interface SelectTriggerProps extends React.HTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
}

interface SelectContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

interface SelectItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
  children: React.ReactNode
}

interface SelectValueProps {
  placeholder?: string
}

const Select = ({ value, onValueChange, children }: SelectProps) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const [selectedValue, setSelectedValue] = React.useState(value || "")
  
  React.useEffect(() => {
    setSelectedValue(value || "")
  }, [value])
  
  const handleValueChange = (newValue: string) => {
    setSelectedValue(newValue)
    onValueChange?.(newValue)
    setIsOpen(false)
  }
  
  return (
    <div className="relative">
      {React.Children.map(children, child => 
        React.isValidElement(child) 
          ? React.cloneElement(child, { 
              isOpen, 
              setIsOpen, 
              selectedValue, 
              onValueChange: handleValueChange 
            } as any)
          : child
      )}
    </div>
  )
}

const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ className = "", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        {...props}
      >
        {children}
        <ChevronDown className="h-4 w-4 opacity-50" />
      </button>
    )
  }
)
SelectTrigger.displayName = "SelectTrigger"

const SelectContent = React.forwardRef<HTMLDivElement, SelectContentProps>(
  ({ className = "", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`absolute top-full z-50 mt-1 w-full rounded-md border bg-white shadow-lg ${className}`}
        {...props}
      >
        {children}
      </div>
    )
  }
)
SelectContent.displayName = "SelectContent"

const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(
  ({ className = "", value, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 ${className}`}
        onClick={() => {
          // This will be handled by the parent Select component
        }}
        {...props}
      >
        {children}
      </div>
    )
  }
)
SelectItem.displayName = "SelectItem"

const SelectValue = ({ placeholder }: SelectValueProps) => {
  return <span className="text-gray-500">{placeholder}</span>
}

export {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
}