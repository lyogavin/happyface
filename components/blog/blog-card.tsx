import { Post } from "@/lib/blog";
import { formatDate } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

export default function BlogCard({
  data,
  priority,
}: {
  data: Post;
  priority?: boolean;
}) {
  return (
    <Link href={`/blog/${data.slug}`} className="block">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4 border hover:shadow-sm transition-shadow duration-200">
        {data.image && (
          <Image
            className="rounded-t-lg object-cover border"
            src={data.image}
            width={600}
            height={315}
            alt={data.title}
            priority={priority}
            layout="responsive"
          />
        )}
        {!data.image && <div className="bg-gray-200 dark:bg-gray-700 h-[180px] mb-4 rounded" />}
        <p className="mb-2">
          <time
            dateTime={data.publishedAt}
            className="text-sm text-muted-foreground"
          >
            {formatDate(data.publishedAt)}
          </time>
        </p>
        <h3 className="text-xl font-semibold mb-2">{data.title}</h3>
        <p className="text-foreground mb-4">{data.summary}</p>
      </div>
    </Link>
  );
}
