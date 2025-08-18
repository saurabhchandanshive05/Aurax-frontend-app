import React, { useState, useEffect } from "react";
import { getStorageItem } from "../utils/localStorage";

const Analytics = () => {
  const [creators, setCreators] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const storedCreators = getStorageItem("creators") || [];
    const storedCampaigns = getStorageItem("campaigns") || [];

    setCreators(storedCreators);
    setCampaigns(storedCampaigns);

    // Calculate basic stats
    if (storedCreators.length > 0) {
      const totalCreators = storedCreators.length;
      const niches = [...new Set(storedCreators.map((c) => c.niche))];
      const totalFollowers = storedCreators.reduce((sum, creator) => {
        return (
          sum +
          creator.platforms.reduce((platformSum, platform) => {
            const followers = parseInt(platform.followers) || 0;
            return platformSum + followers;
          }, 0)
        );
      }, 0);

      setStats({
        totalCreators,
        totalCampaigns: storedCampaigns.length,
        niches: niches.length,
        totalFollowers,
      });
    }
  }, []);

  if (!stats) {
    return <div className="text-center py-12">Loading analytics...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Analytics Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-2">Total Creators</h3>
          <p className="text-3xl font-bold">{stats.totalCreators}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-2">Active Campaigns</h3>
          <p className="text-3xl font-bold">{stats.totalCampaigns}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-2">Niche Categories</h3>
          <p className="text-3xl font-bold">{stats.niches}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-2">Total Reach</h3>
          <p className="text-3xl font-bold">
            {(stats.totalFollowers / 1000).toFixed(1)}K
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
        <h3 className="text-lg font-semibold mb-4">Top Niches</h3>
        <div className="flex flex-wrap gap-4">
          {[...new Set(creators.map((c) => c.niche))]
            .slice(0, 5)
            .map((niche, index) => (
              <div
                key={index}
                className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full"
              >
                {niche}
              </div>
            ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Recent Campaigns</h3>
        <ul className="space-y-3">
          {campaigns.slice(0, 3).map((campaign) => (
            <li
              key={campaign.id}
              className="flex justify-between border-b pb-2"
            >
              <span className="font-medium">{campaign.title}</span>
              <span>
                {campaign.brand} - {campaign.status}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Analytics;
