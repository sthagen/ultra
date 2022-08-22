import { QueryClientProvider } from "@tanstack/react-query";
import { serve } from "https://deno.land/std@0.152.0/http/server.ts";
import { createServer } from "ultra/server.ts";
import App from "./src/app.tsx";
import { useDehydrateReactQuery } from "./src/hooks/useDehydrateReactQuery.tsx";
import { queryClient } from "./src/query-client.ts";

const server = await createServer({
  importMapPath: import.meta.resolve("./importMap.json"),
  browserEntrypoint: import.meta.resolve("./client.tsx"),
});

function ServerApp() {
  useDehydrateReactQuery(queryClient);
  return (
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  );
}

server.get("*", async (context) => {
  /**
   * Example of prefetching a query.
   */
  await queryClient.prefetchQuery(["posts"], async () => {
    return (await fetch("https://jsonplaceholder.typicode.com/todos")).json();
  });

  /**
   * Render the request
   */
  const result = await server.render(<ServerApp />);

  return context.body(result, 200, {
    "content-type": "text/html",
  });
});

serve(server.fetch);
