import appConfig from "@/lib/app-config";
import fs from "fs";
import path from "path";
import rehypePrettyCode from "rehype-pretty-code";
import remarkGfm from "remark-gfm";
import { compile } from '@mdx-js/mdx'
import { transformerCopyButton } from '@rehype-pretty/transformers'

export interface ImageData {
  id: string
  src: string
  alt: string
  title: string
  width: number | null
  height: number | null
}

export function generateImageList(inputPath: string): ImageData[] {
  const directory = path.join(process.cwd(), inputPath)
  const files = fs.readdirSync(directory)
  
  return files
    .filter(file => /\.(jpg|jpeg|png|webp)$/i.test(file))
    .map((file, index) => ({
      id: String(index + 1),
      src: `${inputPath.replace(/^\/public/, '')}/${file}`,
      alt: `Generated Selfie ${index + 1}`,
      title: file.replace(/\.(jpg|jpeg|png|webp)$/i, ''),
      width: null,  // You might want to get actual dimensions
      height: null, // You might want to get actual dimensions
    }))
}



export type Post = {
  title: string;
  publishedAt: string;
  summary: string;
  author: string;
  slug: string;
  image?: string;
};

function parseFrontmatter(fileContent: string) {
  const frontmatterRegex = /---\s*([\s\S]*?)\s*---/;
  const match = frontmatterRegex.exec(fileContent);
  
  if (!match) {
    return { 
      data: {} as Post, 
      content: fileContent.trim() 
    };
  }
  
  const frontMatterBlock = match[1];
  const content = fileContent.replace(frontmatterRegex, "").trim();
  const frontMatterLines = frontMatterBlock.trim().split("\n");
  const metadata: Partial<Post> = {};

  frontMatterLines.forEach((line) => {
    const [key, ...valueArr] = line.split(": ");
    let value = valueArr.join(": ").trim();
    value = value.replace(/^['"](.*)['"]$/, "$1"); // Remove quotes
    metadata[key.trim() as keyof Post] = value;
  });

  return { data: metadata as Post, content };
}

function getMDXFiles(dir: string) {
  return fs.readdirSync(dir).filter((file) => path.extname(file) === ".mdx");
}

export async function markdownToHTML(markdown: string) {
  try {
    const compiled = await compile(markdown, {
      jsx: true,
      outputFormat: 'function-body',
      rehypePlugins: [
        [rehypePrettyCode, {
          transformers: [
            transformerCopyButton({
              visibility: 'always',
              feedbackDuration: 3_000,
            }),
          ],
          keepBackground: false,
        }],
      ],
      remarkPlugins: [remarkGfm],
    })
    
    return String(compiled)
  } catch (error) {
    console.error('MDX compilation error:', error)
    throw error
  }
}

export async function getPost(slug: string) {
  const filePath = path.join("content", `${slug}.mdx`);
  const source = fs.readFileSync(filePath, "utf-8");
  const { content: rawContent, data: metadata } = parseFrontmatter(source);
  const defaultImage = `${appConfig.url}/og?title=${encodeURIComponent(
    metadata.title
  )}`;
  return {
    source: rawContent,
    metadata: {
      ...metadata,
      image: metadata.image || defaultImage,
    },
    slug,
  };
}

async function getAllPosts(dir: string) {
  const mdxFiles = getMDXFiles(dir);
  return Promise.all(
    mdxFiles.map(async (file) => {
      const slug = path.basename(file, path.extname(file));
      const { metadata, source } = await getPost(slug);
      return {
        ...metadata,
        slug,
        source,
      };
    })
  );
}

export async function getBlogPosts() {
  console.log("process.cwd():", process.cwd());
  return getAllPosts(path.join(process.cwd(), "content"));
}


