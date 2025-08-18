import React, { useState, useEffect } from "react";
import { getStorageItem } from "../utils/localStorage";
import CampaignForm from "../components/campaigns/CampaignForm";
import CampaignList from "../components/campaigns/CampaignList";

const CampaignManager = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const storedCampaigns = getStorageItem("campaigns") || [];
    setCampaigns(storedCampaigns);
  }, []);

  const handleNewCampaign = (newCampaign) => {
    setCampaigns((prev) => [...prev, newCampaign]);
    setShowForm(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Campaign Manager</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {showForm ? "Cancel" : "Create Campaign"}
        </button>
      </div>

      {showForm ? (
        <CampaignForm onSuccess={handleNewCampaign} />
      ) : (
        <CampaignList campaigns={campaigns} />
      )}
    </div>
  );
};

export default CampaignManager;
