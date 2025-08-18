import React, { useState, useEffect } from "react";
import { getStorageItem } from "../utils/localStorage";

const BrandDashboard = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [brand, setBrand] = useState(null);

  useEffect(() => {
    const storedCampaigns = getStorageItem("campaigns") || [];
    const brandUser = getStorageItem("brandUser");
    setCampaigns(storedCampaigns);
    setBrand(brandUser);
  }, []);

  if (!brand) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Welcome, {brand.name}</h1>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Your Campaigns</h2>
        {campaigns.length === 0 ? (
          <p>No campaigns found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="border rounded-lg p-4 shadow-sm"
              >
                <h3 className="font-bold text-lg mb-2">{campaign.title}</h3>
                <p className="text-gray-600 mb-2">Brand: {campaign.brand}</p>
                <p className="text-gray-600 mb-2">Status: {campaign.status}</p>
                <p className="text-gray-600 mb-4">
                  Creators: {campaign.creators.length}
                </p>
                <button className="w-full py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200">
                  View Details
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BrandDashboard;
