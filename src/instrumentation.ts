import type { Instrumentation } from "next";

// Every error Next.js catches on the server (pages, route handlers, server actions, proxy) is saved for
// Admin -> Errors. Node.js only: the logger uses the Supabase service-role client.
export const onRequestError: Instrumentation.onRequestError = async (error, request, context) => {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { recordServerError } = await import("./lib/error-log");
  await recordServerError({
    error,
    path: request.path,
    method: request.method,
    routeType: context.routeType,
    routePath: context.routePath,
  });
};
