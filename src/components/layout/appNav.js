/*
 * Navigation for the signed-in product areas.
 * `section` items drive the creator dashboard through ?section=,
 * everything else is a plain route. Paths are the existing app routes.
 */
export const APP_NAV = {
  creator: {
    label: "Creator",
    home: "/creator/dashboard",
    groups: [
      {
        items: [
          { label: "Overview", icon: "home", to: "/creator/dashboard", section: "overview", tab: true },
          { label: "Profile", icon: "user", to: "/creator/dashboard", section: "profile", tab: true },
          { label: "Content", icon: "image", to: "/creator/dashboard", section: "content", tab: true },
          { label: "Monetization", icon: "wallet", to: "/creator/dashboard", section: "monetization" },
          { label: "Orders", icon: "package", to: "/creator/dashboard", section: "orders", tab: true },
          { label: "Instagram", icon: "instagram", to: "/creator/dashboard", section: "instagram" },
        ],
      },
      {
        title: "Opportunities",
        items: [
          { label: "LIVE campaigns", short: "LIVE", icon: "live", to: "/live/campaigns" },
          { label: "Public page", icon: "link", to: "/creator/public-page-setup" },
        ],
      },
      {
        title: "Account",
        items: [{ label: "Settings", icon: "settings", to: "/creator/welcome" }],
      },
    ],
  },
  brand: {
    label: "Brand",
    home: "/brand/dashboard",
    groups: [
      {
        items: [
          { label: "Overview", icon: "home", to: "/brand/dashboard", tab: true },
          { label: "Find creators", short: "Creators", icon: "search", to: "/creators", tab: true },
          { label: "LIVE campaigns", short: "LIVE", icon: "live", to: "/live/campaigns", tab: true },
          { label: "Post a requirement", short: "Post", icon: "megaphone", to: "/inquiry/form", tab: true },
        ],
      },
    ],
  },
  admin: {
    label: "Admin",
    home: "/admin/campaigns",
    groups: [
      {
        title: "Campaigns",
        items: [
          { label: "Campaign curator", short: "Campaigns", icon: "megaphone", to: "/admin/campaigns", tab: true },
          { label: "LIVE board", icon: "live", to: "/live/campaigns" },
        ],
      },
      {
        title: "Intelligence",
        items: [
          { label: "Brand intelligence", short: "Brands", icon: "radar", to: "/admin/brand-intelligence", exact: true, tab: true },
          { label: "Creator database", short: "Creators", icon: "users", to: "/admin/brand-intelligence/creators", tab: true },
          { label: "Instagram profiles", icon: "instagram", to: "/admin/influencers" },
        ],
      },
      {
        title: "People",
        items: [{ label: "Creator review", short: "Review", icon: "check-circle", to: "/admin/creators", tab: true }],
      },
    ],
  },
};

/* Which shell (if any) a pathname gets. Public pages return null. */
export function shellFor(pathname) {
  if (/^\/admin(\/|$)/.test(pathname)) return "admin";
  if (/^\/(creator\/dashboard|dashboard)\/?$/.test(pathname)) return "creator";
  if (/^\/brand\/dashboard\/?$/.test(pathname)) return "brand";
  return null;
}

/* Onboarding steps get a quiet, focused frame: no marketing chrome, no rail. */
export function isFocusRoute(pathname) {
  return /^\/creator\/(welcome|profile-setup|under-review|public-page-setup)\/?$/.test(pathname);
}

export function isItemActive(item, pathname, section) {
  if (item.section) {
    const onDashboard = /^\/(creator\/dashboard|dashboard)\/?$/.test(pathname);
    return onDashboard && (section || "overview") === item.section;
  }
  if (item.exact) return pathname === item.to;
  return pathname === item.to || pathname.startsWith(item.to + "/");
}

export function itemHref(item) {
  return item.section && item.section !== "overview" ? `${item.to}?section=${item.section}` : item.to;
}
