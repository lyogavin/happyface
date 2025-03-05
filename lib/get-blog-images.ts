'use server'
import fs from "fs"
import path from "path"
import { v4 as uuidv4 } from 'uuid';

const priorityImageTitles = [
  "Infographic: Sports Economics",
  "Infographic: Global Sports Distribution",
  "Infographic: Health Benefits of Sports",
  "Infographic: Lifestyle Medicine Impact",
  "Infographic: Technology Through Time",
  "CPR Statistics Infographic",
  "Infographic: Evolution and Classification of Animals",
  "Infographic: The Evolution of Music Through History",
  "Infographic: Music Industry Statistics and Trends",
]

const manualPrependImages = [
  {
    id: uuidv4(),
    title: "Infographic: Dogs Breeds",
    src: "/example-generations/dogs-breeds.png",
  },
  {
    id: uuidv4(),
    title: "Infographic: Understanding Air Pollution",
    src: "/example-generations/understanding-air-pollution.png",
  },
  {
    id: uuidv4(),
    title: "Infographic: Influencer Marketing Dark Theme",
    src: "/example-generations/influencer-marketing-dar-theme.png",
  },
  {
    id: uuidv4(),
    title: "Infographic: Influencer Marketing",
    src: "/example-generations/influencer-marketing.png",
  },
  {
    id: uuidv4(),
    title: "Infographic: Air Pollution",
    src: "/example-generations/air-pollution.png",
  },
]
export interface MdxImageData {
  id: string;
  src: string;
  title: string;
}

function getMDXFiles(dir: string) {
  return fs.readdirSync(dir).filter((file) => path.extname(file) === ".mdx");
}

export async function getAllGeneratedInfographicImagesInPosts() {
  const dir = path.join(process.cwd(), "content");
  console.log("process.cwd():", process.cwd());
  const mdxFiles = getMDXFiles(dir);
  console.log('mdx files', mdxFiles)

  // define image as {title:string, url: string}
  let images: MdxImageData[] = [];

  // iter each file, call getGeneratedInfographicImageInMdxFile to get images for each file
  for (const file of mdxFiles) {
    const imagesInMdx = await extractImagesFromMdx(path.join(process.cwd(), "content", file));
    if (imagesInMdx) {
      //merge imagesInMdx to images
      images = images.concat(imagesInMdx);
    }
  }
  // sort with priorityImageTitles  
  const sortedImages = images.sort((a, b) => {
    const indexA = priorityImageTitles.indexOf(a.title);
    const indexB = priorityImageTitles.indexOf(b.title);

    // if both are in priorityImageTitles, sort by their order in priorityImageTitles
    if (indexA !== -1 && indexB !== -1) {
      return indexA - indexB;
    }
    // if only a is in priorityImageTitles, it should come first
    if (indexA !== -1) {
      return -1;
    }
    // if only b is in priorityImageTitles, it should come first
    if (indexB !== -1) {
      return 1;
    }
    // if neither is in priorityImageTitles, maintain their original order
    return 0;
  });

  // prepend manualPrependImages to sortedImages
  const prependedImages = manualPrependImages.concat(sortedImages);

  return prependedImages;

}

// Function to extract images from an MDX file
async function extractImagesFromMdx(filePath: string): Promise<MdxImageData[]> {
  const images: MdxImageData[] = [];
  const content = fs.readFileSync(filePath, 'utf-8');
  const excludeImageTitles = [
    "Infographic: Global Sports Distribution",
    "Adobe Market Impact Infographic",
    "Infographic: AI Evolution and Fundamentals",
    "Infographic: Sports Technology Evolution",
    "Infographic: Economic Evolution",
    "Infographic: Human-Animal Relationship",
    "Infographic: Highest-Grossing Movies"
  ]


  // Updated regex pattern to handle double forward slashes in URLs
  const imagePattern = /!\[(.*?)\]\((https:\/\/.*?\.supabase\.co\/storage\/v1\/object\/public\/images\/\/generated-infographics\/.*?\.png)\)/g;
  let match;

  while ((match = imagePattern.exec(content)) !== null) {
    //console.log('match', match)
    const title = match[1]; // Title is now directly captured in the first group
    const src = match[2];   // URL is now in the second group
    const id = uuidv4();
    if (title && src && !excludeImageTitles.includes(title)) {
      images.push({ id, title, src });
    }
  }
  //console.log('all gened images from', filePath, images)

  return images;
}

// Example usage
// const images = await extractImagesFromMdx('path/to/your/file.mdx');
// console.log(images);


