import { useEffect, useState } from "react";
import { getApiEndpoint } from "../utils/getApiUrl";

// Real platform numbers for the For Brands / For Creators pages. A number is only shown once
// the API has answered; nothing is invented while loading or if the API is unavailable.
export default function useAudienceNumbers() {
  const [numbers, setNumbers] = useState({ liveCampaigns: null, creators: null });

  useEffect(() => {
    let cancelled = false;
    const get = (url) =>
      fetch(getApiEndpoint(url))
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null);
    Promise.all([get("/api/public/campaigns/stats/overview"), get("/api/public/creators?limit=1")]).then(
      ([stats, creators]) => {
        if (cancelled) return;
        setNumbers({
          liveCampaigns: stats?.data ? stats.data.totalLiveCampaigns ?? null : null,
          creators: creators?.success ? creators.total ?? null : null,
        });
      }
    );
    return () => {
      cancelled = true;
    };
  }, []);

  return numbers;
}
