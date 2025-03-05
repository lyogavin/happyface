import Image from 'next/image'
import { generateImageList, ImageData } from '@/lib/blog'


export function ImageFeed({ path }: { path: string }) {
  const images: ImageData[] = generateImageList(path)
  console.log(images)
  return (
    <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
      {images.map((image) => (
        <div key={image.id} className="relative mb-4 break-inside-avoid">
          <Image
            src={image.src}
            alt={image.alt}
            width={image.width || 200}
            height={image.height || 200}
            className="w-full rounded-lg"
          />
          <div className="absolute inset-x-0 bottom-0 bg-black bg-opacity-50 p-2 rounded-b-lg">
            <h4 className="text-white text-sm font-semibold truncate">
              {image.title}
            </h4>
          </div>
        </div>
      ))}
    </div>
  )
}

