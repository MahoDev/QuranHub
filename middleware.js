import { NextResponse } from "next/server";

export default async function middleware(req) {
	const userAgent = req.headers.get("user-agent") || "";

	// Expanded list of crawler user-agents
	const isCrawler =
		/googlebot|bingbot|yahoo|baiduspider|duckduckbot|slurp|facebookexternalhit|twitterbot|linkedinbot|applebot|mj12bot|ahrefsbot|semrushbot|prerender/i.test(
			userAgent
		);

	const url = `https://${req.headers.get("host")}${req.url}`;

	if (isCrawler) {
		const prerenderUrl = `https://service.prerender.io/${url}`;
		const response = await fetch(prerenderUrl, {
			headers: { "X-Prerender-Token": process.env.PRERENDER_TOKEN },
		});
		const html = await response.text();
		return new NextResponse(html, {
			status: 200,
			headers: { "Content-Type": "text/html" },
		});
	}

	// Non-crawlers proceed to index.html
	return NextResponse.next();
}

export const config = {
	matcher: "/(.*)", // Apply to all routes
};
