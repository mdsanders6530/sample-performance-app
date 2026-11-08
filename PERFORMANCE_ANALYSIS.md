# Performance Improvements Analysis

The sample is intentionally small, so impact estimates are qualitative. The first two items affect active request paths; the rest are opportunities to apply if the workload grows or the currently unused helpers become necessary.

| # | Opportunity | Potential improvement | Impact | Effort |
|---|---|---|---|---|
| 1 | `fibonacci(35)` recomputes the same subproblems exponentially on every `/fib` request. | Memoize results so each value is computed once: O(2^n) to O(n) per cold run, then constant-time for cached inputs. | High | Low |
| 2 | `getOrdersWithUsers` scans all users for every order. | Build a `Map` keyed by user ID once: O(orders × users) to O(orders + users). | High | Low |
| 3 | The app synchronously reads `config.json` during startup, but never uses the value. | Remove the unused read and its imports, avoiding needless blocking startup I/O. | Medium | Low |
| 4 | `/users` rebuilds and serializes the same static response for every request. | Precompute the serialized response once if the mock data remains static. | Medium | Low |
| 5 | `/orders` repeats the join and serialization for unchanged mock data on every request. | Precompute the joined response once if the data remains static. | Medium | Medium |
| 6 | `requestCount` is incremented for every request but never read. | Remove the write-only counter to avoid needless work on the hot path. | Low | Low |
| 7 | `formatData` serializes, parses, and serializes the same value, creating avoidable allocations if called. | Remove the unused helper or serialize the original value once. | Low | Low |
| 8 | `hasUserId` uses `Array.includes`, which is still O(n) for a lookup. | If the same ID collection is queried repeatedly, build and reuse a `Set`; keep `includes` for one-off lookups. | Medium when reused | Low |
| 9 | `buildQueryString` repeatedly appends strings and is currently unused. | For large parameter sets, benchmark building entries and joining once; use `URLSearchParams` when URL encoding is required. | Low / workload-dependent | Low |
| 10 | `copyUser` copies every enumerable property and is currently unused. | Avoid cloning when callers only need selected fields; benchmark before changing a required full shallow copy. | Low / workload-dependent | Low |

## Selected improvement: memoize Fibonacci results

This is the best impact-to-effort change on an active request path: the current naive recursion repeats an exponential number of calculations for the fixed `/fib` input of 35. A small cache reduces the first calculation to linear work and reuses the result on subsequent requests. The change preserves the existing base-case behavior.

`Array.includes()` remains O(n); replacing a manual loop with it is a readability improvement, not an O(1) lookup. Use a reusable `Set` only when the same collection is queried repeatedly.
