import React from "react";
import AddCreatorForm from "../components/creators/AddCreatorForm";

const AddTalent = () => {
  const handleSuccess = () => {
    alert("Creator added successfully!");
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Add New Talent</h1>
      <AddCreatorForm onSuccess={handleSuccess} />
    </div>
  );
};

export default AddTalent;
