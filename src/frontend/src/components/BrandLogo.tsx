import { cn } from '@/lib/utils';

interface BrandLogoProps {
  variant?: 'square' | 'wide';
  className?: string;
}

export function BrandLogo({ variant = 'square', className }: BrandLogoProps) {
  const src =
    variant === 'square'
      ? '/assets/generated/bismi-cabs-logo-transparent.dim_512x512.png'
      : '/assets/generated/bismi-cabs-logo-wide-transparent.dim_1200x400.png';

  const alt = 'BISMI CABS Logo';

  return (
    <img
      src={src}
      alt={alt}
      className={cn('object-contain', className)}
      loading="eager"
    />
  );
}
