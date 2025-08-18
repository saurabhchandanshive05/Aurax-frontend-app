import React from 'react';

const CreatorCard = ({ creator }) => (
  <div className="border rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow">
    <div className="flex items-center mb-3">
      <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
      <div className="ml-4">
        <h3 className="text-lg font-semibold">{creator.name}</h3>
        <p className="text-sm text-gray-600">{creator.niche}</p>
      </div>
    </div>
    
    <div className="grid grid-cols-3 gap-2 text-center">
      <div>
        <p className="font-bold">{creator.followers.instagram}</p>
        <p className="text-xs">Instagram</p>
      </div>
      <div>
        <p className="font-bold">{creator.followers.youtube}</p>
        <p className="text-xs">YouTube</p>
      </div>
      <div>
        <p className="font-bold">{creator.followers.tiktok}</p>
        <p className="text-xs">TikTok</p>
      </div>
    </div>
    
    <button className="mt-3 w-full py-2 bg-blue-100 hover:bg-blue-200 rounded-md text-sm">
      View Profile
    </button>
  </div>
);

export default CreatorCard;