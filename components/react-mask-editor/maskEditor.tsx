'use client'
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { hexToRgb } from './utils';

export interface MaskEditorRef {
  resetMask: () => void;
  saveToAlpha: () => Promise<string>;
}

interface Vector2 {
  x: number;
  y: number;
}

interface MaskEditorProps {
  src: string;
  cursorSize: number;
  maskOpacity?: number;
  maskColor?: string;
  maskBlendMode?: string;
  onCursorSizeChange?: (size: number) => void;
  canvasRef?: React.MutableRefObject<HTMLCanvasElement>;
  initialMask?: string;
}

export const MaskEditor: React.FC<MaskEditorProps> = React.forwardRef((props: MaskEditorProps, ref) => {
  const {
    src,
    cursorSize,
    maskOpacity = 0.5,
    maskColor = "#ff0000",
    maskBlendMode = "normal",
    onCursorSizeChange,
    initialMask
  } = props;

  const containerRef = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const maskCanvas = useRef<HTMLCanvasElement>(null);
  const cursorCanvas = useRef<HTMLCanvasElement>(null);
  const backgroundCanvas = useRef<HTMLCanvasElement>(null);

  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
  const [maskContext, setMaskContext] = useState<CanvasRenderingContext2D | null>(null);
  const [cursorContext, setCursorContext] = useState<CanvasRenderingContext2D | null>(null);
  const [backgroundContext, setBackgroundContext] = useState<CanvasRenderingContext2D | null>(null);
  const [size, setSize] = useState<Vector2>({ x: 0, y: 0 });
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPos, setLastPos] = useState<Vector2 | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  const getMaxDimensions = useCallback(() => {
    const maxWidth = 800;
    const maxHeight = 800;
    return { maxWidth, maxHeight };
  }, []);

  // Load the image
  React.useEffect(() => {
    if (!src) {
      console.error("No source provided");
      return;
    }
    console.log("[MaskEditor] Loading image from src:", src);
    
    const img = new Image();
    img.crossOrigin = "anonymous";
    
    img.onload = () => {
      console.log("[MaskEditor] Image loaded successfully:", {
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight
      });
      
      const { maxWidth, maxHeight } = getMaxDimensions();
      
      // Calculate dimensions while maintaining aspect ratio
      let width = img.width;
      let height = img.height;
      
      if (width > maxWidth) {
        const ratio = maxWidth / width;
        width = maxWidth;
        height = height * ratio;
      }
      
      if (height > maxHeight) {
        const ratio = maxHeight / height;
        height = maxHeight;
        width = width * ratio;
      }
      
      // Set canvas size
      setSize({ x: width, y: height });
      
      // Draw image on canvas - IMPORTANT: Wait for next frame to ensure canvas is ready
      setTimeout(() => {
        if (canvas.current) {
          const ctx = canvas.current.getContext('2d');
          if (ctx) {
            canvas.current.width = width;
            canvas.current.height = height;
            ctx.drawImage(img, 0, 0, width, height);
            console.log("[MaskEditor] Image drawn on canvas");
          }
        }
        
        // Initialize mask canvas with white
        if (maskCanvas.current) {
          const maskCtx = maskCanvas.current.getContext('2d');
          if (maskCtx) {
            maskCanvas.current.width = width;
            maskCanvas.current.height = height;
            maskCtx.fillStyle = "#ffffff";
            maskCtx.fillRect(0, 0, width, height);
            
            // If initialMask is provided, load it
            if (initialMask) {
              const maskImg = new Image();
              maskImg.onload = () => {
                maskCtx.drawImage(maskImg, 0, 0, width, height);
              };
              maskImg.src = initialMask;
            }
          }
        }
        
        // Initialize cursor canvas
        if (cursorCanvas.current) {
          cursorCanvas.current.width = width;
          cursorCanvas.current.height = height;
        }
        
        // Initialize background canvas
        if (backgroundCanvas.current) {
          backgroundCanvas.current.width = width;
          backgroundCanvas.current.height = height;
          const bgCtx = backgroundCanvas.current.getContext('2d');
          if (bgCtx) {
            // Use a checkerboard pattern for transparency
            const tileSize = 10;
            for (let x = 0; x < width; x += tileSize) {
              for (let y = 0; y < height; y += tileSize) {
                bgCtx.fillStyle = (x + y) % (tileSize * 2) === 0 ? '#f0f0f0' : '#e0e0e0';
                bgCtx.fillRect(x, y, tileSize, tileSize);
              }
            }
          }
        }
        
        setImageLoaded(true);
      }, 0);
    };
    
    img.onerror = (e) => {
      console.error("[MaskEditor] Error loading image:", e);
    };
    
    console.log("[MaskEditor] Setting image src:", src);
    img.src = src;
  }, [src, getMaxDimensions, initialMask]);

  // Pass mask canvas up
  React.useLayoutEffect(() => {
    if (props.canvasRef) {
      props.canvasRef.current = maskCanvas.current as HTMLCanvasElement;
    }
  }, [maskCanvas, props.canvasRef]);

  // Initialize canvases
  React.useLayoutEffect(() => {
    if (canvas.current) {
      const ctx = canvas.current.getContext("2d");
      setContext(ctx);
    }
    
    if (maskCanvas.current) {
      const ctx = maskCanvas.current.getContext("2d");
      setMaskContext(ctx);
    }
    
    if (cursorCanvas.current) {
      const ctx = cursorCanvas.current.getContext("2d");
      setCursorContext(ctx);
    }
  }, []);

  // Handle mouse events for drawing
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!maskContext) return;
    
    setIsDrawing(true);
    const rect = cursorCanvas.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Draw a dot at the starting position
    maskContext.fillStyle = "#000000";
    maskContext.beginPath();
    maskContext.arc(x, y, cursorSize / 2, 0, Math.PI * 2);
    maskContext.fill();
    
    setLastPos({ x, y });
  }, [cursorSize, maskContext]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!cursorContext || !maskContext) return;
    
    const rect = cursorCanvas.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Update cursor position
    cursorContext.clearRect(0, 0, size.x, size.y);
    cursorContext.strokeStyle = "#000000";
    cursorContext.lineWidth = 1;
    cursorContext.beginPath();
    cursorContext.arc(x, y, cursorSize / 2, 0, Math.PI * 2);
    cursorContext.stroke();
    
    // Draw line if we're drawing
    if (isDrawing && lastPos) {
      maskContext.fillStyle = "#000000";
      maskContext.beginPath();
      maskContext.arc(x, y, cursorSize / 2, 0, Math.PI * 2);
      maskContext.fill();
      
      // Connect dots with a line
      maskContext.beginPath();
      maskContext.lineWidth = cursorSize;
      maskContext.lineCap = "round";
      maskContext.strokeStyle = "#000000";
      maskContext.moveTo(lastPos.x, lastPos.y);
      maskContext.lineTo(x, y);
      maskContext.stroke();
      
      setLastPos({ x, y });
    }
  }, [cursorContext, maskContext, cursorSize, isDrawing, lastPos, size.x, size.y]);

  const handleMouseUp = useCallback(() => {
    setIsDrawing(false);
    setLastPos(null);
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (cursorContext) {
      cursorContext.clearRect(0, 0, size.x, size.y);
    }
    setIsDrawing(false);
    setLastPos(null);
  }, [cursorContext, size.x, size.y]);

  // Handle wheel event for brush size
  const handleWheel = useCallback((e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -1 : 1;
    const newSize = Math.max(1, Math.min(100, cursorSize + delta));
    
    if (onCursorSizeChange) {
      onCursorSizeChange(newSize);
    }
  }, [cursorContext, maskContext, cursorCanvas, cursorSize, maskColor, size, onCursorSizeChange]);

  const resetMask = React.useCallback(() => {
    if (maskContext) {
      maskContext.fillStyle = "#ffffff";
      maskContext.fillRect(0, 0, size.x, size.y);
    }
  }, [maskContext, size]);

  // Add initialization for background canvas
  React.useLayoutEffect(() => {
    if (backgroundCanvas.current) {
      const ctx = backgroundCanvas.current.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, size.x, size.y);
      }
      setBackgroundContext(ctx);
    }
  }, [size.x, size.y]);

  const saveToAlpha = React.useCallback((): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!maskCanvas.current) {
        reject("No mask canvas available");
        return;
      }
      
      const canvas = document.createElement('canvas');
      canvas.width = size.x;
      canvas.height = size.y;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject("Could not create canvas context");
        return;
      }
      
      // Get the mask data
      const maskCtx = maskCanvas.current.getContext('2d');
      if (!maskCtx) {
        reject("Could not get mask context");
        return;
      }
      
      const maskData = maskCtx.getImageData(0, 0, size.x, size.y);
      
      // Create a new image with the mask as alpha
      const imageData = ctx.createImageData(size.x, size.y);
      
      for (let i = 0; i < maskData.data.length; i += 4) {
        // If the mask pixel is white (255), make it transparent in the output
        // If the mask pixel is black (0), make it opaque in the output
        const alpha = 255 - maskData.data[i]; // Invert: white becomes transparent, black becomes opaque
        
        imageData.data[i] = 0;     // R
        imageData.data[i+1] = 0;   // G
        imageData.data[i+2] = 0;   // B
        imageData.data[i+3] = alpha; // A
      }
      
      ctx.putImageData(imageData, 0, 0);
      
      // Return as data URL
      resolve(canvas.toDataURL('image/png'));
    });
  }, [size.x, size.y]);

  // Update the useImperativeHandle to include the new method
  React.useImperativeHandle(ref, () => ({
    resetMask,
    saveToAlpha
  }));

  return <div className="react-mask-editor-outer" ref={containerRef}>
    {/* Disable next/image warning for this specific img tag */}
    {/* eslint-disable-next-line @next/next/no-img-element */}
    {src && (
      <img 
        src={src}
        alt="Debug image"
        style={{ display: 'none' }} 
        onLoad={() => console.log("Debug image loaded")}
        onError={() => console.error("Debug image failed to load")}
      />
    )}
    <div
      className="react-mask-editor-inner"
      style={{
        width: size.x,
        height: size.y,
        position: 'relative'
      }}
    >
      <canvas
        ref={backgroundCanvas}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: size.x,
          height: size.y,
          zIndex: 0
        }}
        width={size.x}
        height={size.y}
        className="react-mask-editor-background-canvas"
      />
      <canvas
        ref={canvas}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: size.x,
          height: size.y,
          zIndex: 1,
          opacity: 0.75
        }}
        width={size.x}
        height={size.y}
        className="react-mask-editor-base-canvas"
      />
      <canvas
        ref={maskCanvas}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: size.x,
          height: size.y,
          opacity: maskOpacity,
          mixBlendMode: maskBlendMode as React.CSSProperties['mixBlendMode'],
          zIndex: 2
        }}
        width={size.x}
        height={size.y}
        className="react-mask-editor-mask-canvas"
      />
      <canvas
        ref={cursorCanvas}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: size.x,
          height: size.y,
          zIndex: 3
        }}
        width={size.x}
        height={size.y}
        className="react-mask-editor-cursor-canvas"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onWheel={handleWheel}
      />
    </div>
  </div>
}) 