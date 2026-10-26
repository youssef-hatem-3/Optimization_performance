# Local Spring Boot API contract

This frontend currently reads data from [DummyJSON](https://dummyjson.com). It does **not** send any mutations to the API: marking notifications as read is React state only.

To run the UI against a local Spring Boot service without changing its data-mapping code, implement the four compatibility endpoints in this document. They deliberately use the DummyJSON-shaped responses that `src/lib/api/index.ts` expects.

## Quick start

Use Java 21 (or another supported LTS JDK) and Spring Boot 3.x. Create a project with these dependencies:

- Spring Web
- Validation (optional but recommended)
- Spring Data JPA and an in-memory H2 database, or a database of your choice
- Lombok (optional)

Run the API on port `8080`:

```yaml
# src/main/resources/application.yml
server:
  port: 8080

spring:
  datasource:
    url: jdbc:h2:mem:performance_lab;MODE=PostgreSQL;DB_CLOSE_DELAY=-1
    driver-class-name: org.h2.Driver
    username: sa
    password:
  jpa:
    hibernate:
      ddl-auto: create-drop
    open-in-view: false
```

The Vite app normally runs at `http://localhost:5173`, so enable CORS. For a small local controller this is enough:

```java
@CrossOrigin(origins = "http://localhost:5173")
@RestController
class CatalogController {
  // endpoints
}
```

Or register a global `WebMvcConfigurer` that allows `GET` requests from that origin. Do not use `*` for a deployed application with credentials or authentication.

## Connect the frontend

`src/lib/api/index.ts` currently hard-codes this base URL:

```ts
baseURL: "https://dummyjson.com"
```

For local development, change it to:

```ts
baseURL: "http://localhost:8080"
```

The rest of the frontend can remain unchanged when the endpoints below are implemented. A later improvement is to read `import.meta.env.VITE_API_BASE_URL` and keep the URL in `.env.local`; that avoids changing source code per environment.

## Shared collection envelope

Every endpoint returns its resource array plus these pagination fields. The frontend reads `total` for products; the other fields must still be present to remain compatible with its TypeScript contract.

```ts
type CollectionResponse<T, Key extends string> = Record<Key, T[]> & {
  total: number; // Total matching records before pagination
  skip: number;  // Zero-based offset used for this response
  limit: number; // Number of returned records
};
```

For Java, one simple response type is:

```java
public record CollectionResponse<T>(
    List<T> items,
    long total,
    int skip,
    int limit
) {}
```

That generic record alone serializes the array as `items`, which is **not compatible**. Return resource-specific DTOs (shown below), or add `@JsonProperty("users")`, `@JsonProperty("products")`, and so on to the list field.

## Endpoint summary

| Frontend function | Requests made | Local endpoint(s) |
| --- | --- | --- |
| `getUsers` | one request | `GET /users` |
| `getProducts` | one request | `GET /products` |
| `getOrders` | two parallel requests | `GET /carts` and `GET /users` |
| `getNotifications` | one request | `GET /posts` |

All four are `GET` requests. There is no login, authorization header, POST, PUT, PATCH, or DELETE request in the current frontend.

## `GET /users`

### Query parameters used by the frontend

```text
GET /users?limit=0&select=id,firstName,lastName,email,age,role,address
```

The orders page also sends:

```text
GET /users?limit=0&select=id,firstName,lastName
```

`select` is only a field-selection hint from DummyJSON. The frontend will work if the server ignores it and sends all fields. For `limit=0`, return all matching users, matching DummyJSON behavior.

### Response DTO and example

```java
public record AddressDto(String country) {}

public record UserApiDto(
    long id,
    String firstName,
    String lastName,
    String email,
    int age,
    Role role,
    AddressDto address
) {}

public enum Role { admin, moderator, user }

public record UsersResponse(
    List<UserApiDto> users,
    long total,
    int skip,
    int limit
) {}
```

```json
{
  "users": [
    {
      "id": 1,
      "firstName": "Ava",
      "lastName": "Stone",
      "email": "ava.stone@example.test",
      "age": 31,
      "role": "admin",
      "address": { "country": "Egypt" }
    }
  ],
  "total": 1,
  "skip": 0,
  "limit": 1
}
```

### Frontend mapping

The API response is converted before UI rendering:

| API field | Frontend `User` field | Rule |
| --- | --- | --- |
| `id` | `id` | number |
| `firstName` + `lastName` | `name` | joined with one space |
| `email` | `email` | string |
| `age` | `age` | number |
| `address.country` | `country` | string |
| `role` | `status` | `admin → active`, `moderator → pending`, `user → inactive` |

For the performance exercise, seed at least 5,000 users if you want a large list to profile.

## `GET /products`

### Query parameters used by the frontend

```text
GET /products?limit=12&skip=0&sortBy=price&order=asc&select=id,title,thumbnail,category,price,stock,rating
```

The dashboard requests one record with `limit=1`, `skip=0`, `sortBy=price`, and `order=asc`. The products page requests 12 records at a time. `skip = page * limit`, so it is zero-based.

Support these parameter values:

| Parameter | Type | Required behavior |
| --- | --- | --- |
| `limit` | integer | number of records to return; `0` may mean all |
| `skip` | integer | zero-based offset, default `0` |
| `sortBy` | `price` or `rating` | sort before paginating |
| `order` | `asc` or `desc` | sort direction |
| `select` | comma-separated text | optional; it may safely be ignored |

Sorting before pagination matters: the UI only sees the page returned by the API.

### Response DTO and example

```java
public record ProductApiDto(
    long id,
    String title,
    String thumbnail,
    String category,
    BigDecimal price,
    int stock,
    BigDecimal rating
) {}

public record ProductsResponse(
    List<ProductApiDto> products,
    long total,
    int skip,
    int limit
) {}
```

```json
{
  "products": [
    {
      "id": 10,
      "title": "Desk Lamp",
      "thumbnail": "https://example.test/images/desk-lamp.jpg",
      "category": "Office",
      "price": 24.99,
      "stock": 18,
      "rating": 4.5
    }
  ],
  "total": 1000,
  "skip": 0,
  "limit": 12
}
```

### Frontend mapping

| API field | Frontend `Product` field |
| --- | --- |
| `id` | `id` |
| `title` | `name` |
| `thumbnail` | `imageUrl` |
| `category` | `category` |
| `price` | `price` |
| `stock` | `quantity` |
| `rating` | `rating` |

`thumbnail` must be a usable image URL. For a completely local setup, serve images from Spring Boot static resources and return URLs such as `http://localhost:8080/images/desk-lamp.jpg`.

## `GET /carts`

Orders are not an API resource in the current frontend. `getOrders()` derives one displayed order per cart product by combining this response with `/users`.

### Request

```text
GET /carts?limit=0
```

### Response DTO and example

```java
public record CartProductApiDto(
    long id,
    String title,
    BigDecimal price,
    int quantity
) {}

public record CartApiDto(
    long id,
    long userId,
    List<CartProductApiDto> products
) {}

public record CartsResponse(
    List<CartApiDto> carts,
    long total,
    int skip,
    int limit
) {}
```

```json
{
  "carts": [
    {
      "id": 7,
      "userId": 1,
      "products": [
        { "id": 10, "title": "Desk Lamp", "price": 24.99, "quantity": 2 }
      ]
    }
  ],
  "total": 1,
  "skip": 0,
  "limit": 1
}
```

### Derived `Order` rules

For each `cart.products[index]`, the frontend creates:

```ts
{
  id: `CART-${cart.id}-${product.id}`,
  customer: matchingUserName ?? `Customer #${cart.userId}`,
  product: product.title,
  price: product.price * product.quantity,
  status: ["paid", "processing", "shipped", "cancelled"][(cart.id + index) % 4],
  createdAt: new Date(Date.UTC(2025, cart.id % 12, (index % 28) + 1)).toISOString(),
}
```

So every `userId` should reference a `/users` record. Cart IDs and product IDs must be numeric because the frontend uses arithmetic on the cart ID to create a display status and date.

## `GET /posts`

Notifications are generated from posts. The frontend requests all posts but only uses the first 20.

### Request

```text
GET /posts?limit=0&select=id,title,body,userId
```

### Response DTO and example

```java
public record PostApiDto(long id, String title, String body, long userId) {}

public record PostsResponse(
    List<PostApiDto> posts,
    long total,
    int skip,
    int limit
) {}
```

```json
{
  "posts": [
    {
      "id": 1,
      "title": "Inventory changed",
      "body": "Desk Lamp stock is now 18.",
      "userId": 1
    }
  ],
  "total": 1,
  "skip": 0,
  "limit": 1
}
```

### Frontend mapping

| API field | Frontend `Notification` field | Rule |
| --- | --- | --- |
| `id` | `id` | number |
| `title` | `title` | string |
| `body` | `message` | string |
| array index | `read` | read when `index % 3 === 0` |
| `userId`, array index | `createdAt` | frontend synthesizes an ISO date in 2025 |

The server does not need to store `read` or `createdAt` for the existing UI, since those values are created by `getNotifications()`.

## Frontend domain types

These are the types after `src/lib/api/index.ts` maps API responses. They are useful if you later simplify the client and expose your own API instead of preserving DummyJSON compatibility.

```ts
type Status = "active" | "inactive" | "pending";

interface User {
  id: number;
  name: string;
  email: string;
  age: number;
  status: Status;
  country: string;
}

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  quantity: number;
  rating: number;
  imageUrl: string;
}

interface Order {
  id: string;
  customer: string;
  product: string;
  price: number;
  status: "paid" | "processing" | "shipped" | "cancelled";
  createdAt: string; // ISO-8601 instant
}

interface Notification {
  id: number;
  title: string;
  message: string;
  read: boolean;
  createdAt: string; // ISO-8601 instant
}
```

## Suggested controller shape

Keep controllers thin and put pagination, sorting, and data access in services:

```java
@RestController
@RequestMapping
@CrossOrigin(origins = "http://localhost:5173")
class CompatibilityController {
  @GetMapping("/users")
  UsersResponse users(@RequestParam(defaultValue = "0") int limit,
                      @RequestParam(defaultValue = "0") int skip,
                      @RequestParam(required = false) String select) { /* ... */ }

  @GetMapping("/products")
  ProductsResponse products(@RequestParam(defaultValue = "12") int limit,
                            @RequestParam(defaultValue = "0") int skip,
                            @RequestParam(defaultValue = "price") String sortBy,
                            @RequestParam(defaultValue = "asc") String order,
                            @RequestParam(required = false) String select) { /* ... */ }

  @GetMapping("/carts")
  CartsResponse carts(@RequestParam(defaultValue = "0") int limit) { /* ... */ }

  @GetMapping("/posts")
  PostsResponse posts(@RequestParam(defaultValue = "0") int limit,
                      @RequestParam(required = false) String select) { /* ... */ }
}
```

Validate `limit` and `skip` as non-negative values. For products, reject unsupported `sortBy` / `order` values with `400 Bad Request` rather than interpolating them into a query. With JPA, map the two supported sort columns explicitly to a `Sort` object.

## Recommended seed data

- 5,000 users for the large-list performance exercise.
- 1,000 products, in several categories, with non-negative prices, stock, and ratings.
- Enough carts and cart lines to make the orders table meaningful; each cart must point to an existing user.
- At least 20 posts for the notifications screen.

The unused generator helpers in `src/lib/data/generators.ts` contain deterministic ideas for creating this volume of sample data. Do not expose that file to the browser as a database; seed equivalent records in the backend instead.

## Future native API option

For a production service, a clearer design would expose `/api/users`, `/api/products`, `/api/orders`, and `/api/notifications` directly in the frontend domain shapes above. That would eliminate the client-side transformations and the surprising carts-to-orders derivation. It requires updating `src/lib/api/index.ts`, so it is intentionally not required for the local compatible version documented here.
