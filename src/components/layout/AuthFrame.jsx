import React from "react";
import { Link } from "react-router-dom";
import "./AuthFrame.css";

const COPY = {
  creator: {
    title: "Your page, your brand deals, one place.",
    points: [
      "Apply to LIVE brand campaigns",
      "Sell subscriptions and paid requests",
      "Show brands your real Instagram numbers",
    ],
  },
  brand: {
    title: "Find creators who already reach your customers.",
    points: [
      "Search creators by niche and city",
      "Post a requirement to the LIVE board",
      "Every creator is reviewed before listing",
    ],
  },
  signup: {
    title: "Join the network brands and creators trust.",
    points: [
      "Creators: build your page and apply to campaigns",
      "Brands: find and brief reviewed creators",
      "Free to join",
    ],
  },
};

/* Split-screen frame for sign-in and sign-up forms. The form itself is the child. */
export default function AuthFrame({ audience = "creator", children }) {
  const copy = COPY[audience] || COPY.creator;
  return (
    <div className="ax-auth">
      <aside className="ax-auth__aside" aria-hidden="false">
        <Link to="/" className="ax-auth__mark" aria-label="AURAX home">
          <span className="ax-auth__ring" aria-hidden="true" />
          AURAX
        </Link>
        <div className="ax-auth__pitch">
          <p className="ax-auth__title">{copy.title}</p>
          <ul className="ax-auth__points">
            {copy.points.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
        <span className="ax-auth__halo" aria-hidden="true" />
      </aside>
      <div className="ax-auth__form">{children}</div>
    </div>
  );
}
