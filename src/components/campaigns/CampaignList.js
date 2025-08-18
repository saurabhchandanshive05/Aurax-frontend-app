import React from "react";
import { Link } from "react-router-dom";

const CampaignList = ({ campaigns }) => {
  if (campaigns.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">No campaigns found</div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {campaigns.map((campaign) => (
        <div
          key={campaign.id}
          className="border rounded-lg p-4 shadow-sm hover:shadow-md transition"
        >
          <h3 className="font-bold text-lg mb-2">{campaign.title}</h3>
          <p className="text-gray-600 mb-2">Brand: {campaign.brand}</p>
          <p className="text-gray-600 mb-2">Status: {campaign.status}</p>
          <p className="text-gray-600 mb-4">
            Creators: {campaign.creators.length}
          </p>
          <Link
            to={`/campaigns/${campaign.id}`}
            className="block text-center py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
          >
            View Details
          </Link>
        </div>
      ))}
    </div>
  );
};

export default CampaignList;
