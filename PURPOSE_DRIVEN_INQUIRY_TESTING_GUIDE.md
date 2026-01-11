# Purpose-Driven Inquiry Form - Testing Guide

## ✅ Implementation Complete

### What Changed

1. **Purpose Field is Now Primary Selector**
   - Dropdown with 3 fixed options
   - Must be selected first to reveal form
   - Helper text explains what each purpose provides

2. **Three Distinct Form Flows**

   **Purpose 1: Connect with Creators**
   - For: Brands, Agencies, Individuals
   - Required: Full Name, I am a (role), Target Platform(s)
   - Optional: Company, Budget Range, Message
   - Access: Chat & Call capabilities

   **Purpose 2: Connect with Brands (Campaign Requirement)**
   - For: Creators, Agencies
   - Required: Full Name, I am a (role), Primary Niche, Platform(s)
   - Optional: Portfolio Link, Message
   - Access: Brand communication & campaign discussion

   **Purpose 3: Post a Campaign**
   - For: Brands, Agencies
   - Required: Brand Name, Campaign Title, Platform(s), Budget, Creator Category
   - Optional: Follower Range, Location, Deliverables, Timeline, Notes
   - Access: Campaign publishing after approval

3. **Auth Protection**
   - Form checks for token on mount
   - Redirects to login if unauthenticated
   - Redirects to login on 401 response
   - No form access after logout

### Testing Steps

#### 1. Test Unauthenticated Access
```
1. Logout if logged in
2. Navigate to: http://localhost:3000/inquiry/form
3. ✅ Expected: Immediate redirect to /login
```

#### 2. Test Purpose 1: Connect with Creators
```
1. Login with any account
2. Navigate to: http://localhost:3000/inquiry/form
3. Select "Connect with Creators" from Purpose dropdown
4. ✅ Verify helper text appears
5. ✅ Form section "Connect with Creators" appears
6. Fill required fields:
   - Full Name: Test User
   - I am a: Brand
   - Target Platform: Check at least one
7. ✅ Submit button appears
8. Click Submit
9. ✅ Success screen appears
10. ✅ Can navigate to Dashboard or Browse Campaigns
```

#### 3. Test Purpose 2: Connect with Brands
```
1. Clear any existing pending inquiries (admin)
2. Navigate to: http://localhost:3000/inquiry/form
3. Select "Connect with Brands (Campaign Requirement)"
4. ✅ Form section "Connect with Brands" appears
5. Fill required fields:
   - Full Name: Creator Name
   - I am a: Creator
   - Primary Niche: Fashion
   - Platform(s): Instagram
6. Optional fields:
   - Portfolio Link: https://instagram.com/username
   - Message: Interested in fashion campaigns
7. Submit
8. ✅ Success message
```

#### 4. Test Purpose 3: Post a Campaign
```
1. Clear any existing pending inquiries
2. Navigate to: http://localhost:3000/inquiry/form
3. Select "Post a Campaign"
4. ✅ Form section "Post a Campaign" appears
5. Fill required fields:
   - Brand/Company Name: Test Brand
   - Campaign Title: Summer Fashion Campaign
   - Platform(s): Instagram, YouTube
   - Budget: ₹1,00,000 - ₹5,00,000
   - Creator Category: Fashion, Lifestyle
6. Optional fields:
   - Follower Range: Mid-tier (50K - 500K)
   - Location: Mumbai
   - Deliverables: 3 posts, 2 reels
   - Timeline: 2 weeks
   - Additional Notes: Looking for Mumbai-based creators
7. Submit
8. ✅ Success message
```

#### 5. Test Validation
```
1. Select a purpose
2. Try to submit without filling required fields
3. ✅ HTML5 validation prevents submission
4. Fill only some required fields
5. ✅ Form validates properly
```

#### 6. Test Auth Protection on Logout
```
1. Login and navigate to inquiry form
2. Select a purpose and start filling
3. Open DevTools → Application → Local Storage
4. Delete the "token" item
5. Try to submit form
6. ✅ Redirects to /login with returnUrl
```

#### 7. Test CTA Flow with Intent Preservation
```
1. Logout
2. Go to http://localhost:3000/live/campaigns
3. Click "Quick Chat" button on any campaign
4. ✅ Redirects to /login?returnUrl=/live/campaigns&action=chat
5. Login
6. ✅ Returns to /live/campaigns?resumeAction=chat
7. ✅ Auto-executes chat action
8. ✅ Shows inquiry form if not verified
9. ✅ Purpose can be selected on form
```

### Backend Changes

#### API Route Updates (`routes/inquiry.js`)

1. **Purpose Mapping**
   ```javascript
   const purposeMap = {
     'connect_creators': 'connect',
     'connect_brands': 'connect',
     'post_campaign': 'post'
   };
   ```

2. **Purpose-Specific Validation**
   - Purpose 1: Validates userRole + targetPlatform
   - Purpose 2: Validates userRole + niche + targetPlatform
   - Purpose 3: Validates brandName + campaignTitle + budget + creatorCategory + targetPlatform

3. **Context Enrichment**
   - Purpose 2: Adds niche and portfolio link to message
   - Purpose 3: Adds all campaign details to message for admin review

### Database Schema

No changes required to Inquiry model. Additional fields are stored in the message field as contextual data for admin review.

### Verification Flow

1. User selects purpose
2. Fills purpose-specific form
3. Submits inquiry
4. Backend creates inquiry with status: 'pending'
5. Admin reviews in admin panel
6. Admin approves → inquirerVerified = true
7. User can now access gated features

### Console Logs to Check

**Frontend (Browser Console):**
```
🔄 Resuming CTA action after login: chat
```

**Backend (Terminal):**
```
✅ Backend server running on http://localhost:5002
✅ MongoDB connected successfully
```

### Known Behaviors

1. **Purpose selection is mandatory**
   - Form fields hidden until purpose selected
   - Submit button only appears after purpose selected

2. **No form mixing**
   - Only one form visible at a time
   - Changing purpose hides previous form and shows new one

3. **Auth checks happen at:**
   - Component mount (useEffect)
   - Form submission
   - On 401 response

4. **Helper text is contextual**
   - Changes based on purpose
   - Explains what verification provides

### Success Criteria

✅ Purpose dropdown appears first
✅ Helper text visible under purpose
✅ Form dynamically changes based on purpose
✅ Required fields enforce validation
✅ Optional fields are truly optional
✅ Unauthenticated users redirect to login
✅ Logged out users can't access form
✅ Successful submission shows success screen
✅ Navigation buttons work after submission

### Edge Cases Handled

1. **Logout while on form**: Redirect to login on mount
2. **Token expiry during fill**: Redirect to login on submit
3. **Changing purpose**: Form resets, no field mixing
4. **Pending inquiry exists**: Backend returns appropriate message
5. **Already verified**: Backend returns already verified message

## Admin Review Notes

When reviewing inquiries in admin panel, the `message` field now contains:

**Purpose 1 (Connect with Creators):**
```
User's message text
```

**Purpose 2 (Connect with Brands):**
```
[Niche: Fashion] [Portfolio: https://...] User's message
```

**Purpose 3 (Post a Campaign):**
```
[Brand: Test Brand] [Campaign: Summer Campaign] [Category: Fashion] 
[Followers: Mid-tier] [Location: Mumbai] [Deliverables: 3 posts] 
[Timeline: 2 weeks] User's notes
```

This gives admins full context for verification decisions.

## Next Steps

1. **Test all 3 purpose flows** with real accounts
2. **Test logout behavior** during form fill
3. **Test CTA intent preservation** through login
4. **Build admin inquiry management UI** to approve/reject
5. **Add email notifications** on inquiry status changes

---

**Implementation Status:** ✅ Complete
**Testing Status:** Ready for QA
**Deployment Status:** Pending production testing
