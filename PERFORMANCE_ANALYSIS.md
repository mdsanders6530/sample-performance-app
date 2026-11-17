# Performance improvement opportunities

These candidates are based on the current code. The mock collections are tiny, so improvements to data-processing complexity matter when the app is scaled; helpers noted as unused do not affect current endpoint latency.

| # | Opportunity | Potential improvement | Impact / effort |
|---|-------------|-----------------------|-----------------|
| 1 | `fibonacci` recalculates both subproblems recursively on `/fib` | Use an iterative recurrence to reduce exponential work to O(n) time and O(1) space | **High / Low — selected** |
| 2 | `getOrdersWithUsers` scans all users for every order | Build a `Map` by user ID once, reducing O(orders × users) lookup work to O(orders + users) | High at scale / Low |
| 3 | `/users` rebuilds names from the same immutable mock data on every request | Precompute the names once if the user data remains static | Low for current fixture / Low |
| 4 | `/orders` repeats the same user join on every request | Precompute the joined fixture once if orders and users remain static | Low for current fixture / Low |
| 5 | `/users` and `/orders` serialize identical static payloads for every request | Cache serialized response bytes while the source data is immutable; invalidate on updates | Low for current fixture / Low |
| 6 | `config.json` is read synchronously during startup | Load it asynchronously before listening if the configuration grows or startup responsiveness matters | Startup-only / Medium |
| 7 | `formatData` serializes, parses, and serializes the same value | Remove the redundant round trip if this currently unused helper is put on a hot path | None today / Low |
| 8 | `buildQueryString` repeatedly concatenates strings and does not encode values | Build encoded parameters with `URLSearchParams` if this currently unused helper is needed | None today / Low |
| 9 | `copyUser` manually copies every enumerable property | Avoid the copy when callers do not mutate the user, or use an explicit shallow-copy operation when they do | None today / Low |
| 10 | `requestCount` is incremented but never read | Remove the unused counter if request metrics are not planned | Negligible / Low |

## Selected improvement: iterative Fibonacci

The `/fib` endpoint always computes `fibonacci(35)`. The original recursive implementation performs exponential repeated work; the iterative implementation computes each value once, taking O(n) time and O(1) auxiliary space. This is a small, isolated change that preserves the endpoint result while directly reducing its CPU cost.
