// Initial data to seed localStorage
export const initialCreators = [
  {
    id: 1,
    name: "Alex Johnson",
    bio: "Travel & Lifestyle content creator",
    niche: "Travel",
    followers: {
      instagram: 125000,
      youtube: 45000,
      tiktok: 210000
    },
    engagementRate: 4.8,
    email: "alex@example.com",
    phone: "+1234567890",
    location: "Los Angeles, CA",
    tags: ["adventure", "luxury", "photography"]
  },
  // More creators...
];

export const initialCampaigns = [
  {
    id: 1001,
    title: "Summer Beachwear 2023",
    brand: "Ocean Blue Apparel",
    description: "Promote new summer collection",
    startDate: "2023-06-01",
    endDate: "2023-08-31",
    assignedCreators: [1, 3, 5],
    status: "Active",
    budget: 15000,
    createdAt: "2023-05-15T10:30:00Z"
  },
  // More campaigns...
];