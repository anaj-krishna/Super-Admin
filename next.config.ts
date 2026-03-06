import type { NextConfig } from "next";

import path from "path";

const nextConfig: NextConfig = {
	turbopack: {
		// Avoid Next.js picking a parent directory as the root when multiple lockfiles exist.
		// This ensures Tailwind/PostCSS resolves from this app's node_modules.
		root: path.resolve(__dirname),
	},
};

export default nextConfig;
