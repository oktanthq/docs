// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

export default defineConfig({
  site: "https://docs.oktant.tech",
  integrations: [
    starlight({
      title: "Oktant Docs",
      description: "Documentation for Oktant: Build. Deploy. Observe.",
      logo: {
        light: "./src/assets/oktant-mark.png",
        dark: "./src/assets/oktant-mark-white.png",
        alt: "Oktant",
      },
      favicon: "/favicon.png",
      customCss: ["./src/styles/oktant.css"],
      social: [{ icon: "github", label: "GitHub", href: "https://github.com/oktanthq" }],
      sidebar: [
        {
          label: "Start here",
          items: [{ label: "Introduction", slug: "index" }],
        },
      ],
    }),
  ],
});
