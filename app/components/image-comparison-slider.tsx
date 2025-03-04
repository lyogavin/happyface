import React, { useState, useRef } from "react";
import Image from "next/image";

interface ImageComparisonSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeAlt: string;
  afterAlt: string;
}

export function ImageComparisonSlider({
  beforeImage,
  afterImage,
  beforeAlt,
  afterAlt,
}: ImageComparisonSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const containerWidth = rect.width;
    
    const newPosition = Math.max(0, Math.min(100, (x / containerWidth) * 100));
    setSliderPosition(newPosition);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    const containerWidth = rect.width;
    
    const newPosition = Math.max(0, Math.min(100, (x / containerWidth) * 100));
    setSliderPosition(newPosition);
  };

  return (
    <div 
      ref={containerRef}
      className={`relative rounded-lg overflow-hidden shadow-md cursor-ew-resize`}
      style={{ 
        width: '100%',
        aspectRatio: `1024 / 1024`
      }}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
    >
      {/* Before Image - Base Layer */}
      <div className="absolute inset-0">
        <Image
          src={beforeImage}
          alt={beforeAlt}
          width={1024}
          height={1024}
          className="object-cover w-full h-full"
          priority={true}
          sizes="(max-width: 1280px) 100vw, 1024px"
        />
      </div>
      
      {/* After Image - Top Layer with Clip Path */}
      <div 
        className="absolute inset-0"
        style={{ 
          clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` 
        }}
      >
        <Image
          src={afterImage}
          alt={afterAlt}
          width={1024}
          height={1024}
          className="object-cover w-full h-full"
          priority={true}
          sizes="(max-width: 1280px) 100vw, 1024px"
        />
      </div>

      {/* Labels - Always visible, on top of everything */}
      <div className="absolute top-2 left-2 bg-white/80 px-2 py-1 rounded text-xs font-medium z-10">
        Before
      </div>
      <div className="absolute top-2 right-2 bg-white/80 px-2 py-1 rounded text-xs font-medium z-10">
        After
      </div>

      {/* Slider Control */}
      <div 
        className="absolute top-0 bottom-0 w-1 bg-white shadow-md cursor-ew-resize z-20"
        style={{ left: `${sliderPosition}%` }}
      >
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center">
          <div className="flex flex-col gap-1">
            <div className="w-0.5 h-3 bg-gray-400"></div>
            <div className="w-0.5 h-3 bg-gray-400"></div>
          </div>
        </div>
      </div>
    </div>
  );
} 