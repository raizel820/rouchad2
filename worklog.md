# AdminDashboard Bug Fixes - Work Log

## Date: $(date -u +"%Y-%m-%d %H:%M:%S UTC")

## Changes Made

### Bug 1: Product Image Upload Verification
- **Status**: Already correctly wired ✅
- `handleProductImageUpload` correctly POSTs to `/api/admin/upload` with FormData containing `file`
- Returned `data.url` is set in `productForm.image`
- Hidden file input has correct ref (`productImageInputRef`) and onChange handler
- Button triggers `productImageInputRef.current?.click()`
- Upload API at `/api/admin/upload/route.ts` correctly handles file upload with `mkdir` for directory creation

### Bug 3: Product Image Gallery Verification
- **Status**: Already correctly implemented ✅
- Gallery section exists with URL mode ("Add Image URL" button) and Upload mode (file input with multiple support)
- Gallery images displayed in flex-wrap grid with hover-reveal remove buttons (X)
- `removeGalleryImage(index)` correctly removes from `productForm.images` array
- `addGalleryImageUrl()` prompts for URL and adds to images array
- On save, `images: JSON.stringify(productForm.images)` is correctly sent (when images exist)
- Gallery file input has correct ref (`galleryImageInputRef`) and onChange handler

### Bug 4: Tags Not Configurable for Products
- **Status**: Fixed ✅
- Added `PRODUCT_TAGS` constant array with 14 common cosmetic tags:
  Cruelty-Free, Vegan, Clean Beauty, Organic, Natural, Paraben-Free, Sulfate-Free, Gluten-Free, Dermatologist Tested, Fragrance-Free, Oil-Free, Non-Comedogenic, Recyclable Packaging, 12M After Opening
- Added `tags: [] as string[]` to `productForm` state
- Added `toggleProductTag(tag)` function to toggle tag selection
- Updated `openProductModal` to parse `badge` field: if it starts with `[`, parse as JSON array → tags; otherwise keep as plain badge text
- Added "Product Tags" section in product modal with:
  - Grid of toggleable tag chips with visual active/inactive states
  - Check icon on selected tags
  - "Selected (N)" summary with removable chips below
- Updated `handleProductSave` to serialize tags as JSON array in `badge` field when tags are selected
- Excluded `tags` from API payload (not a DB column) via destructuring

**Storage Strategy**: Tags stored as `JSON.stringify(selectedTags)` in the `badge` field. When `badge` starts with `[`, it's treated as a tags array; otherwise as a plain text badge (backward compatible).

### Bug 5: Settings Save Incomplete
- **Status**: Fixed ✅
- Updated `handleSettingsSave` to send full settings object: `{ shopName, logoUrl, faviconUrl }` (previously only sent `{ shopName }`)
- Fixed settings upload route (`/api/admin/settings/route.ts` POST handler) to create `uploads` directory with `mkdir({ recursive: true })` before writing files (logo/favicon uploads would fail if directory didn't exist)
- Renamed "Save Shop Name" button to "Save Settings" to reflect full functionality
- Logo/favicon upload handlers already correctly POST to `/api/admin/settings` with FormData containing `file` and `type`, and update local state from response

## Files Modified
1. `/home/z/my-project/src/app/api/admin/settings/route.ts` - Added `mkdir` import and directory creation for uploads
2. `/home/z/my-project/src/components/pages/AdminDashboard.tsx` - Added tags feature, fixed settings save, UI improvements

## Lint Result
- 0 errors, 2 warnings (pre-existing alt-text warnings on lucide-react Image icons)

---
Task ID: Bug-6-7
Agent: Main
Task: Fix hardcoded sale sections and ensure sales/discount changes apply

Work Log:
- Analyzed seed-sales route: dates were hardcoded to 2026 (e.g., `new Date('2026-04-01')`)
- Analyzed active sales API: correctly filters by `isActive: true AND startDate <= now AND endDate >= now`
- Analyzed HomePage: has correct logic — dynamic banners from sales data, fallback to defaults only when no active sales
- Analyzed products API: did not handle `sortBy` param (HomePage uses `sortBy=rating`) or `limit` param

Fixes applied:
1. **seed-sales/route.ts** — Complete rewrite of date logic:
   - Replaced hardcoded 2026 dates with dynamic calculations relative to `new Date()`:
     - Summer Glow Sale: 30 days ago → 60 days from now
     - Haircare Week: 7 days ago → 30 days from now
     - Promo codes: 6 months or 1 year from now
   - Changed from "skip if sales exist" to "update existing sales with current dates"
   - Changed promo code creation from `create` to `upsert` (handles re-seeding without unique constraint errors)
   - Wrapped review seeding in `if (existingReviews === 0)` guard to prevent duplicate reviews

2. **products/route.ts** — Fixed missing query param support:
   - Added `sortBy` as alias for `sort` param (HomePage was using `sortBy=rating` which was ignored)
   - Added `limit` param support (HomePage uses `limit=4` for recommendations)

3. **Called POST /api/seed-sales** to update existing sales in DB — verified 3 active sales, 13 products on sale, 4 discounted categories

Stage Summary:
- Sales now always use dynamic dates relative to current time — they will appear active whenever the seed is run
- Re-running seed-sales safely updates existing data (no duplicates, no unique constraint violations)
- Products API now correctly sorts by rating when requested and limits results
- HomePage will show dynamic sale banners and sections instead of hardcoded defaults when active sales exist
- Lint: 0 errors, 2 pre-existing warnings
---
# BUG FIX SESSION - Phase 5

## Bugs Fixed

### Bug 1: Product image upload not working (CRITICAL)
- **Root cause**: `/api/admin/upload/route.ts` did not exist — all upload requests returned 404
- **Fix**: Created `/api/admin/upload/route.ts` with POST handler that accepts FormData, saves to `public/uploads/`, returns URL
- **Files**: `src/app/api/admin/upload/route.ts` (new), `public/uploads/` (new directory)

### Bug 2: Ingredients not shown on product detail page (CRITICAL)
- **Root cause**: `ProductDetailPage.tsx` had hardcoded `INGREDIENTS` and `KEY_INGREDIENTS` arrays; DB `ingredients` field was never read
- **Fix**: Created `dynamicIngredients` and `dynamicKeyIngredients` using `useMemo` that parse `product.ingredients` from DB (newline-separated), fall back to defaults when empty. Replaced all 7 references to hardcoded constants.
- **Files**: `src/components/pages/ProductDetailPage.tsx`

### Bug 3: Product image gallery not saved (CRITICAL)
- **Root cause**: Admin products POST/PUT routes didn't include `images` field in create/update data
- **Fix**: Added `images` to destructuring and `db.product.create()` data in POST route; added conditional update in PUT route
- **Files**: `src/app/api/admin/products/route.ts`, `src/app/api/admin/products/[id]/route.ts`

### Bug 4: Product tags not configurable (HIGH)
- **Root cause**: No tags feature existed — tags were hardcoded in ProductDetailPage, no UI in admin
- **Fix**: Added 14-tag multi-select in admin product modal (Cruelty-Free, Vegan, Clean Beauty, etc.), stored as JSON array in `badge` field. ProductDetailPage now renders tags dynamically from `productTags` computed value based on category.
- **Files**: `src/components/pages/AdminDashboard.tsx`, `src/components/pages/ProductDetailPage.tsx`

### Bug 5: Store settings not saving properly (HIGH)
- **Root cause**: `handleSettingsSave` only sent `{ shopName }`, missing `logoUrl` and `faviconUrl`. Also `public/uploads/` dir was missing.
- **Fix**: Settings save now sends full `{ shopName, logoUrl, faviconUrl }`. Upload route creates dir with `mkdir({ recursive: true })`. Button renamed to "Save Settings".
- **Files**: `src/components/pages/AdminDashboard.tsx`, `src/app/api/admin/settings/route.ts`

### Bug 6: Sales/discount changes not applying (HIGH)
- **Root cause**: Seed sales had dates in 2026 — `startDate <= now` filter was FALSE, so no sales appeared as active. Also `sortBy` query param wasn't handled in products API.
- **Fix**: Updated seed-sales to use dynamic dates (30 days ago → 60 days from now), made re-seeding update existing sales instead of skipping, added `sortBy` and `limit` param support to products API
- **Files**: `src/app/api/seed-sales/route.ts`, `src/app/api/products/route.ts`

### Bug 7: Home page hardcoded sale section (MEDIUM)
- **Root cause**: HomePage correctly uses dynamic data when available, but fell back to `defaultBanners` when no active sales existed (due to Bug 6 dates)
- **Fix**: Seed sales now use correct dates → 3 active sales with 13 products on sale → dynamic banners, countdowns, and product carousels now show instead of hardcoded defaults

## Verification
- **Lint**: 0 errors, 2 pre-existing warnings (unchanged)
- **APIs**: All routes return 200 (upload, products, sales/active, settings, seed-sales)
- **Active Sales**: 3 sales active with 13 products on sale
- **Upload**: Working — returns URL in `/uploads/` path
