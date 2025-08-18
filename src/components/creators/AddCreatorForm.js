import React, { useState } from "react";
import { useCreators } from "../../hooks/useLocalStorage";

// Simple Alert component
const Alert = ({ type, message }) => (
  <div className={`alert alert-${type} p-2 mb-4 rounded`}>{message}</div>
);

const AddCreatorForm = () => {
  const { addCreator } = useCreators();
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    followers: "",
  });
  const [status, setStatus] = useState({ type: "", message: "" });

  const handleSubmit = (e) => {
    e.preventDefault();
    addCreator({ ...formData, id: Date.now() });
    setStatus({ type: "success", message: "Creator added successfully!" });
    setFormData({ name: "", username: "", followers: "" });
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto">
      {status.message && <Alert type={status.type} message={status.message} />}

      <div className="mb-4">
        <label className="block mb-1">Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full p-2 border rounded"
          required
        />
      </div>

      <div className="mb-4">
        <label className="block mb-1">Username</label>
        <input
          type="text"
          value={formData.username}
          onChange={(e) =>
            setFormData({ ...formData, username: e.target.value })
          }
          className="w-full p-2 border rounded"
          required
        />
      </div>

      <div className="mb-4">
        <label className="block mb-1">Followers</label>
        <input
          type="number"
          value={formData.followers}
          onChange={(e) =>
            setFormData({ ...formData, followers: e.target.value })
          }
          className="w-full p-2 border rounded"
          required
        />
      </div>

      <button
        type="submit"
        className="bg-blue-500 text-white p-2 rounded w-full"
      >
        Add Creator
      </button>
    </form>
  );
};

export default AddCreatorForm;
