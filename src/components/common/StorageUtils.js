// Helper functions for localStorage
export const getLocalItem = (key) => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
};

export const setLocalItem = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const addCreator = (creator) => {
  const creators = getLocalItem('creators') || [];
  const newCreator = { 
    ...creator, 
    id: 'creator_' + Date.now(),
    createdAt: new Date().toISOString()
  };
  const updated = [...creators, newCreator];
  setLocalItem('creators', updated);
  return newCreator;
};

export const updateCreator = (id, updatedData) => {
  const creators = getLocalItem('creators') || [];
  const updated = creators.map(creator => 
    creator.id === id ? { ...creator, ...updatedData } : creator
  );
  setLocalItem('creators', updated);
  return updated.find(c => c.id === id);
};

export const addCampaign = (campaign) => {
  const campaigns = getLocalItem('campaigns') || [];
  const newCampaign = { 
    ...campaign, 
    id: 'campaign_' + Date.now(),
    createdAt: new Date().toISOString(),
    status: campaign.status || 'Draft'
  };
  const updated = [...campaigns, newCampaign];
  setLocalItem('campaigns', updated);
  return newCampaign;
};

// Initialize dummy data if empty
export const initializeData = () => {
  if (!getLocalItem('creators')) {
    setLocalItem('creators', [
      {
        id: 'creator_1',
        name: 'Alex Johnson',
        bio: 'Travel & Lifestyle Creator',
        niche: 'Travel',
        platforms: [
          { name: 'Instagram', handle: '@alexj', followers: '54K' },
          { name: 'YouTube', handle: 'AlexVlogs', subscribers: '120K' }
        ],
        engagementRate: 8.2,
        email: 'alex@example.com',
        createdAt: '2024-01-15T08:30:00Z'
      },
      {
        id: 'creator_2',
        name: 'Taylor Smith',
        bio: 'Fashion and beauty expert',
        niche: 'Fashion',
        platforms: [
          { name: 'Instagram', handle: '@taystyle', followers: '112K' },
          { name: 'TikTok', handle: '@taystyle', followers: '230K' }
        ],
        engagementRate: 12.5,
        email: 'taylor@example.com',
        createdAt: '2024-02-20T14:45:00Z'
      }
    ]);
  }

  if (!getLocalItem('campaigns')) {
    setLocalItem('campaigns', [
      {
        id: 'campaign_1',
        name: 'Summer Collection 2024',
        brand: 'Ocean Wear',
        brandId: 'brand_1',
        creators: ['creator_1'],
        status: 'Active',
        startDate: '2024-06-01',
        endDate: '2024-08-31',
        createdAt: '2024-05-10T09:15:00Z'
      }
    ]);
  }
};