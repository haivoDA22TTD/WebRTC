import { forwardRef, useState, type InputHTMLAttributes } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, type, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    const isPassword = type === 'password';
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
      <div className="w-full">
        {label && (
          <label className="block text-xs font-bold text-[#b5bac1] uppercase mb-2">
            {label}
            {props.required && <span className="text-[#ed4245] ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            type={inputType}
            className={`
              w-full px-4 py-3
              bg-[#1e1f22] 
              border border-[#1e1f22] 
              rounded-md
              text-[#dbdee1] text-base
              placeholder-[#6d6f78] 
              transition-all duration-200
              hover:border-[#35363c]
              focus:outline-none focus:border-[#5865f2]
              ${isPassword ? 'pr-12' : ''}
              ${error ? 'border-[#ed4245] focus:border-[#ed4245]' : ''}
              ${className}
            `}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6d6f78] hover:text-[#b5bac1] transition-colors"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          )}
        </div>
        {error && (
          <p className="mt-2 text-xs text-[#ed4245]">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
