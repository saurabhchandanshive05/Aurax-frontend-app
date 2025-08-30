import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Doughnut, Line } from "react-chartjs-2";
import { useTheme } from "../../context/ThemeContext";

const SentimentAnalysis = ({ contentId, timeRange = "7d" }) => {
  const { currentTheme } = useTheme();
  const [sentimentData, setSentimentData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate sentiment analysis data
    setTimeout(() => {
      setSentimentData({
        overall: {
          score: 0.78,
          sentiment: "Positive",
          confidence: 0.89,
        },
        breakdown: {
          positive: 65,
          neutral: 28,
          negative: 7,
        },
        trends: {
          labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
          positive: [62, 68, 71, 69, 75, 78, 65],
          negative: [12, 8, 6, 9, 5, 7, 7],
        },
        keywords: [
          { word: "amazing", sentiment: "positive", count: 234 },
          { word: "love", sentiment: "positive", count: 189 },
          { word: "disappointed", sentiment: "negative", count: 23 },
          { word: "perfect", sentiment: "positive", count: 156 },
        ],
      });
      setIsLoading(false);
    }, 1000);
  }, [contentId, timeRange]);

  if (isLoading) {
    return (
      <div className="glass-card p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-700 rounded w-1/3"></div>
          <div className="h-32 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  const getSentimentColor = (sentiment) => {
    const colors = {
      positive: "#10B981",
      neutral: "#F59E0B",
      negative: "#EF4444",
    };
    return colors[sentiment.toLowerCase()] || colors.neutral;
  };

  const doughnutData = {
    labels: ["Positive", "Neutral", "Negative"],
    datasets: [
      {
        data: [
          sentimentData.breakdown.positive,
          sentimentData.breakdown.neutral,
          sentimentData.breakdown.negative,
        ],
        backgroundColor: ["#10B981", "#F59E0B", "#EF4444"],
        borderWidth: 0,
      },
    ],
  };

  const lineData = {
    labels: sentimentData.trends.labels,
    datasets: [
      {
        label: "Positive",
        data: sentimentData.trends.positive,
        borderColor: "#10B981",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        tension: 0.4,
      },
      {
        label: "Negative",
        data: sentimentData.trends.negative,
        borderColor: "#EF4444",
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        tension: 0.4,
      },
    ],
  };

  return (
    <motion.div
      className="glass-card p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">Sentiment Analysis</h3>
        <div className="flex items-center space-x-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{
              backgroundColor: getSentimentColor(
                sentimentData.overall.sentiment
              ),
            }}
          />
          <span className="text-sm text-gray-300">
            {sentimentData.overall.sentiment} (
            {Math.round(sentimentData.overall.score * 100)}%)
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Overall Score */}
        <div className="space-y-4">
          <div className="text-center">
            <div
              className="text-3xl font-bold mb-2"
              style={{
                color: getSentimentColor(sentimentData.overall.sentiment),
              }}
            >
              {Math.round(sentimentData.overall.score * 100)}%
            </div>
            <div className="text-gray-400 text-sm">Overall Sentiment Score</div>
          </div>

          <div className="h-48">
            <Doughnut
              data={doughnutData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: "bottom",
                    labels: { color: "#9CA3AF" },
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Trend Chart */}
        <div>
          <h4 className="text-lg font-semibold mb-4 text-white">
            Sentiment Trends
          </h4>
          <div className="h-48">
            <Line
              data={lineData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  x: {
                    ticks: { color: "#9CA3AF" },
                    grid: { color: "rgba(156, 163, 175, 0.1)" },
                  },
                  y: {
                    ticks: { color: "#9CA3AF" },
                    grid: { color: "rgba(156, 163, 175, 0.1)" },
                  },
                },
                plugins: {
                  legend: {
                    labels: { color: "#9CA3AF" },
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* Keywords */}
      <div className="mt-6">
        <h4 className="text-lg font-semibold mb-4 text-white">Top Keywords</h4>
        <div className="flex flex-wrap gap-2">
          {sentimentData.keywords.map((keyword, index) => (
            <motion.span
              key={index}
              className="px-3 py-1 rounded-full text-sm font-medium"
              style={{
                backgroundColor: `${getSentimentColor(keyword.sentiment)}20`,
                color: getSentimentColor(keyword.sentiment),
                border: `1px solid ${getSentimentColor(keyword.sentiment)}40`,
              }}
              whileHover={{ scale: 1.05 }}
            >
              {keyword.word} ({keyword.count})
            </motion.span>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default SentimentAnalysis;
