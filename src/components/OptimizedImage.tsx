import Image from "next/image";

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  fill?: boolean;
  priority?: boolean;
  sizes?: string;
  // Nuevo prop para forzar optimización
  forceOptimized?: boolean;
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  fill = false,
  priority = false,
  sizes,
  forceOptimized = false,
}: OptimizedImageProps) {
  // Usar unoptimized para imágenes pequeñas (< 10KB) según recomendaciones de Vercel
  // También para imágenes que no necesitan optimización
  const shouldUseUnoptimized =
    !forceOptimized &&
    // Imágenes pequeñas (aproximadamente < 10KB)
    ((width && height && width * height < 10000) ||
      // Imágenes SVG
      src.endsWith(".svg") ||
      // Imágenes GIF animadas
      src.endsWith(".gif") ||
      // Imágenes locales que ya están optimizadas
      src.startsWith("/images/"));

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      fill={fill}
      priority={priority}
      sizes={sizes}
      unoptimized={shouldUseUnoptimized}
    />
  );
}
