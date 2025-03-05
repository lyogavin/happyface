import Image from 'next/image'
import { ImageData } from '@/lib/blog'


export function ImageFeed({ list }: { list: string }) {
  // split the list by commas
  const images: ImageData[] = list.split(',').map((image) => ({
    id: image,
    src: image,
    alt: image.split("/").pop()?.split(".")[0] || "",
    width: 400,
    height: 400,
    title: image.split("/").pop()?.split(".")[0] || "",
  }))
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

