import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export const GlassCard = ({ children, className, hover }: GlassCardProps) => {
  return (
    <div
      className={cn(
        "backdrop-blur-xl bg-white/10 border border-white/20",
        "rounded-2xl p-6 shadow-2xl shadow-purple-500/20",
        hover && "hover:bg-white/20 hover:border-white/30 hover:shadow-purple-500/30 transition-all duration-300",
        className
      )}
    >
      {children}
    </div>
  );
};
