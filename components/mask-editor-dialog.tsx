'use client'
import * as React from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { MaskEditor } from "@/components/react-mask-editor/maskEditor"
import { IconRefresh, IconInfoCircle, IconBrush } from "@tabler/icons-react"
import { MaskEditorRef } from "@/components/react-mask-editor/maskEditor"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import Image from "next/image"
import "./react-mask-editor/mask-editor.css"

interface MaskEditorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  imageUrl: string | null
  title: string
  onSave: (maskDataUrl: string) => void
  initialMask?: string
}

export function MaskEditorDialog({
  open,
  onOpenChange,
  imageUrl,
  title,
  onSave,
  initialMask,
}: MaskEditorDialogProps) {
  const [brushSize, setBrushSize] = React.useState(30)
  const maskCanvasRef = React.useRef<HTMLCanvasElement>(null)
  const maskEditorRef = React.useRef<MaskEditorRef>(null)

  const handleSave = async () => {
    if (maskEditorRef.current) {
      try {
        const imageWithAlpha = await maskEditorRef.current.saveToAlpha();
        if (imageWithAlpha) {
          onSave(imageWithAlpha);
          onOpenChange(false);
        } else {
          console.error("Failed to generate mask: empty result");
        }
      } catch (error) {
        console.error("Error saving mask:", error);
      }
    }
  }

  const handleReset = () => {
    if (maskEditorRef.current) {
      maskEditorRef.current.resetMask()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] w-[1200px] h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col gap-6">
          {/* Instructions Section */}
          <div className="bg-slate-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <IconInfoCircle className="h-4 w-4 text-slate-600" />
              <h3 className="font-medium">Instructions</h3>
            </div>
            <div className="flex items-start justify-between gap-4">
              <p className="text-sm text-slate-600">
                Paint over the areas where you want to remove clothes. Be as precise as possible for the best results.
                <br /><br />
                The white areas will remain unchanged, while the black areas will have clothes removed.
              </p>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="flex-shrink-0">
                    See Example
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px]">
                  <Image 
                    src="/mask-example.webp" 
                    alt="Masking example"
                    width={300}
                    height={300}
                    className="w-full rounded-md"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Controls Section */}
          <div className="bg-slate-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <IconBrush className="h-4 w-4 text-slate-600" />
              <h3 className="font-medium">Brush Size</h3>
            </div>
            <div className="flex items-center justify-between gap-6 max-w-[400px]">
              <div className="flex-1">
                <Slider
                  value={[brushSize]}
                  onValueChange={(value) => setBrushSize(value[0])}
                  min={1}
                  max={50}
                  step={1}
                  className="py-2"
                />
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={handleReset}
                title="Reset Mask"
                className="h-8 w-8 flex-shrink-0"
              >
                <IconRefresh className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Canvas Section */}
          {imageUrl ? (
            <div className="react-mask-editor-wrapper bg-slate-50 rounded-lg" style={{
              position: 'relative',
              width: '100%',
              maxWidth: '800px',
              height: 'calc(90vh - 470px)',
              margin: '0 auto',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <MaskEditor
                ref={maskEditorRef}
                src={imageUrl}
                cursorSize={brushSize}
                maskOpacity={0.85}
                onCursorSizeChange={setBrushSize}
                canvasRef={maskCanvasRef as React.MutableRefObject<HTMLCanvasElement>}
                maskColor="#000000"
                maskBlendMode="overlay"
                initialMask={initialMask}
              />
            </div>
          ) : (
            <div className="text-center text-slate-500">
              No image provided
            </div>
          )}
        </div>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Mask</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 