import React from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
  rightElement?: React.ReactNode
}

export default function Input({
  label,
  error,
  icon,
  rightElement,
  className,
  id,
  ...props
}: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 flex-shrink-0" style={{ color: 'var(--text-muted)' }}>
            {icon}
          </span>
        )}
        <input
          id={inputId}
          className={cn(
            'input-field w-full rounded-xl px-4 py-3 text-sm',
            icon ? 'pl-10' : undefined,
rightElement ? 'pr-12' : undefined,
error ? 'border-rose-500 focus:border-rose-500 focus:shadow-glow-rose' : undefined,
            className
          )}
          {...props}
        />
        {rightElement && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2">
            {rightElement}
          </span>
        )}
      </div>
      {error && (
        <p className="mt-1.5 text-xs text-rose-400">{error}</p>
      )}
    </div>
  )
}
