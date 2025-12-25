# Shareable Trip Lists Feature

## Overview

Users can now share trip lists with others via a read-only link. Recipients don't need to create an account or log in to view the shared trips.

## How It Works

### For List Owners

1. **Share a List**
   - Hover over a trip list in the sidebar
   - Click the 📤 (share) button
   - A unique share link is automatically generated and copied to your clipboard
   - The button changes to 🔗 to indicate the list is now shared

2. **Copy Share Link**
   - If a list is already shared, click the 🔗 button to copy the link again

3. **Revoke Access**
   - Hover over a shared list
   - Click the 🔒 (lock) button
   - Confirm the revocation
   - The share link will immediately stop working

### For Recipients

1. Click on the shared link (format: `/shared/{token}`)
2. View all trips in the list without logging in
3. See trip details, costs, and scores
4. Sort and filter trips
5. **Cannot** modify, delete, or create trips

## Technical Details

### Database Schema

- `trip_lists.share_token`: UUID column storing the unique share token
- Secure Postgres functions validate token before returning data:
  - `get_shared_trip_list(token)` - Returns trip list only if token matches
  - `get_shared_trips(token)` - Returns trips only if token matches

### Security

- **Token-gated access**: Users must provide the exact token to access data
  - Cannot enumerate/list all shared trip lists
  - Can only access the specific list they have a token for
- Share tokens are cryptographically random UUIDs (unguessable)
- Secure functions (`SECURITY DEFINER`) validate token before returning data
- Public users can only read data, never write
- Owners can revoke access instantly by nullifying the token

### Routes

- **Public route**: `/shared/:shareToken` - No authentication required
- **Protected routes**: All other routes require user session

## User Experience

### Share Link Example
```
https://yoursite.com/shared/a1b2c3d4-e5f6-7890-1234-567890abcdef
```

### Visual Indicators

- **Owner view**: 
  - 📤 = List not shared yet
  - 🔗 = List is currently shared
  - ✓ = Link copied to clipboard (temporary)
  - 🔒 = Revoke button (only visible for shared lists)

- **Public view**: 
  - Banner at top: "📋 You're viewing a shared trip list (read-only)"
  - No edit/delete/create buttons
  - Can view all trip details, sort, and filter

## Implementation Files

- `src/types/TripList.ts` - Added `share_token` field
- `src/useTripListList.ts` - Share token mutations and public query
- `src/Trips.tsx` - Share button UI in trip list sidebar
- `src/SharedTripList.tsx` - Read-only public view component
- `src/App.tsx` - Public route configuration
- `SHARED_TRIP_LISTS_MIGRATION.sql` - Database migration

## Future Enhancements

Potential improvements:
- Add expiration dates for share links
- Track view analytics (who viewed when)
- Allow password protection for sensitive lists
- Export shared list as PDF
- Share individual trips (not just lists)
