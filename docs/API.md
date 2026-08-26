# API Reference — Arisa Nutrition Backend

Base URL: `http://localhost:3000` (dev) / `https://yourdomain.com` (prod)

All responses follow this envelope:

**Success**
```json
{ "success": true, "message": "...", "data": {} }
```

**Error**
```json
{ "success": false, "message": "...", "errors": [] }
```

---

## Authentication

### POST /api/auth/login

Login with admin credentials.

**Request Body**
```json
{
  "email": "admin@arisanutrition.com",
  "password": "YourSecurePassword123!"cd "g:\Arisa Nutrition Backend"
node -e "const b=require('bcryptjs');b.hash('YourPassword123!',12).then(console.log)"
}
```

**Response 200**
```json
{
  "success": true,
  "message": "Login successful",
  "data": { "id": "66f...", "email": "admin@arisanutrition.com" }
}
```
Sets `auth_token` HTTP-Only cookie (7 days).

**Errors**: 400 (validation), 401 (wrong credentials), 429 (rate limit)

---

### POST /api/auth/logout

Clears the `auth_token` cookie.

**Response 200**
```json
{ "success": true, "message": "Logged out successfully", "data": null }
```

---

### GET /api/auth/me

Returns the currently authenticated admin. Requires cookie.

**Response 200**
```json
{
  "success": true,
  "message": "Admin profile retrieved",
  "data": { "id": "66f...", "email": "admin@...", "createdAt": "..." }
}
```

**Errors**: 401

---

## Blogs

### GET /api/blogs

Returns all **published** blogs. Supports pagination, search, and category filter.

**Query Params**
| Param | Type | Default | Description |
|---|---|---|---|
| page | number | 1 | Page number |
| limit | number | 10 | Items per page (max 50) |
| category | string | — | Filter by category (case-insensitive) |
| search | string | — | Full-text search across title, excerpt, content |

**Response 200**
```json
{
  "success": true,
  "message": "Blogs retrieved successfully",
  "data": {
    "blogs": [ { "_id": "...", "title": "...", "slug": "...", "excerpt": "...", "thumbnail": "...", "category": "...", "author": "...", "published": true, "createdAt": "..." } ],
    "pagination": { "page": 1, "limit": 10, "total": 42, "totalPages": 5, "hasNextPage": true, "hasPrevPage": false }
  }
}
```

---

### GET /api/blogs/:id

Returns a single blog. `:id` can be a **MongoDB ObjectId** or the blog's **slug**.

**Response 200**
```json
{
  "success": true,
  "message": "Blog retrieved successfully",
  "data": { "_id": "...", "title": "...", "slug": "...", "content": "...", ... }
}
```

**Errors**: 404

---

### POST /api/blogs 🔒

Creates a new blog. Slug is auto-generated from the title.

**Request Body**
```json
{
  "title": "5 Tips for Healthy Eating",
  "excerpt": "Discover evidence-based tips...",
  "content": "Full markdown or HTML content here...",
  "thumbnail": "https://res.cloudinary.com/...",
  "category": "Nutrition",
  "author": "Dr. Arisa",
  "published": true
}
```

**Response 201** — returns the created blog document.

**Errors**: 400 (validation), 401, 409 (duplicate title)

---

### PUT /api/blogs/:id 🔒

Updates a blog by its MongoDB ObjectId. All fields are optional.
If `title` is updated, the slug is regenerated automatically.

**Response 200** — returns the updated blog document.

---

### DELETE /api/blogs/:id 🔒

Deletes a blog permanently.

**Response 200**
```json
{ "success": true, "message": "Blog deleted successfully", "data": null }
```

---

## Reviews

### GET /api/reviews

Returns all **approved** reviews, sorted newest first.

**Response 200**
```json
{
  "success": true,
  "message": "Reviews retrieved successfully",
  "data": [ { "_id": "...", "clientName": "Jane D.", "review": "...", "rating": 5, "city": "Mumbai", "approved": true, ... } ]
}
```

---

### POST /api/reviews 🔒

Creates a new review. New reviews are unapproved by default.

**Request Body**
```json
{
  "clientName": "Jane Doe",
  "review": "Lost 10 kg in 3 months!",
  "rating": 5,
  "image": "https://...",
  "weightLost": "10 kg",
  "city": "Mumbai"
}
```

**Response 201** — returns the created review document.

---

### PUT /api/reviews/:id 🔒

Updates a review. Use `{ "approved": true }` to approve a review.

**Response 200** — returns updated review.

---

### DELETE /api/reviews/:id 🔒

Deletes a review permanently.

---

## Gallery

### GET /api/gallery

Returns all gallery items. Optionally filter by type.

**Query Params**
| Param | Values | Description |
|---|---|---|
| type | `before` \| `after` \| `general` | Filter by type |

---

### POST /api/gallery 🔒

**Request Body**
```json
{
  "image": "https://res.cloudinary.com/...",
  "caption": "Client transformation — 3 months",
  "type": "after"
}
```

**Response 201**

---

### PUT /api/gallery/:id 🔒

Updates caption, image URL, or type. All fields optional.

---

### DELETE /api/gallery/:id 🔒

Deletes a gallery item.

---

## Gallery Categories

Reusable gallery category system with visibility control. Categories group images
(e.g. Achievements, Events, Awards). Disabled categories remain fully manageable
by admins but are excluded from public listings.

### GET /api/gallery/categories

Lists categories with image counts. Public callers receive **active categories only**;
authenticated admins receive all. Slug is auto-generated and unique; duplicate
names are rejected (case-insensitive).

**Query Params**
| Param | Values | Description |
|---|---|---|
| is_active | `true` \| `false` | Filter by status (admin only — ignored for public callers who always get active) |

**Response 200**
```json
{
  "success": true,
  "message": "Gallery categories retrieved successfully",
  "data": [
    {
      "_id": "...",
      "name": "Achievements",
      "slug": "achievements",
      "isActive": true,
      "imageCount": 12,
      "createdAt": "...",
      "updatedAt": "..."
    }
  ]
}
```

### POST /api/gallery/categories 🔒

**Request Body**
```json
{
  "name": "Achievements",
  "is_active": true
}
```
`isActive` (camelCase) is also accepted. Status defaults to enabled.

**Errors**: `409` duplicate name/slug · `400` validation failure

---

### GET /api/gallery/categories/:id

Returns a single category with `imageCount`. Add `?include_images=true` to embed
the full image list. Disabled categories are returned so admins can manage them.

---

### PUT /api/gallery/categories/:id 🔒

Updates name and/or status. Renaming regenerates the slug automatically while
preserving uniqueness (suffix `-2`, `-3`, … on collision).

```json
{ "name": "Student Activities", "isActive": false }
```

---

### PATCH /api/gallery/categories/:id/status 🔒

Enables or disables a category. Images are preserved when disabled.

```json
{ "is_active": false }
```

---

### DELETE /api/gallery/categories/:id 🔒

Deletes the category, all of its image records, and their Cloudinary assets
(cascade delete).

**Response**
```json
{ "success": true, "data": { "deletedImages": 12 } }
```

---

### GET /api/gallery/categories/:id/images

Lists all images in a category, newest first.

---

### POST /api/gallery/categories/:id/images 🔒

Uploads one or more images to a category. Files go to Cloudinary under
`arisa-nutrition/gallery/<category-slug>` and records are stored in `gallery_images`.

Each image can carry an optional `title` (≤150 chars) and `description`
(≤1000 chars).

**Request**: `multipart/form-data`
| Field | Description |
|---|---|
| images | One or more image files (multiple upload) |
| image | Single image file (alternative field name) |
| metadata | Optional JSON array aligned with file order: `[{"title": "...", "description": "..."}]` |
| title | Optional — applied to all uploaded files when `metadata` is absent |
| description | Optional — applied to all uploaded files when `metadata` is absent |

Constraints: JPEG/PNG/WEBP/GIF, max 5 MB each, max 20 files per request.
Metadata is optional; uploads without any text fields behave as before.

**Response 201**: array of created image records (`_id`, `categoryId`, `imageUrl`, `publicId`, `title`, `description`, `createdAt`)

---

### GET /api/gallery/images

Lists all images that are **not** assigned to any category, newest first.

---

### POST /api/gallery/images 🔒

Uploads one or more images **without a category**. Same multipart contract as
the per-category upload (`images`/`image` files, optional `metadata` array or
shared `title`/`description`). Files go to Cloudinary under
`arisa-nutrition/gallery/uncategorized`.

**Response 201**: array of created image records with `categoryId: null`.

---

### PATCH /api/gallery/images/:id 🔒

Updates an image's title and/or description after upload.

```json
{ "title": "Award Ceremony", "description": "Best college award 2026" }
```

At least one field must be provided. Image URL and category cannot be changed.

---

### DELETE /api/gallery/images/:id 🔒

Deletes a single image record and its Cloudinary asset.

---

## Contact

### POST /api/contact

Submits a contact form. Sends an email notification to the admin (non-blocking).

**Request Body**
```json
{
  "name": "Priya Sharma",
  "email": "priya@example.com",
  "phone": "+91 98765 43210",
  "goal": "Weight loss — 15 kg in 6 months",
  "message": "I would like to book a consultation..."
}
```

**Response 201**
```json
{ "success": true, "message": "Thank you! We will get back to you shortly.", "data": { "id": "..." } }
```

**Errors**: 400 (validation)

---

### GET /api/contact 🔒

Returns all contact submissions with pagination.

**Query Params**
| Param | Values | Description |
|---|---|---|
| status | `new` \| `contacted` \| `closed` | Filter by status |
| page | number | Page number |
| limit | number | Items per page (max 100) |

---

### PATCH /api/contact/:id 🔒

Updates the contact status.

**Request Body**
```json
{ "status": "contacted" }
```

---

### DELETE /api/contact/:id 🔒

Deletes a contact submission.

---

## Upload

### POST /api/upload 🔒

Uploads an image to Cloudinary. Send as `multipart/form-data`.

**Form Field**: `image` (file)

**Limits**: 5 MB max, JPEG / PNG / WEBP / GIF only.

**Response 201**
```json
{
  "success": true,
  "message": "Image uploaded successfully",
  "data": {
    "imageUrl": "https://res.cloudinary.com/your-cloud/image/upload/v.../arisa-nutrition/abc123.jpg",
    "publicId": "arisa-nutrition/abc123"
  }
}
```

---

## Dashboard

### GET /api/dashboard 🔒

Returns aggregated stats and latest activity.

**Response 200**
```json
{
  "success": true,
  "message": "Dashboard data retrieved successfully",
  "data": {
    "stats": {
      "totalBlogs": 24,
      "totalReviews": 58,
      "totalGallery": 30,
      "totalContacts": 112,
      "newContacts": 7
    },
    "latestContacts": [ { "_id": "...", "name": "...", "email": "...", "status": "new", ... } ],
    "latestBlogs": [ { "_id": "...", "title": "...", "slug": "...", "published": true, ... } ]
  }
}
```

---

> 🔒 = Requires valid `auth_token` cookie (login first via `POST /api/auth/login`)
