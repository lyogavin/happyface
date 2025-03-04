'use client'
import React, { useCallback, useRef, useState } from 'react';

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
  maskData?: string;
  onMaskDataChange?: (maskData: string) => void;
  onResetMask?: () => void;
  onSaveToAlpha?: (dataUrl: string) => void;
}

export const MaskEditor: React.FC<MaskEditorProps> = (props) => {
  const {
    src,
    cursorSize,
    maskOpacity = 0.85,
    maskColor = "#ff0000",
    maskBlendMode = "normal",
    onCursorSizeChange,
    maskData,
    onMaskDataChange, // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onResetMask, // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onSaveToAlpha // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } = props;

  const containerRef = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const maskCanvas = useRef<HTMLCanvasElement>(null);
  const cursorCanvas = useRef<HTMLCanvasElement>(null);
  const backgroundCanvas = useRef<HTMLCanvasElement>(null);

  const [, setContext] = useState<CanvasRenderingContext2D | null>(null);
  const [maskContext, setMaskContext] = useState<CanvasRenderingContext2D | null>(null);
  const [cursorContext, setCursorContext] = useState<CanvasRenderingContext2D | null>(null);
  const [, setBackgroundContext] = useState<CanvasRenderingContext2D | null>(null);
  const [size, setSize] = useState<Vector2>({ x: 0, y: 0 });
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPos, setLastPos] = useState<Vector2 | null>(null);
  const [, setImageLoaded] = useState(false);

  const getMaxDimensions = useCallback(() => {
    const maxWidth = 800;
    const maxHeight = 600;
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
        naturalHeight: img.naturalHeight,
        complete: img.complete
      });
      
      // Debug: Print image data
      try {
        // Create a temporary canvas to extract image data
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = Math.min(img.naturalWidth, 100);
        tempCanvas.height = Math.min(img.naturalHeight, 100);
        const tempCtx = tempCanvas.getContext('2d');
        
        if (tempCtx) {
          // Draw a portion of the image
          tempCtx.drawImage(img, 0, 0, tempCanvas.width, tempCanvas.height);
          
          // Get image data
          const imageData = tempCtx.getImageData(0, 0, 10, 10);
          
          // Log the first few pixels
          console.log("[MaskEditor] Image pixels:", imageData.data.slice(0, 40));
        }
      } catch (error) {
        console.error("[MaskEditor] Error extracting image data for debugging:", error);
      }
      
      const { maxWidth, maxHeight } = getMaxDimensions();
      console.log("[MaskEditor] Max dimensions:", { maxWidth, maxHeight });
      
      // Calculate dimensions while maintaining aspect ratio
      // Using the approach from the working version
      const scaleWidth = maxWidth / img.naturalWidth;
      const scaleHeight = maxHeight / img.naturalHeight;
      const scale = Math.min(1, scaleWidth, scaleHeight);
      
      // Ensure minimum dimensions
      const minWidth = 200;
      const minHeight = 200;
      const width = Math.max(minWidth, Math.floor(img.naturalWidth * scale));
      const height = Math.max(minHeight, Math.floor(img.naturalHeight * scale));
      
      console.log("[MaskEditor] Calculated dimensions:", { 
        width, 
        height, 
        scale,
        scaleWidth,
        scaleHeight
      });
      
      // Set canvas size
      setSize({ x: width, y: height });
      
      // Use a slightly longer timeout to ensure the canvas is ready
      setTimeout(() => {
        if (canvas.current) {
          console.log("[MaskEditor] Canvas exists, attempting to draw");
          const ctx = canvas.current.getContext('2d', { willReadFrequently: true });
          if (ctx) {
            try {
              canvas.current.width = width;
              canvas.current.height = height;
              console.log("[MaskEditor] Canvas dimensions set:", canvas.current.width, "x", canvas.current.height);
              
              // Clear the canvas first
              ctx.clearRect(0, 0, width, height);
              
              // IMPORTANT: Draw the image
              ctx.drawImage(img, 0, 0, width, height);
              console.log("[MaskEditor] Drew image on canvas successfully");
              
              // Debug: Check canvas pixels after drawing
              const canvasData = ctx.getImageData(0, 0, 10, 10);
              console.log("[MaskEditor] Canvas pixels after drawing:", canvasData.data.slice(0, 40));
              
              // Draw a small red rectangle in the corner for debugging
              ctx.fillStyle = 'red';
              ctx.fillRect(0, 0, 10, 10);
            } catch (error) {
              console.error("[MaskEditor] Error drawing image on canvas:", error);
            }
          } else {
            console.error("[MaskEditor] Failed to get canvas context");
          }
        } else {
          console.error("[MaskEditor] Canvas not available for drawing");
        }
        
        // Initialize mask canvas with white (or black based on working version)
        if (maskCanvas.current) {
          const maskCtx = maskCanvas.current.getContext('2d', { willReadFrequently: true });
          if (maskCtx) {
            maskCanvas.current.width = width;
            maskCanvas.current.height = height;
            maskCtx.fillStyle = "#ffffff";  // White background for mask
            maskCtx.fillRect(0, 0, width, height);
            setMaskContext(maskCtx);
          } else {
            console.error("[MaskEditor] Failed to get mask canvas context");
          }
        }
        
        // Initialize cursor canvas
        if (cursorCanvas.current) {
          cursorCanvas.current.width = width;
          cursorCanvas.current.height = height;
          const cursorCtx = cursorCanvas.current.getContext('2d', { willReadFrequently: true });
          setCursorContext(cursorCtx);
        }
        
        // Initialize background canvas with checkerboard pattern
        if (backgroundCanvas.current) {
          backgroundCanvas.current.width = width;
          backgroundCanvas.current.height = height;
          const bgCtx = backgroundCanvas.current.getContext('2d', { willReadFrequently: true });
          if (bgCtx) {
            // Use a checkerboard pattern for transparency
            const tileSize = 10;
            for (let x = 0; x < width; x += tileSize) {
              for (let y = 0; y < height; y += tileSize) {
                bgCtx.fillStyle = (x + y) % (tileSize * 2) === 0 ? '#f0f0f0' : '#e0e0e0';
                bgCtx.fillRect(x, y, tileSize, tileSize);
              }
            }
            setBackgroundContext(bgCtx);
          }
        }
        
        setImageLoaded(true);
      }, 50);  // Increased timeout to 50ms
    };
    
    img.onerror = (e) => {
      console.error("[MaskEditor] Error loading image:", e);
    };
    
    console.log("[MaskEditor] Setting image src:", src);
    img.src = src;
  }, [src, getMaxDimensions]);

  // Pass mask canvas up
  React.useLayoutEffect(() => {
    if (props.canvasRef) {
      props.canvasRef.current = maskCanvas.current as HTMLCanvasElement;
    }
  }, [maskCanvas, props.canvasRef]);

  // Initialize canvases
  React.useLayoutEffect(() => {
    if (canvas.current) {
      const ctx = canvas.current.getContext("2d", { willReadFrequently: true });
      setContext(ctx);
    }
    
    if (maskCanvas.current) {
      const ctx = maskCanvas.current.getContext("2d", { willReadFrequently: true });
      setMaskContext(ctx);
    }
    
    if (cursorCanvas.current) {
      const ctx = cursorCanvas.current.getContext("2d", { willReadFrequently: true });
      setCursorContext(ctx);
    }
    
    if (backgroundCanvas.current) {
      const ctx = backgroundCanvas.current.getContext("2d", { willReadFrequently: true });
      setBackgroundContext(ctx);
    }
  }, []);

  // Add this function to draw the cursor
  const drawCursor = useCallback((x: number, y: number) => {
    if (!cursorContext || !cursorCanvas.current) return;
    
    // Clear previous cursor
    cursorContext.clearRect(0, 0, size.x, size.y);
    
    // Draw new cursor
    cursorContext.beginPath();
    cursorContext.fillStyle = `${maskColor}88`; // Semi-transparent fill
    cursorContext.strokeStyle = maskColor;
    cursorContext.arc(x, y, cursorSize / 2, 0, Math.PI * 2);
    cursorContext.fill();
    cursorContext.stroke();
  }, [cursorContext, cursorSize, size.x, size.y, maskColor]);

  // Add this function to get canvas coordinates
  const getCanvasCoordinates = useCallback((clientX: number, clientY: number) => {
    const rect = maskCanvas.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    return { x, y };
  }, []);

  // Update mouse event handlers to use these functions
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getCanvasCoordinates(e.clientX, e.clientY);
    
    // Draw cursor
    drawCursor(x, y);
    
    // Draw line if we're drawing
    if (isDrawing && lastPos && maskContext) {
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
  }, [maskContext, cursorSize, isDrawing, lastPos, drawCursor, getCanvasCoordinates]);

  const handleMouseLeave = useCallback(() => {
    setIsDrawing(false);
    setLastPos(null);
    
    // Clear cursor when mouse leaves
    if (cursorContext) {
      cursorContext.clearRect(0, 0, size.x, size.y);
    }
  }, [cursorContext, size.x, size.y]);

  // Handle wheel event for brush size
  const handleWheel = useCallback((e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -1 : 1;
    const newSize = Math.max(1, Math.min(100, cursorSize + delta));
    
    if (onCursorSizeChange) {
      onCursorSizeChange(newSize);
    }
  }, [cursorSize, onCursorSizeChange]);

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


  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const { x, y } = getCanvasCoordinates(e.clientX, e.clientY);
    
    if (maskContext) {
      maskContext.fillStyle = "#000000";
      maskContext.beginPath();
      maskContext.arc(x, y, cursorSize / 2, 0, Math.PI * 2);
      maskContext.fill();
    }
    
    setLastPos({ x, y });
  }, [cursorSize, maskContext, getCanvasCoordinates]);

  const handleMouseUp = useCallback(() => {
    setIsDrawing(false);
    setLastPos(null);
    
    // If we have an onMaskDataChange callback, generate and send the mask data
    if (onMaskDataChange && maskCanvas.current) {
      const dataUrl = maskCanvas.current.toDataURL('image/png');
      onMaskDataChange(dataUrl);
    }
  }, [onMaskDataChange]);

  // Add effect to update mask when maskData prop changes
  React.useEffect(() => {
    if (maskData && maskContext && size.x > 0 && size.y > 0) {
      const maskImg = new Image();
      maskImg.onload = () => {
        maskContext.clearRect(0, 0, size.x, size.y);
        maskContext.drawImage(maskImg, 0, 0, size.x, size.y);
      };
      maskImg.src = maskData;
    }
  }, [maskData, maskContext, size.x, size.y]);

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
          opacity: 0.85
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
          zIndex: 2,
          cursor: 'crosshair'
        }}
        width={size.x}
        height={size.y}
        className="react-mask-editor-mask-canvas"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onWheel={handleWheel}
      />
      <canvas
        ref={cursorCanvas}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: size.x,
          height: size.y,
          zIndex: 3,
          pointerEvents: 'none' // Important: allows clicks to pass through
        }}
        width={size.x}
        height={size.y}
        className="react-mask-editor-cursor-canvas"
      />
    </div>
  </div>
}

MaskEditor.displayName = 'MaskEditor'; 