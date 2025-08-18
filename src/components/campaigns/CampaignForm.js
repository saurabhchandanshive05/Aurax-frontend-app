import React, { useState } from "react";
import { useCampaigns } from "../../hooks/useLocalStorage";

// Simple Alert component
const Alert = ({ type, message }) => (
  <div className={`alert alert-${type} p-2 mb-4 rounded`}>{message}</div>
);

const CampaignForm = () => {
  const { addCampaign } = useCampaigns();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    budget: "",
  });
  const [status, setStatus] = useState({ type: "", message: "" });

  const handleSubmit = (e) => {
    e.preventDefault();
    addCampaign({ ...formData, id: Date.now() });
    setStatus({ type: "success", message: "Campaign created successfully!" });
    setFormData({ title: "", description: "", budget: "" });
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto">
      {status.message && <Alert type={status.type} message={status.message} />}

      <div className="mb-4">
        <label className="block mb-1">Title</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full p-2 border rounded"
          required
        />
      </div>

      <div className="mb-4">
        <label className="block mb-1">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          className="w-full p-2 border rounded"
          required
        />
      </div>

      <div className="mb-4">
        <label className="block mb-1">Budget ($)</label>
        <input
          type="number"
          value={formData.budget}
          onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
          className="w-full p-2 border rounded"
          required
        />
      </div>

      <button
        type="submit"
        className="bg-blue-500 text-white p-2 rounded w-full"
      >
        Create Campaign
      </button>
    </form>
  );
};

export default CampaignForm;
