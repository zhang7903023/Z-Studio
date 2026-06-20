import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Z-Studio",
    short_name: "Z-Studio",
    description: "Z-Studio 全球数字资源服务平台",
    start_url: "/",
    display: "standalone",
    background_color: "#050816",
    theme_color: "#050816",
    icons: []
  };
}
