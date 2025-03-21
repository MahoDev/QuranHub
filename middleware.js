export default async function middleware(req) {
	const userAgent = req.headers.get("user-agent") || "";
	const isCrawler =
		/googlebot|bingbot|yahoo|baiduspider|duckduckbot|slurp|facebookexternalhit|twitterbot|linkedinbot|applebot|mj12bot|ahrefsbot|semrushbot|prerender/i.test(
			userAgent
		);

	// Extract the pathname from the request URL
	const path = new URL(req.url, `https://${req.headers.get("host")}`).pathname;

	// Explicitly bypass static files (robots.txt and sitemap.xml)
	if (path === "/robots.txt" || path === "/sitemap.xml") {
		return null; // Let Vercel serve the static file directly from public/
	}

	if (isCrawler) {
		try {
			const url = `https://${req.headers.get("host")}${path}`;
			const prerenderUrl = `https://service.prerender.io/${url}`;

			console.log("Fetching prerendered URL:", prerenderUrl);
			const response = await fetch(prerenderUrl, {
				headers: {
					"X-Prerender-Token":
						process.env.PRERENDER_TOKEN || "WqwUCX5fXuPHUznwpwTE",
				},
			});
			console.log("Prerender.io response status:", response.status);

			if (!response.ok) {
				console.error(
					"Prerender.io failed:",
					response.status,
					response.statusText
				);
				return new Response("Failed to fetch prerendered content", {
					status: 500,
					headers: { "Content-Type": "text/plain" },
				});
			}

			const html = await response.text();
			console.log("Prerendered HTML length:", html.length);

			if (!html || html.length === 0) {
				console.error("Empty prerendered HTML");
				return new Response("Empty prerendered content", {
					status: 500,
					headers: { "Content-Type": "text/plain" },
				});
			}

			return new Response(html, {
				status: 200,
				headers: { "Content-Type": "text/html" },
			});
		} catch (error) {
			console.error("Error in middleware:", error.message);
			return new Response("Middleware error: " + error.message, {
				status: 500,
				headers: { "Content-Type": "text/plain" },
			});
		}
	}

	return null; // Non-crawlers proceed to index.html
}

export const config = {
	matcher: "/(.*)",
};
