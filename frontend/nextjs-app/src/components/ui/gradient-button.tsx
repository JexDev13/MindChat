import { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface GradientButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  loading?: boolean;
}

export const GradientButton = ({ 
  children, 
  className, 
  variant = 'primary',
  loading,
  ...props 
}: GradientButtonProps) => {
  const gradients = {
    primary: "bg-gradient-to-r from-purple-600 via-purple-500 to-blue-500",
    secondary: "bg-gradient-to-r from-blue-600 via-blue-500 to-purple-500"
  };

  return (
    <button
      className={cn(
        gradients[variant],
        "relative overflow-hidden rounded-lg px-8 py-3",
        "text-white font-semibold",
        "hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/50",
        "transition-all duration-300",
        "active:scale-95",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
      disabled={loading}
      {...props}
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
        </div>
      ) : (
        children
      )}
    </button>
  );
};
