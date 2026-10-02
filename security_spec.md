# Security Specification: UR Store (سوق أور) Firestore Security Architecture

## 1. Data Invariants
- **Reseller Accounts (`/resellers/{userId}`)**: 
  - Document ID `{userId}` must match `request.auth.uid`.
  - Reseller profiles contain private identity information (phone, earnings, balance). Only the authenticated owner or admin can read/write.
  - Initial `earnedBalance` and `pendingPayout` cannot be artificially inflated on create.
- **Orders (`/orders/{orderId}`)**:
  - Anyone (guest or authenticated buyer) can place an order (`create`).
  - Buyers who are logged in can query/list their own orders. Resellers can query orders associated with their `resellerId` or `resellerCode`.
  - Order status updates (`Pending -> Shipped -> Delivered -> Cancelled`) are restricted to admins or assigned resellers updating their orders.
- **Products (`/products/{productId}`)**:
  - Catalog is publicly readable.
  - Creation requires authentication.

## 2. The Dirty Dozen Payloads (Designed to be PERMISSION_DENIED)
1. **Unauthenticated Reseller Profile Hijack**: Attempting to create `/resellers/user_123` with no `request.auth`.
2. **Identity Spoofing in Reseller Profile**: Authenticated as `user_A` trying to write to `/resellers/user_B`.
3. **Ghost Field Injection in Reseller**: Sending arbitrary fields `isAdmin: true` into a reseller document.
4. **Reseller Self-Crediting**: Setting `earnedBalance: 50000000` on profile creation.
5. **PII Scraping**: Attempting a blanket `list` on `/resellers` without UID match.
6. **ID Poisoning Attack**: Passing a 2KB junk string as document ID `{orderId}`.
7. **Order Status Skipping / Corruption**: Updating order fields with invalid types or non-whitelisted keys.
8. **Unauthorized Order Modification**: Random user trying to delete or alter another customer's order.
9. **Unauthenticated Product Deletion**: Guest attempting `delete` on `/products/{id}`.
10. **Product Schema Poisoning**: Injecting invalid numeric types (strings for price) into product.
11. **Negative Value Attacks**: Submitting orders with negative subtotal or price.
12. **Malformed Phone Number Bypass**: Writing an order or reseller record with non-compliant phone strings.
