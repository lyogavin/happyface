import React from "react";
import { constructMetadata } from "@/lib/metadata-util";
import { Blog } from "@/components/blog/blog";

export const metadata = constructMetadata({
  title: "Blog",
  description: `Turn your ComfyUI workflow into an API. Everything about ComfyUI workflow and ComfyUI cool models.`,
  robots: {
    index: false,
    follow: false,
  },
});

export default async function Page() {
  return <Blog />;
}
