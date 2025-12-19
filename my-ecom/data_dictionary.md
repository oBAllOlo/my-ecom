# Data Dictionary - My E-com

This document describes the MongoDB schema definitions used in the application.

## 1. User

**Collection:** `users`
**Description:** Stores user account information, authentication details, and addresses.

| Field       | Type      | Required | Unique | Default  | Description                             |
| ----------- | --------- | -------- | ------ | -------- | --------------------------------------- |
| `_id`       | ObjectId  | Yes      | Yes    | -        | Unique identifier                       |
| `name`      | String    | Yes      | -      | -        | User's full name                        |
| `email`     | String    | Yes      | Yes    | -        | User's email address (login credential) |
| `password`  | String    | Yes      | -      | -        | Hashed password                         |
| `role`      | String    | Yes      | -      | `"user"` | Role: `"user"` or `"admin"`             |
| `avatar`    | String    | No       | -      | -        | URL to user's profile picture           |
| `address`   | Subschema | No       | -      | -        | User's primary shipping address         |
| `createdAt` | Date      | -        | -      | Auto     | Timestamp of creation                   |
| `updatedAt` | Date      | -        | -      | Auto     | Timestamp of last update                |

### Address Subschema

| Field        | Type   | Description          |
| ------------ | ------ | -------------------- |
| `fullName`   | String | Recipient's name     |
| `phone`      | String | Contact phone number |
| `street`     | String | Street address       |
| `district`   | String | District/Amphoe      |
| `province`   | String | Province/Changwat    |
| `postalCode` | String | Postal code          |

---

## 2. Product

**Collection:** `products`
**Description:** Stores product information for the catalog.

| Field           | Type          | Required | Default | Description                           |
| --------------- | ------------- | -------- | ------- | ------------------------------------- |
| `_id`           | ObjectId      | Yes      | -       | Unique identifier                     |
| `name`          | String        | Yes      | -       | Product name                          |
| `description`   | String        | Yes      | -       | Full product description              |
| `price`         | Number        | Yes      | -       | Current selling price                 |
| `originalPrice` | Number        | No       | -       | Original price (for sale display)     |
| `image`         | String        | Yes      | -       | Main product image URL                |
| `images`        | Array<String> | No       | -       | Additional product image URLs         |
| `category`      | String        | Yes      | -       | Category name/ID                      |
| `brand`         | String        | Yes      | -       | Brand name                            |
| `stock`         | Number        | Yes      | `0`     | Inventory count                       |
| `rating`        | Number        | No       | `0`     | Average rating (0-5)                  |
| `reviews`       | Number        | No       | `0`     | Total review count                    |
| `features`      | Array<String> | No       | -       | List of key features                  |
| `switchType`    | String        | No       | -       | Keyboard switch type (if applicable)  |
| `connectivity`  | String        | No       | -       | Connectivity options (e.g., Wireless) |
| `isNew`         | Boolean       | No       | `false` | Flag for "New Arrival" status         |
| `isFeatured`    | Boolean       | No       | `false` | Flag for "Featured" status            |
| `createdAt`     | Date          | -        | Auto    | Timestamp of creation                 |
| `updatedAt`     | Date          | -        | Auto    | Timestamp of last update              |

---

## 3. Order

**Collection:** `orders`
**Description:** Stores customer order details, items purchased, and status.

| Field             | Type             | Required | Default     | Description                                                            |
| ----------------- | ---------------- | -------- | ----------- | ---------------------------------------------------------------------- |
| `_id`             | ObjectId         | Yes      | -           | Unique identifier                                                      |
| `userId`          | ObjectId         | Yes      | -           | Reference to `User` collection                                         |
| `items`           | Array<Subschema> | Yes      | -           | List of purchased items                                                |
| `total`           | Number           | Yes      | -           | Total order amount                                                     |
| `shippingAddress` | Subschema        | Yes      | -           | Shipping address snapshot                                              |
| `status`          | String           | -        | `"pending"` | `"pending"`, `"processing"`, `"shipped"`, `"delivered"`, `"cancelled"` |
| `paymentMethod`   | String           | Yes      | -           | Payment method used                                                    |
| `createdAt`       | Date             | -        | Auto        | Timestamp of creation                                                  |
| `updatedAt`       | Date             | -        | Auto        | Timestamp of last update                                               |

### CartItem Subschema

| Field       | Type     | Required | Description                        |
| ----------- | -------- | -------- | ---------------------------------- |
| `productId` | ObjectId | Yes      | Reference to `Product`             |
| `name`      | String   | Yes      | Product name at time of purchase   |
| `price`     | Number   | Yes      | Price per unit at time of purchase |
| `image`     | String   | Yes      | Product image URL                  |
| `quantity`  | Number   | Yes      | Quantity purchased (min 1)         |

---

## 4. Category

**Collection:** `categories`
**Description:** Stores product categories.

| Field          | Type     | Required | Unique | Default | Description                          |
| -------------- | -------- | -------- | ------ | ------- | ------------------------------------ |
| `_id`          | ObjectId | Yes      | Yes    | -       | Unique identifier                    |
| `name`         | String   | Yes      | -      | -       | Display name of the category         |
| `slug`         | String   | Yes      | Yes    | -       | URL-friendly identifier              |
| `icon`         | String   | Yes      | -      | -       | Icon identifier or URL               |
| `productCount` | Number   | No       | -      | `0`     | Cached count of products in category |
| `createdAt`    | Date     | -        | -      | Auto    | Timestamp of creation                |
| `updatedAt`    | Date     | -        | -      | Auto    | Timestamp of last update             |
