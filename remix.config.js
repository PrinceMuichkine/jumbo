/** @type {import('@remix-run/dev').AppConfig} */
export default {
  // General settings
  ignoredRouteFiles: ["**/.*"],
  appDirectory: "app",
  assetsBuildDirectory: "public/build",
  publicPath: "/build/",

  // We are using Vite, so we don't need these
  postcss: false,
  tailwind: false,

  // Vercel will handle these aspects
  serverMinify: true,
  serverModuleFormat: "esm",

  // The following options are not needed with Vercel
  // serverBuildPath and server are automatically handled
};
