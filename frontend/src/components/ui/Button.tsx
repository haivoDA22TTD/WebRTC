import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { useThemeStore, themeColors } from '../../stores/themeStore';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', isLoading, leftIcon, rightIcon, children, disabled, style, ...props }, ref) => {
    const { themeColor } = useThemeStore();
    const theme = themeColors[themeColor];

    const baseStyles = `
      font-medium rounded-md
      transition-all duration-200
      flex items-center justify-center gap-2 
      disabled:opacity-50 disabled:cursor-not-allowed
      active:scale-[0.98]
    `;
    
    const variants = {
      primary: 'text-white hover:brightness-110',
      secondary: 'bg-[#4e5058] hover:bg-[#6d6f78] text-white',
      danger: 'bg-[#ed4245] hover:bg-[#c93b3e] text-white',
      ghost: 'bg-transparent hover:bg-[#35363c] text-[#b5bac1] hover:text-white',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2.5 text-sm',
      lg: 'px-6 py-3 text-base',
    };

    const getStyle = () => {
      if (variant === 'primary') {
        return { backgroundColor: theme.primary, ...style };
      }
      return style;
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        disabled={disabled || isLoading}
        style={getStyle()}
        {...props}
      >
        {isLoading ? (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : leftIcon}
        {children}
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';
