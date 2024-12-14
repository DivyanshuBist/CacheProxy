import { parseArgs } from "jsr:@std/cli/parse-args";

const flag = parseArgs(Deno.args, {
  string: ["port", "origin"],
  boolean: ["clear-cache"],
});

const PORT = flag.port == undefined ? 8000 : Number(flag.port);
if (isNaN(PORT) || PORT < 1 || PORT > 65535) {
  throw new Error("Invalid port number");
}

const ORIGIN = flag.origin
  ? new URL(flag.origin).href
  : "https://dummyjson.com";

const cache = {};
initiateserver();

function initiateserver() {
  Deno.serve(
    { port: PORT, hostname: "127.0.0.1" },
    handlerequest,
  );
}

async function handlerequest(_req) {
  const url = new URL(_req.url);
  const path = url.pathname;
  const id = path.split("/")[1];
  if (id == "") {
    return new Response("Hi ");
  }
  if (id == "favicon.ico") {
    return new Response(null, { status: 204 });    
  } else {
    if (id in cache) {
      return new Response(JSON.stringify(cache[id]), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "X-Content-Type-Options": "nosniff",
          "X-Frame-Options": "DENY",
          "X-Cache": "HIT",
        },
      });
    } else {
      try {
        const response = await fetch(ORIGIN + "/" + id);
        const data = await response.json();
        cache[id] = data;
        console.log("missed proxy for " + ORIGIN + "/" + id);

        return new Response(JSON.stringify(data), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "X-Content-Type-Options": "nosniff",
            "X-Frame-Options": "DENY",
            "X-Cache": "MISS",
          },
        });
        //await createResponse(200, data, "MISS");
      } catch (error) {
        console.error("Error fetching data:", error);
        return new Response("Error fetching data", {
          status: 500,
        });
      }
    }
  }
}


