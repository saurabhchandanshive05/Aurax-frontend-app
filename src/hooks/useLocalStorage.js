import { useState, useEffect } from "react";
import {
  getStorageItem,
  setStorageItem,
  removeStorageItem,
} from "../utils/localStorage";

// Hook for managing creators
export const useCreators = () => {
  const [creators, setCreators] = useState([]);

  // Load creators from localStorage
  useEffect(() => {
    const storedCreators = getStorageItem("creators") || [];
    setCreators(storedCreators);
  }, []);

  // Save creators to localStorage
  useEffect(() => {
    setStorageItem("creators", creators);
  }, [creators]);

  const addCreator = (creator) => {
    setCreators([...creators, creator]);
  };

  const updateCreator = (id, updatedCreator) => {
    setCreators(
      creators.map((creator) => (creator.id === id ? updatedCreator : creator))
    );
  };

  const deleteCreator = (id) => {
    setCreators(creators.filter((creator) => creator.id !== id));
  };

  return {
    creators,
    addCreator,
    updateCreator,
    deleteCreator,
  };
};

// Hook for managing campaigns
export const useCampaigns = () => {
  const [campaigns, setCampaigns] = useState([]);

  // Load campaigns from localStorage
  useEffect(() => {
    const storedCampaigns = getStorageItem("campaigns") || [];
    setCampaigns(storedCampaigns);
  }, []);

  // Save campaigns to localStorage
  useEffect(() => {
    setStorageItem("campaigns", campaigns);
  }, [campaigns]);

  const addCampaign = (campaign) => {
    setCampaigns([...campaigns, campaign]);
  };

  const updateCampaign = (id, updatedCampaign) => {
    setCampaigns(
      campaigns.map((campaign) =>
        campaign.id === id ? updatedCampaign : campaign
      )
    );
  };

  const deleteCampaign = (id) => {
    setCampaigns(campaigns.filter((campaign) => campaign.id !== id));
  };

  return {
    campaigns,
    addCampaign,
    updateCampaign,
    deleteCampaign,
  };
};
