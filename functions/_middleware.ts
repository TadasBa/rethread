/* Adds SEO-safe response headers around static Pages assets and Functions. */

type MiddlewareContext = {
  request: Request;
  next: () => Promise<Response>;
};

const PRODUCTION_HOSTS = new Set(["rethread.lt", "www.rethread.lt"]);

export const onRequest = async (context: MiddlewareContext): Promise<Response> => {
  const response = await context.next();
  const url = new URL(context.request.url);
  const shouldNoindex = !PRODUCTION_HOSTS.has(url.hostname) || url.pathname.startsWith("/api/");

  if (!shouldNoindex) return response;

  const headers = new Headers(response.headers);
  headers.set("X-Robots-Tag", "noindex, nofollow");
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
};
