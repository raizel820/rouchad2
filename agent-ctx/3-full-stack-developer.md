# Task ID: 3 - Fix promo code usage tracking on checkout

## Agent: full-stack-developer

## Status: ✅ Completed

## Changes Made

### 1. `/home/z/my-project/src/app/api/orders/route.ts`
- **Added to request body destructuring**: `shipping`, `promoCodeId`, `promoCode`, `discountTotal`
- **Added to `db.order.create` data**:
  - `discountTotal: discountTotal || 0` — stores the promo discount amount
  - `shipping: shipping || 0` — uses client-sent shipping instead of hardcoded 0
  - `promoCode: promoCode || null` — stores the promo code string
  - `promoCodeId: promoCodeId || null` — stores the promo code FK
- **Added promo code usage increment** (after order creation, before product updates):
  ```ts
  if (promoCodeId) {
    await db.promoCode.update({
      where: { id: promoCodeId },
      data: { currentUses: { increment: 1 } },
    });
  }
  ```

### 2. `/home/z/my-project/src/components/pages/CheckoutPage.tsx`
- **Fixed `subtotal`**: Changed from `subtotal` (raw cart total) to `afterPromoSubtotal` (after promo discount)
- **Added `shipping`**: Now sends the calculated shipping value to the API
- **Fixed `total`**: Changed from `subtotal + tax` (incorrect, missing shipping and promo) to `total` (correctly calculated as `afterPromoSubtotal + shipping + tax`)
- **Added promo code fields**:
  - `promoCodeId: appliedPromoCode?.id || null`
  - `promoCode: appliedPromoCode?.code || null`
  - `discountTotal: promoDiscount`

### 3. Bug Fix (bonus)
- The original `total` sent to the API was `subtotal + tax` which:
  - Did not include shipping cost
  - Did not account for promo discount
  - Now correctly uses the pre-calculated `total` variable

### 4. Null Safety
- All promo fields gracefully default to `null` when no promo code is applied
- `currentUses` increment only runs when `promoCodeId` is truthy
