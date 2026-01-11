# 🚀 Quick Start: Admin-Curated Campaigns

## Get Started in 5 Minutes

### Step 1: Create Admin User

**Option A: Using the setup script (Recommended)**
```bash
cd backend-copy
node setup-admin.js add your-email@example.com
```

**Option B: Using MongoDB Compass**
1. Open MongoDB Compass
2. Connect to your database
3. Find the `users` collection
4. Find your user document
5. Edit and add `"admin"` to the `roles` array:
```json
{
  "roles": ["admin"]
}
```

**Option C: Using MongoDB Shell**
```javascript
db.users.updateOne(
  { email: "your-email@example.com" },
  { $addToSet: { roles: "admin" } }
);
```

### Step 2: Add Admin Route to Frontend

Open your main router file (e.g., `src/App.jsx`) and add:

```javascript
import CampaignCurator from './pages/admin/CampaignCurator';

// Inside your <Routes>
<Route path="/admin/campaigns" element={<CampaignCurator />} />
```

### Step 3: Start Your Servers

**Backend:**
```bash
cd backend-copy
npm start
# or
node server.js
```

**Frontend:**
```bash
npm start
```

### Step 4: Access Admin Dashboard

1. Login with your admin account
2. Navigate to: `http://localhost:3000/admin/campaigns`
3. You should see the Campaign Curator dashboard

---

## 📝 Adding Your First Campaign

### Example: Sourcing from LinkedIn

1. **Find a Campaign**
   - Go to LinkedIn
   - Search for: `#lookingforcreators` OR `looking for influencers`
   - Find a post like:
     ```
     Looking for fashion influencers for our new clothing line!
     Budget: ₹1L-2L
     Platform: Instagram
     Followers: 50K+
     DM me if interested!
     ```

2. **Click "+ Add Campaign"** in curator dashboard

3. **Fill Source Information:**
   - Source Type: `LinkedIn`
   - Source URL: `https://linkedin.com/posts/abc123`
   - Contact Person: `Priya Sharma`
   - Contact Method: `LinkedIn DM`
   - Raw Text: [paste the original post]
   - Source Notes: `Found through #lookingforcreators search`

4. **Fill Brand Information:**
   - Brand Name: Leave blank or `[Brand Name]`
   - Poster Name: `Priya Sharma`
   - Poster Role: `Marketing Lead`
   - Company: `FashionCo`
   - Verified Brand: ☐ (uncheck unless you verified)

5. **Fill Campaign Details:**
   - Title: `Looking for fashion influencers for new clothing line`
   - Intent: `Sponsorship`
   - Description: Leave blank for default
   - Objective: `Brand awareness and product launch`
   - Deliverables: `3 Instagram posts, 5 stories`

6. **Fill Highlights:**
   - Budget: `₹1L-2L`
   - Platform: `Instagram`
   - Category: `Fashion, Lifestyle`
   - Locations: `Pan India`

7. **Fill Requirements:**
   - Follower Range Min: `50000`
   - Follower Range Max: `500000`
   - Avg Views: `5K+`
   - Creators Needed: `5`
   - Gender: `Any`
   - Timeline: `3 weeks`

8. **Admin Options:**
   - Status: `Live`
   - Hand Picked: ☑ (check if it's a great opportunity)
   - Contact Verified: ☑ (check after you verify via DM)

9. **Click "Publish Campaign"**

10. **Done!** Campaign is now live on AURAX LIVE feed

---

## 🎯 Quick Tips

### What to Mark as "Hand Picked"?
- ✅ Well-known brands
- ✅ Clear budget (not "negotiable" or "barter")
- ✅ Professional campaign details
- ✅ Verified contact person
- ❌ Vague requirements
- ❌ No budget mentioned
- ❌ Suspicious or spam-like posts

### When to Check "Contact Verified"?
- ✅ You DMed the person and confirmed it's legit
- ✅ You know the brand/company is real
- ✅ The contact responded professionally
- ❌ Haven't reached out yet
- ❌ Unverified social media account
- ❌ Suspicious or incomplete information

### Common Campaign Sources
1. **LinkedIn**
   - Search: `#lookingforcreators`, `#influencermarketing`, `looking for influencers`
   - Best for: B2B campaigns, professional brands

2. **Instagram**
   - Check DMs from brands
   - Tagged posts from agencies
   - Best for: Fashion, lifestyle, food campaigns

3. **WhatsApp Groups**
   - Influencer marketing groups
   - Agency partner channels
   - Best for: Quick opportunities, urgent campaigns

4. **Email**
   - Brands reaching out to AURAX
   - Agency partnerships
   - Best for: Long-term collaborations

5. **Referrals**
   - Other admins
   - Creator network
   - Industry contacts
   - Best for: Trusted opportunities

---

## 📊 Managing Campaigns

### View All Campaigns
- Scroll down on curator dashboard
- See grid of published campaigns
- Check views, status, source type

### Toggle Hand Picked
- Click "Mark Hand Picked" / "Unmark" button
- Use this to highlight premium opportunities
- Hand-picked campaigns appear first in feed

### Delete Campaign
- Click "Delete" button
- Confirm deletion
- Use when campaign is filled or expired

### Update Campaign
- Currently manual (coming soon in Phase 2)
- For now, delete and recreate if major changes needed

---

## 🔍 Finding Great Campaigns

### LinkedIn Search Queries
```
looking for influencers
#lookingforcreators
need content creators
seeking brand ambassadors
influencer collaboration opportunity
```

### Instagram Hashtags
```
#influencerswanted
#brandcollaboration
#ugccreators
#contentcreatorswanted
```

### What Makes a Good Campaign?
1. **Clear Budget**: Actual numbers, not just "negotiable"
2. **Specific Requirements**: Follower count, platform, category
3. **Professional Posting**: Good grammar, detailed info
4. **Legitimate Brand**: Can verify company exists
5. **Reasonable Timeline**: Not "urgent" or "ASAP" spam
6. **Fair Terms**: Not exploitative or one-sided

---

## ⚠️ Red Flags to Avoid

### Don't Publish These:
- ❌ "Barter only" with no product value mentioned
- ❌ "Exposure" as payment
- ❌ Vague or incomplete campaign details
- ❌ Suspicious or unverifiable brands
- ❌ Copy-paste spam-like posts
- ❌ No contact method or response
- ❌ Unrealistic requirements (1M followers for ₹5K)

---

## 📈 Daily Workflow

### Morning (30 minutes)
1. Check LinkedIn for new posts (last 24 hours)
2. Review Instagram DMs and tags
3. Check email inbox for brand inquiries

### Afternoon (30 minutes)
4. Add 3-5 high-quality campaigns to curator
5. Verify contact for top campaigns
6. Mark hand-picked for premium opportunities

### Evening (15 minutes)
7. Review campaign performance (views)
8. Delete expired or filled campaigns
9. Respond to creator feedback if any

### Weekly Review
- Analyze which sources provide best campaigns
- Check creator engagement with campaigns
- Adjust sourcing strategy based on performance

---

## 🎓 Training Checklist

Before you start curating, make sure you understand:

- [x] The "Feed by AURAX" trust model
- [x] Difference between public and admin-only fields
- [x] How to format raw campaign text
- [x] When to mark campaigns as "Hand Picked"
- [x] How to verify brand legitimacy
- [x] What makes a good campaign vs spam
- [x] How to use the curator form
- [x] Campaign lifecycle (live → engagement → closed)

---

## 🆘 Troubleshooting

### "Access Denied" or redirected to homepage?
- Check if your user has 'admin' role
- Run: `node setup-admin.js list` to verify
- Make sure you're logged in

### Campaign not appearing in public feed?
- Check status is set to "Live"
- Verify required fields are filled
- Check browser console for errors

### Can't delete campaign?
- Confirm you have admin role
- Check network tab for API errors
- Verify backend server is running

### Form validation errors?
- Required fields: posterName, company, title, intent, budget, platform
- Make sure those are filled before submitting

---

## 📞 Need Help?

- **Technical Issues**: Check [ADMIN_CURATED_CAMPAIGNS_COMPLETE.md](./ADMIN_CURATED_CAMPAIGNS_COMPLETE.md)
- **API Docs**: See "API Endpoints" section in complete guide
- **Best Practices**: Review "Training for Admin Team" section

---

## ✅ Success Checklist

After setup, verify:
- [ ] Admin user created with role
- [ ] Can access `/admin/campaigns` dashboard
- [ ] "+ Add Campaign" button works
- [ ] Can fill and submit campaign form
- [ ] Campaign appears in curator list
- [ ] Campaign visible in public feed at `/live-campaigns`
- [ ] Public feed doesn't show source info
- [ ] Can toggle hand-picked status
- [ ] Can delete campaigns

---

## 🎉 You're Ready!

Start sourcing and curating campaigns to build the most trusted influencer opportunity feed in India!

Remember: Quality > Quantity. It's better to publish 5 verified, high-quality campaigns than 20 unverified ones.

Happy curating! 🚀
