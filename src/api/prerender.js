export default async function handler(req) {
	const userAgent = req.headers.get("user-agent") || "";
	const isCrawler = /googlebot|bingbot|prerender/i.test(userAgent);
	const url = `https://${req.headers.get("host")}${req.url}`;

	if (isCrawler) {
		const prerenderUrl = `https://service.prerender.io/${url}`;
		const response = await fetch(prerenderUrl, {
			headers: { "X-Prerender-Token": process.env.PRERENDER_TOKEN },
		});
		const html = await response.text();
		return new Response(html, {
			status: 200,
			headers: { "Content-Type": "text/html" },
		});
	}

	const spaResponse = await fetch(`https://${req.headers.get("host")}/`);
	return new Response(await spaResponse.text(), {
		status: 200,
		headers: { "Content-Type": "text/html" },
	});
}

export const config = { runtime: "edge" };
