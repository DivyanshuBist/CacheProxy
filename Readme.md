# simple caching proxy in deno js

![cache.svg](./cache.svg)

## how to use
deno run main.ts --port <port> --origin <url>

- default port 3000
- default origin dummyjson

we can check cache hit/miss in response headers

![headers](./Headers.png)