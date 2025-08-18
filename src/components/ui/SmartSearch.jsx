import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";
import "../../styles/design-system.css";

const SmartSearch = ({
  placeholder = "Search creators, brands, or campaigns...",
  onSearch,
  onResultSelect,
  className = "",
  enableAI = true,
  showTrending = true,
  categories = ["creators", "brands", "campaigns", "content"],
}) => {
  const { currentTheme } = useTheme();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [trendingItems, setTrendingItems] = useState([]);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const searchRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    // Simulate trending items
    setTrendingItems([
      {
        id: 1,
        text: "sustainable fashion",
        type: "topic",
        count: "12.5K searches",
      },
      { id: 2, text: "tech reviews", type: "niche", count: "8.3K searches" },
      {
        id: 3,
        text: "fitness influencers",
        type: "category",
        count: "15.7K searches",
      },
      {
        id: 4,
        text: "brand partnerships",
        type: "opportunity",
        count: "6.2K searches",
      },
    ]);
  }, []);

  useEffect(() => {
    if (query.length > 2) {
      setIsLoading(true);
      // Simulate AI-powered search with debouncing
      const timeoutId = setTimeout(() => {
        performSearch(query);
      }, 300);
      return () => clearTimeout(timeoutId);
    } else {
      setResults([]);
      setIsLoading(false);
    }
  }, [query, selectedCategory]);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const performSearch = async (searchQuery) => {
    // Simulate AI-powered search results
    const mockResults = [
      {
        id: 1,
        type: "creator",
        title: "Sarah Johnson",
        subtitle: "Fashion & Lifestyle • 142K followers",
        thumbnail: null,
        confidence: 0.95,
        tags: ["fashion", "lifestyle", "sustainability"],
      },
      {
        id: 2,
        type: "brand",
        title: "EcoWear Co.",
        subtitle: "Sustainable Fashion Brand",
        thumbnail: null,
        confidence: 0.88,
        tags: ["sustainable", "fashion", "eco-friendly"],
      },
      {
        id: 3,
        type: "campaign",
        title: "Summer Collection 2024",
        subtitle: "Fashion Campaign • 15 creators",
        thumbnail: null,
        confidence: 0.82,
        tags: ["summer", "fashion", "collaboration"],
      },
      {
        id: 4,
        type: "content",
        title: "Sustainable Fashion Trends",
        subtitle: "Trending content topic",
        thumbnail: null,
        confidence: 0.79,
        tags: ["trends", "sustainable", "fashion"],
      },
    ];

    // Filter by category
    const filteredResults =
      selectedCategory === "all"
        ? mockResults
        : mockResults.filter((result) => result.type === selectedCategory);

    // Simulate AI suggestions
    if (enableAI) {
      setAiSuggestions([
        `Similar: "${searchQuery}" in trending niches`,
        `AI Match: Creators with ${searchQuery} expertise`,
        `Suggested: ${searchQuery} + micro-influencers`,
      ]);
    }

    setResults(filteredResults);
    setIsLoading(false);
    setShowDropdown(true);
  };

  const handleResultClick = (result) => {
    setQuery(result.title);
    setShowDropdown(false);
    if (onResultSelect) {
      onResultSelect(result);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(query, selectedCategory);
    }
    setShowDropdown(false);
  };

  const getResultIcon = (type) => {
    const icons = {
      creator: "👤",
      brand: "🏢",
      campaign: "📊",
      content: "📝",
    };
    return icons[type] || "🔍";
  };

  const containerVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.2 },
    },
  };

  return (
    <div className={`relative w-full max-w-2xl ${className}`} ref={searchRef}>
      {/* Search Input Container */}
      <motion.div
        className="glass-card p-1"
        whileFocus={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        <form onSubmit={handleSearch} className="flex items-center">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-transparent border-none text-sm px-3 py-2 rounded-l-lg focus:outline-none cursor-pointer"
            style={{ color: currentTheme.textPrimary }}
          >
            <option value="all">All</option>
            {categories.map((cat) => (
              <option key={cat} value={cat} className="bg-gray-800">
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>

          {/* Search Input */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setShowDropdown(true)}
              placeholder={placeholder}
              className="w-full px-4 py-3 bg-transparent border-none rounded-lg focus:outline-none text-white placeholder-gray-400"
              style={{ color: currentTheme.textPrimary }}
            />

            {/* AI Badge */}
            {enableAI && query.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute right-16 top-1/2 transform -translate-y-1/2"
              >
                <span className="px-2 py-1 text-xs rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                  AI
                </span>
              </motion.div>
            )}
          </div>

          {/* Search Button */}
          <motion.button
            type="submit"
            className="px-4 py-3 rounded-r-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            )}
          </motion.button>
        </form>
      </motion.div>

      {/* Search Results Dropdown */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            ref={dropdownRef}
            className="absolute top-full left-0 right-0 mt-2 z-50"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <div className="glass-card max-h-96 overflow-y-auto">
              {/* Trending Section */}
              {showTrending && query.length === 0 && (
                <div className="p-4 border-b border-gray-700">
                  <h3 className="text-sm font-semibold text-gray-300 mb-3">
                    🔥 Trending Now
                  </h3>
                  <div className="space-y-2">
                    {trendingItems.map((item, index) => (
                      <motion.div
                        key={item.id}
                        variants={itemVariants}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors"
                        onClick={() => setQuery(item.text)}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-orange-400">#</span>
                          <div>
                            <span className="text-white">{item.text}</span>
                            <span className="text-xs text-gray-400 ml-2">
                              {item.type}
                            </span>
                          </div>
                        </div>
                        <span className="text-xs text-gray-500">
                          {item.count}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Suggestions */}
              {enableAI && aiSuggestions.length > 0 && query.length > 0 && (
                <div className="p-4 border-b border-gray-700">
                  <h3 className="text-sm font-semibold text-purple-400 mb-3">
                    🤖 AI Suggestions
                  </h3>
                  <div className="space-y-2">
                    {aiSuggestions.map((suggestion, index) => (
                      <motion.div
                        key={index}
                        variants={itemVariants}
                        className="p-2 rounded-lg hover:bg-purple-500/10 cursor-pointer transition-colors text-purple-300 text-sm"
                        onClick={() =>
                          setQuery(suggestion.split(": ")[1] || suggestion)
                        }
                      >
                        {suggestion}
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Search Results */}
              {results.length > 0 && (
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-gray-300 mb-3">
                    Search Results
                  </h3>
                  <div className="space-y-2">
                    {results.map((result, index) => (
                      <motion.div
                        key={result.id}
                        variants={itemVariants}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 cursor-pointer transition-colors group"
                        onClick={() => handleResultClick(result)}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-lg">
                            {getResultIcon(result.type)}
                          </span>
                          <div>
                            <div className="text-white group-hover:text-blue-400 transition-colors">
                              {result.title}
                            </div>
                            <div className="text-sm text-gray-400">
                              {result.subtitle}
                            </div>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {result.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="text-xs px-2 py-1 bg-gray-700 rounded-full text-gray-300"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          {enableAI && (
                            <div className="text-xs text-gray-500">
                              {Math.round(result.confidence * 100)}% match
                            </div>
                          )}
                          <svg
                            className="w-4 h-4 text-gray-400 group-hover:text-blue-400 transition-colors"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* No Results */}
              {query.length > 2 && results.length === 0 && !isLoading && (
                <div className="p-8 text-center">
                  <div className="text-4xl mb-4">🔍</div>
                  <div className="text-gray-400">
                    No results found for "{query}"
                  </div>
                  <div className="text-sm text-gray-500 mt-2">
                    Try adjusting your search or browse trending topics above
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SmartSearch;

