import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Icon from "../ui/Icon";
import { APP_NAV, isItemActive, itemHref } from "./appNav";
import "./AppShell.css";

function displayName(user) {
  return user?.fullName || user?.name || user?.username || user?.email || "Account";
}

function Mark() {
  return (
    <Link to="/" className="axs-mark" aria-label="AURAX home">
      <span className="axs-mark__ring" aria-hidden="true" />
      <span className="axs-mark__word">AURAX</span>
    </Link>
  );
}

function NavList({ nav, pathname, section, onNavigate }) {
  return nav.groups.map((group, gi) => (
    <div className="axs-group" key={gi}>
      {group.title && <p className="axs-group__title">{group.title}</p>}
      <ul>
        {group.items.map((item) => {
          const active = isItemActive(item, pathname, section);
          return (
            <li key={item.label}>
              <Link
                to={itemHref(item)}
                className={`axs-link${active ? " is-active" : ""}`}
                aria-current={active ? "page" : undefined}
                onClick={onNavigate}
              >
                <Icon name={item.icon} size={18} />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  ));
}

export default function AppShell({ area, children }) {
  const { currentUser, logout } = useAuth();
  const { pathname, search } = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const nav = APP_NAV[area];
  const section = new URLSearchParams(search).get("section");

  const allItems = useMemo(() => nav.groups.flatMap((g) => g.items), [nav]);
  const current = allItems.find((i) => isItemActive(i, pathname, section));
  const tabs = allItems.filter((i) => i.tab).slice(0, 4);

  // Close the drawer on navigation and on Escape.
  useEffect(() => setDrawerOpen(false), [pathname, search]);
  useEffect(() => {
    if (!drawerOpen) return undefined;
    const onKey = (e) => e.key === "Escape" && setDrawerOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  const name = displayName(currentUser);

  // Preserve existing behaviour: the creator dashboard asked for confirmation before
  // signing out; admin sign-out did not. (Changing this is a separate, pending decision.)
  const signOut = () => {
    if (area === "creator" && !window.confirm("Are you sure you want to logout?")) return;
    logout();
  };

  const rail = (
    <>
      <div className="axs-rail__head">
        <Mark />
        <span className="axs-area">{nav.label}</span>
      </div>
      <nav className="axs-rail__nav" aria-label={`${nav.label} navigation`}>
        <NavList nav={nav} pathname={pathname} section={section} />
      </nav>
      <div className="axs-rail__foot">
        <Link to="/" className="axs-link axs-link--quiet">
          <Icon name="arrow-left" size={18} />
          <span>Back to site</span>
        </Link>
        <div className="axs-user">
          <span className="axs-user__avatar" aria-hidden="true">
            {name.charAt(0).toUpperCase()}
          </span>
          <span className="axs-user__text">
            <span className="axs-user__name">{name}</span>
            {currentUser?.email && <span className="axs-user__meta">{currentUser.email}</span>}
          </span>
          <button type="button" className="axs-icon-btn" onClick={signOut} aria-label="Sign out" title="Sign out">
            <Icon name="logout" size={18} />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className={`axs axs--${area}`}>
      <a href="#axs-content" className="axs-skip">Skip to content</a>

      <aside className="axs-rail">{rail}</aside>

      {drawerOpen && (
        <div className="axs-drawer" role="dialog" aria-modal="true" aria-label={`${nav.label} menu`}>
          <button type="button" className="axs-drawer__scrim" aria-label="Close menu" onClick={() => setDrawerOpen(false)} />
          <div className="axs-drawer__panel">
            <button
              type="button"
              className="axs-icon-btn axs-drawer__close"
              aria-label="Close menu"
              autoFocus
              onClick={() => setDrawerOpen(false)}
            >
              <Icon name="x" />
            </button>
            {rail}
          </div>
        </div>
      )}

      <div className="axs-main">
        <header className="axs-top">
          <button
            type="button"
            className="axs-icon-btn axs-top__menu"
            aria-label="Open menu"
            aria-expanded={drawerOpen}
            onClick={() => setDrawerOpen(true)}
          >
            <Icon name="menu" />
          </button>
          <div className="axs-top__mobile-mark"><Mark /></div>
          <p className="axs-top__title">{current?.label || nav.label}</p>
          <div className="axs-top__end">
            <Link to="/live/campaigns" className="axs-live">
              <span className="axs-live__dot" aria-hidden="true" />
              LIVE
            </Link>
          </div>
        </header>

        <div id="axs-content" className="axs-content" tabIndex={-1}>
          {children}
        </div>
      </div>

      {tabs.length > 0 && (
        <nav className="axs-tabs" aria-label={`${nav.label} shortcuts`}>
          {tabs.map((item) => {
            const active = isItemActive(item, pathname, section);
            return (
              <Link
                key={item.label}
                to={itemHref(item)}
                className={`axs-tab${active ? " is-active" : ""}`}
                aria-current={active ? "page" : undefined}
              >
                <Icon name={item.icon} size={20} />
                <span>{item.short || item.label}</span>
              </Link>
            );
          })}
        </nav>
      )}
    </div>
  );
}

/* Minimal frame for onboarding steps: brand mark, sign out, the step itself. */
export function FocusShell({ children }) {
  const { currentUser, logout } = useAuth();
  return (
    <div className="axs-focus">
      <header className="axs-focus__top">
        <Mark />
        {currentUser && (
          <button type="button" className="ax-btn ax-btn--ghost axs-focus__out" onClick={logout}>
            Sign out
          </button>
        )}
      </header>
      <div className="axs-focus__body">{children}</div>
    </div>
  );
}
