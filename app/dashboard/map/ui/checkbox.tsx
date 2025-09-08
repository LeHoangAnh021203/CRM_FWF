"use client"

import * as React from "react"
import { Check } from "lucide-react"

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className = "", checked, onCheckedChange, ...props }, ref) => {
    const [isChecked, setIsChecked] = React.useState(checked || false)
    
    React.useEffect(() => {
      setIsChecked(checked || false)
    }, [checked])
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newChecked = e.target.checked
      setIsChecked(newChecked)
      onCheckedChange?.(newChecked)
    }
    
    return (
      <div className="relative">
        <input
          ref={ref}
          type="checkbox"
          checked={isChecked}
          onChange={handleChange}
          className="sr-only"
          {...props}
        />
        <div
          className={`h-4 w-4 shrink-0 rounded-sm border border-gray-300 shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 ${
            isChecked ? "bg-blue-600 text-white" : "bg-white"
          } ${className}`}
          onClick={() => {
            const newChecked = !isChecked
            setIsChecked(newChecked)
            onCheckedChange?.(newChecked)
          }}
        >
          {isChecked && (
            <div className="flex items-center justify-center text-current">
              <Check className="h-4 w-4" />
            </div>
          )}
        </div>
      </div>
    )
  }
)
Checkbox.displayName = "Checkbox"

export { Checkbox }
