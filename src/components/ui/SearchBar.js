import React from "react";

const SearchBar = ({ onSearch }) => {
  const handleChange = (e) => {
    onSearch(e.target.value);
  };

  return (
    <div className="col-span-2">
      <label className="block mb-1 font-medium">Search Creators</label>
      <input
        type="text"
        placeholder="Search by name or niche..."
        onChange={handleChange}
        className="w-full p-2 border rounded"
      />
    </div>
  );
};

export default SearchBar;
