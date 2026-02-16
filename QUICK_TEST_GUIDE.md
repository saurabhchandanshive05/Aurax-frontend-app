# Quick Test Guide - Meta Ad Library Verification

## 🚀 **Run This Now**

### Step 1: Seed Real Brands (5 minutes)

```powershell
# Navigate to backend
cd backend-copy

# Run seed script with --real flag
node scripts/seedBrandIntelligenceReal.js --real
```

**Expected Output:**
```
✅ Using REAL brands from Meta Ad Library
✅ Created brand: Nykaa (Intent: 9/10, Meta ID: 147164935301978)
✅ Created brand: CRED (Intent: 9/10, Meta ID: 105093617619116)
✅ Created brand: Zomato (Intent: 9/10, Meta ID: 163148137056528)
✅ Created brand: Myntra (Intent: 9/10, Meta ID: 121480877896274)
✅ Created brand: PhonePe (Intent: 9/10, Meta ID: 148371765239846)

📊 Total brands seeded: 5
📊 Data Sources:
   Real (verified): 5
   Demo (unverified): 0
```

### Step 2: Start Servers (if not running)

```powershell
# Terminal 1 - Backend
cd backend-copy
npm start

# Terminal 2 - Frontend
cd ..
npm start
```

### Step 3: Login and Navigate

1. Open http://localhost:3000
2. Login with: `sourabh.chandanshive@gmail.com`
3. Navigate to: **Admin → Brand Intelligence**

## ✅ **Verification Checklist**

### Dashboard Overview Tab
- [ ] Stats show "5 Total Brands"
- [ ] "High-Intent Brands" count matches
- [ ] No warning banner appears (all real data)

### Search & Discover Tab
- [ ] All 5 brands appear in list:
  - Nykaa
  - CRED
  - Zomato
  - Myntra
  - PhonePe

### Brand Card Checks (For Each Brand)

**Visual Elements:**
- [ ] Brand name appears (no [DEMO] tag)
- [ ] ✅ **Verified Meta Page** badge (green) visible under brand name
- [ ] Green badge is a clickable link
- [ ] 🔗 **Verify in Meta Ad Library** button visible in actions

**Functionality:**
- [ ] Click "✅ Verified Meta Page" → Opens Facebook page in new tab
- [ ] Click "🔗 Verify in Meta Ad Library" → Opens Meta Ad Library in new tab
- [ ] Meta Ad Library shows ads for India region
- [ ] Ad count matches dashboard (±20% tolerance)

### Test One Brand in Detail (Nykaa)

1. **Click "✅ Verified Meta Page"**
   - Should open: https://www.facebook.com/Nykaa
   - Verify: Facebook page exists and is official

2. **Click "🔗 Verify in Meta Ad Library"**
   - Should open Meta Ad Library search
   - Verify: Shows active ads for Nykaa in India
   - Verify: Ad formats include Instagram (Reels/Stories/Feed)

3. **Click "📋 View Details"**
   - Modal opens with full brand details
   - Verify: Meta Page ID displayed
   - Verify: Data verified timestamp shown

4. **Click "✏️ Research Notes"**
   - Research modal opens
   - Verify: Can add notes and tags
   - Verify: Save updates successfully

## 🟡 **Test Demo Data Warning (Optional)**

### Step 1: Seed Demo Brands

```powershell
node scripts/seedBrandIntelligenceReal.js
# Without --real flag = demo data
```

### Step 2: Refresh Dashboard

**Expected UI Changes:**
- [ ] ⚠️ Yellow warning banner appears at top
- [ ] Warning text: "Demo Data Notice: Some brands shown are sample data..."
- [ ] X button to dismiss banner
- [ ] Demo brands show [DEMO] tag next to name
- [ ] Demo brands show ⚠️ **Unverified Source** badge
- [ ] "No Meta URL" button (disabled) instead of "Verify in Meta Ad Library"

### Step 3: Dismiss Warning

- [ ] Click X button on warning banner
- [ ] Banner disappears
- [ ] Banner stays hidden on page refresh

## 📱 **Mobile Testing** (Optional)

1. Open Chrome DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Select iPhone 12 Pro or similar
4. Test responsive layout:
   - [ ] Warning banner stacks vertically
   - [ ] Brand cards full width
   - [ ] Buttons stack vertically
   - [ ] Badges wrap properly
   - [ ] Meta Ad Library button full width

## 🐛 **Common Issues & Fixes**

### Issue 1: "Network Error" when fetching brands
**Fix:** Make sure backend is running on port 5002
```powershell
cd backend-copy
npm start
```

### Issue 2: No brands appear
**Fix:** Run seed script again
```powershell
node scripts/seedBrandIntelligenceReal.js --real
```

### Issue 3: Warning banner always shows
**Fix:** Check database - ensure real brands have `is_demo_data: false`
```javascript
// In MongoDB Compass or shell
db.brand_intelligences.updateMany(
  { brand_name: { $in: ["Nykaa", "CRED", "Zomato", "Myntra", "PhonePe"] } },
  { $set: { is_demo_data: false } }
)
```

### Issue 4: Meta Page link doesn't open
**Fix:** Check browser popup blocker settings - allow popups for localhost:3000

### Issue 5: CSS styles not applied
**Fix:** Clear cache and hard reload (Ctrl+Shift+R)

## 📊 **Success Criteria**

### All tests pass when:
- ✅ Real brands display verification badges
- ✅ Meta Page links open correct Facebook pages
- ✅ Meta Ad Library links show active ads in India
- ✅ No warning banner for real data
- ✅ Warning banner appears for demo data
- ✅ Demo data clearly marked with [DEMO] tags
- ✅ Mobile layout responsive and functional

## 🎉 **If All Tests Pass**

You're ready to:
1. ✅ Commit changes to git
2. ✅ Push to GitHub
3. ✅ Deploy to production
4. ✅ Update internal team documentation

---

**Estimated Time:** 15 minutes for complete testing  
**Status:** Ready for testing  
**Date:** January 12, 2026
