# Retired legacy pages

These pages are still in the repository but are no longer routed. Each one either kept its data
only in the visitor's browser (`localStorage`, so nothing reached the AURAX backend), showed
sample data, or was a duplicate of a newer page. Their URLs now redirect to the real feature, so
old links and bookmarks keep working. Nothing was deleted.

| URL | Page file | Why it was retired | Now goes to |
|---|---|---|---|
| `/admin` | `AdminPanel.js` | Creators and campaigns read from the browser only; unstyled | Admin: Brand intelligence (`/admin/brand-intelligence`) |
| `/campaigns` | `CampaignManager.js` (+ `components/campaigns/CampaignForm.js`, `CampaignList.js`) | Campaigns stored in the browser only; Tailwind classes without Tailwind | LIVE board (`/live/campaigns`) |
| `/analytics` | `Analytics.js` | Stats computed from browser-only data; blank for everyone else | Each role's home: admin → Brand intelligence, brand/creator → dashboard, guest → LIVE board |
| `/add-talent` | `AddTalent.js` (+ `components/creators/AddCreatorForm.js`) | Form never reached the backend | Admin → Creator database (its "Add creator" saves to the backend); brand → dashboard |
| `/creators/:id` | `CreatorProfile.js` | Contained a non-working login form, not a profile | Find creators (`/creators`) |
| `/creators` (old content) | `CreatorDirectory.js` | Advertised AI tools that don't exist; buttons did nothing | Replaced by `CreatorDiscovery.jsx` (real, approved creators) |
| `/creator/dashboard-old` | `CreatorDashboard.js` (+ `AdvancedAnalytics`, `AIContentRecommender`, `SentimentAnalysis`) | Widgets showed sample data | `/creator/dashboard` |
| `/creator/welcome-old` | `CreatorOnboarding.js` | Superseded onboarding | `/creator/welcome` |
| `/coming-soon` | `ComingSoonPage.js` | Said the creator dashboard and login were "70% complete"; both have shipped. Nothing linked to it | Homepage |
| `/creator/welcome` (second entry) | `MinimalWelcome.js` | Duplicate route: the first `/creator/welcome` (WelcomeScreen) always matched, so it never rendered | unchanged (`WelcomeScreen`) |

To restore a page: re-add its `React.lazy` import in `src/App.js` and point its route back at it.
