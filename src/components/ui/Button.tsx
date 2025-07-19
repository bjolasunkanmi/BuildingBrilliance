'use client'

import { forwardRef, ButtonHTMLAttributes, ReactNode } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { clsx } from 'clsx'
import { LoadingSpinner } from './LoadingSpinner'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  loading?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  href?: string
  external?: boolean
  fullWidth?: boolean
  children: ReactNode
}

const buttonVariants = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  outline: 'btn-outline',
  ghost: 'btn-ghost',
  danger: 'bg-error-600 text-white hover:bg-error-700 focus:ring-error-500',
}

const buttonSizes = {
  xs: 'px-2 py-1 text-xs',
  sm: 'btn-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'btn-lg',
  xl: 'px-8 py-4 text-lg',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      leftIcon,
      rightIcon,
      href,
      external = false,
      fullWidth = false,
      disabled,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const baseClasses = clsx(
      'btn',
      buttonVariants[variant],
      buttonSizes[size],
      {
        'w-full': fullWidth,
        'opacity-50 cursor-not-allowed': disabled || loading,
      },
      className
    )

    const content = (
      <>
        {loading && <LoadingSpinner size="sm" className="mr-2" />}
        {!loading && leftIcon && <span className="mr-2">{leftIcon}</span>}
        <span>{children}</span>
        {!loading && rightIcon && <span className="ml-2">{rightIcon}</span>}
      </>
    )

    if (href) {
      if (external) {
        return (
          <motion.a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={baseClasses}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {content}
          </motion.a>
        )
      }

      return (
        <Link href={href} className={baseClasses}>
          <motion.span
            className="block"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {content}
          </motion.span>
        </Link>
      )
    }

    return (
      <motion.button
        ref={ref}
        className={baseClasses}
        disabled={disabled || loading}
        whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
        whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
        {...props}
      >
        {content}
      </motion.button>
    )
  }
)

Button.displayName = 'Button'