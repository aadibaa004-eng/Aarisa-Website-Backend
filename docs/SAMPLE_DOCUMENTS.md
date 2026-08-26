# Sample MongoDB Documents

Use these to seed your database for local development or testing.

---

## admins

> ⚠️ Never insert a plain-text password. Always insert a pre-hashed bcrypt hash.
> Generate one with: `node -e "const b=require('bcryptjs');b.hash('YourPass123!',12).then(console.log)"`

```json
{
  "_id": { "$oid": "66f1a2b3c4d5e6f7a8b9c0d1" },
  "email": "admin@arisanutrition.com",
  "password": "$2b$12$exampleHashReplaceThisWithRealOne..........",
  "createdAt": { "$date": "2025-01-01T00:00:00.000Z" },
  "updatedAt": { "$date": "2025-01-01T00:00:00.000Z" }
}
```

---

## blogs

```json
{
  "_id": { "$oid": "66f1a2b3c4d5e6f7a8b9c0d2" },
  "title": "5 Science-Backed Tips for Sustainable Weight Loss",
  "slug": "5-science-backed-tips-for-sustainable-weight-loss",
  "excerpt": "Discover evidence-based strategies that dieticians recommend for losing weight without yo-yo dieting.",
  "content": "## Introduction\n\nSustainable weight loss is not about crash diets...",
  "thumbnail": "https://res.cloudinary.com/your-cloud/image/upload/v1/arisa-nutrition/blog1.jpg",
  "category": "Weight Loss",
  "author": "Dr. Arisa",
  "published": true,
  "createdAt": { "$date": "2025-06-01T10:00:00.000Z" },
  "updatedAt": { "$date": "2025-06-01T10:00:00.000Z" }
}
```

---

## reviews

```json
{
  "_id": { "$oid": "66f1a2b3c4d5e6f7a8b9c0d3" },
  "clientName": "Priya Sharma",
  "review": "I lost 12 kg in 4 months following Dr. Arisa's meal plan. Her approach is practical and never felt like a diet!",
  "rating": 5,
  "image": "https://res.cloudinary.com/your-cloud/image/upload/v1/arisa-nutrition/review1.jpg",
  "weightLost": "12 kg",
  "city": "Mumbai",
  "approved": true,
  "createdAt": { "$date": "2025-05-15T08:30:00.000Z" },
  "updatedAt": { "$date": "2025-05-15T08:30:00.000Z" }
}
```

---

## gallery

```json
{
  "_id": { "$oid": "66f1a2b3c4d5e6f7a8b9c0d4" },
  "image": "https://res.cloudinary.com/your-cloud/image/upload/v1/arisa-nutrition/gallery1.jpg",
  "caption": "Client transformation — 3 months of personalised nutrition coaching",
  "type": "after",
  "createdAt": { "$date": "2025-04-20T12:00:00.000Z" },
  "updatedAt": { "$date": "2025-04-20T12:00:00.000Z" }
}
```

---

## gallery_categories

```json
{
  "_id": { "$oid": "66f1a2b3c4d5e6f7a8b9c0e1" },
  "name": "Achievements",
  "slug": "achievements",
  "isActive": true,
  "createdAt": { "$date": "2025-07-01T09:00:00.000Z" },
  "updatedAt": { "$date": "2025-07-01T09:00:00.000Z" }
}
```

---

## gallery_images

```json
{
  "_id": { "$oid": "66f1a2b3c4d5e6f7a8b9c0e2" },
  "categoryId": { "$oid": "66f1a2b3c4d5e6f7a8b9c0e1" },
  "imageUrl": "https://res.cloudinary.com/your-cloud/image/upload/v1/arisa-nutrition/gallery/achievements/award1.jpg",
  "publicId": "arisa-nutrition/gallery/achievements/award1",
  "title": "Annual Award Ceremony",
  "description": "Students receiving the excellence award at the 2026 annual function.",
  "createdAt": { "$date": "2025-07-01T09:05:00.000Z" },
  "updatedAt": { "$date": "2025-07-01T09:05:00.000Z" }
}
```

---

## contacts

```json
{
  "_id": { "$oid": "66f1a2b3c4d5e6f7a8b9c0d5" },
  "name": "Rahul Verma",
  "email": "rahul.verma@example.com",
  "phone": "+91 98765 43210",
  "goal": "Lose 20 kg before my wedding in December",
  "message": "I have tried multiple diets before but always end up regaining the weight. I would love a proper consultation.",
  "status": "new",
  "createdAt": { "$date": "2025-06-28T14:22:00.000Z" },
  "updatedAt": { "$date": "2025-06-28T14:22:00.000Z" }
}
```
