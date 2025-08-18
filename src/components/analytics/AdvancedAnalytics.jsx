import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Line, Bar, Doughnut, Radar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { useTheme } from "../../context/ThemeContext";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

const AdvancedAnalytics = ({ creatorId }) => {
  const { currentTheme } = useTheme();
  const [timeRange, setTimeRange] = useState("30d");
  const [selectedMetric, setSelectedMetric] = useState("engagement");
  const [analyticsData, setAnalyticsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [realTimeData, setRealTimeData] = useState({
    followers: 0,
    engagement: 0,
    reach: 0,
    impressions: 0,
  });

  const timeRanges = [
    { id: "7d", label: "7 Days" },
    { id: "30d", label: "30 Days" },
    { id: "90d", label: "90 Days" },
    { id: "1y", label: "1 Year" },
  ];

  const metrics = [
    {
      id: "engagement",
      label: "Engagement Rate",
      icon: "📈",
      color: "#00d4ff",
    },
    { id: "reach", label: "Reach", icon: "👥", color: "#00ff88" },
    { id: "impressions", label: "Impressions", icon: "👁️", color: "#ff0080" },
    { id: "followers", label: "Followers", icon: "👤", color: "#8a2be2" },
  ];

  // Mock data generation
  const generateMockData = (range) => {
    const days =
      range === "7d" ? 7 : range === "30d" ? 30 : range === "90d" ? 90 : 365;
    const labels = [];
    const engagementData = [];
    const reachData = [];
    const impressionsData = [];
    const followersData = [];

    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (days - i - 1));
      labels.push(
        date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
      );

      engagementData.push(Math.random() * 5 + 2);
      reachData.push(Math.random() * 10000 + 5000);
      impressionsData.push(Math.random() * 15000 + 8000);
      followersData.push(Math.random() * 100 + 50);
    }

    return {
      labels,
      datasets: {
        engagement: engagementData,
        reach: reachData,
        impressions: impressionsData,
        followers: followersData,
      },
    };
  };

  useEffect(() => {
    const loadAnalytics = async () => {
      setIsLoading(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setAnalyticsData(generateMockData(timeRange));
      setIsLoading(false);
    };

    loadAnalytics();
  }, [timeRange]);

  // Real-time data simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeData((prev) => ({
        followers: prev.followers + Math.floor(Math.random() * 3),
        engagement: prev.engagement + (Math.random() * 0.1 - 0.05),
        reach: prev.reach + Math.floor(Math.random() * 50),
        impressions: prev.impressions + Math.floor(Math.random() * 100),
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "#ffffff",
        bodyColor: "#ffffff",
        borderColor: currentTheme.colors.primary,
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
      },
    },
    scales: {
      x: {
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
        ticks: {
          color: "rgba(255, 255, 255, 0.7)",
        },
      },
      y: {
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
        ticks: {
          color: "rgba(255, 255, 255, 0.7)",
        },
      },
    },
  };

  const getChartData = (metric) => {
    if (!analyticsData) return null;

    const colors = {
      engagement: ["#00d4ff", "#0099cc"],
      reach: ["#00ff88", "#00cc6a"],
      impressions: ["#ff0080", "#cc0066"],
      followers: ["#8a2be2", "#6a1b9a"],
    };

    return {
      labels: analyticsData.labels,
      datasets: [
        {
          label: metrics.find((m) => m.id === metric)?.label,
          data: analyticsData.datasets[metric],
          borderColor: colors[metric][0],
          backgroundColor: colors[metric][1] + "20",
          fill: true,
          tension: 0.4,
          pointBackgroundColor: colors[metric][0],
          pointBorderColor: "#ffffff",
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    };
  };

  const audienceData = {
    labels: ["18-24", "25-34", "35-44", "45-54", "55+"],
    datasets: [
      {
        data: [45, 30, 15, 7, 3],
        backgroundColor: [
          "#00d4ff",
          "#00ff88",
          "#ff0080",
          "#8a2be2",
          "#ff6b35",
        ],
        borderWidth: 0,
      },
    ],
  };

  const platformData = {
    labels: ["Instagram", "TikTok", "YouTube", "Twitter"],
    datasets: [
      {
        data: [40, 35, 15, 10],
        backgroundColor: ["#E4405F", "#000000", "#FF0000", "#1DA1F2"],
        borderWidth: 0,
      },
    ],
  };

  const performanceData = {
    labels: [
      "Engagement",
      "Reach",
      "Impressions",
      "Clicks",
      "Shares",
      "Comments",
    ],
    datasets: [
      {
        label: "Current Performance",
        data: [85, 70, 90, 60, 75, 80],
        backgroundColor: "rgba(0, 212, 255, 0.2)",
        borderColor: "#00d4ff",
        borderWidth: 2,
        pointBackgroundColor: "#00d4ff",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
      },
    ],
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        variants={itemVariants}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-2xl font-bold gradient-text mb-2">
            Advanced Analytics
          </h2>
          <p className="text-white/60">
            Comprehensive insights and performance metrics
          </p>
        </div>

        {/* Time Range Selector */}
        <div className="flex gap-2">
          {timeRanges.map((range) => (
            <motion.button
              key={range.id}
              className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                timeRange === range.id
                  ? "glass-card ring-2 ring-current ring-opacity-50"
                  : "hover:bg-white/5"
              }`}
              onClick={() => setTimeRange(range.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {range.label}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Real-time Metrics */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {metrics.map((metric) => (
          <div
            key={metric.id}
            className="glass-card p-4 rounded-lg"
            style={{ borderColor: metric.color + "40" }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">{metric.icon}</span>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            <div className="text-2xl font-bold mb-1">
              {metric.id === "engagement"
                ? realTimeData[metric.id].toFixed(2) + "%"
                : realTimeData[metric.id].toLocaleString()}
            </div>
            <div className="text-sm text-white/60">{metric.label}</div>
          </div>
        ))}
      </motion.div>

      {/* Main Chart */}
      <motion.div variants={itemVariants} className="glass-card p-6 rounded-lg">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold">Performance Trends</h3>
          <div className="flex gap-2">
            {metrics.map((metric) => (
              <button
                key={metric.id}
                className={`px-3 py-1 rounded-lg text-sm transition-all duration-200 ${
                  selectedMetric === metric.id
                    ? "ring-2 ring-current ring-opacity-50"
                    : "hover:bg-white/5"
                }`}
                onClick={() => setSelectedMetric(metric.id)}
                style={{
                  color:
                    selectedMetric === metric.id ? metric.color : "inherit",
                }}
              >
                {metric.icon} {metric.label}
              </button>
            ))}
          </div>
        </div>

        <div className="h-80">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="w-8 h-8 border-4 border-white/20 border-t-current rounded-full animate-spin"></div>
            </div>
          ) : (
            <Line data={getChartData(selectedMetric)} options={chartOptions} />
          )}
        </div>
      </motion.div>

      {/* Additional Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Audience Demographics */}
        <motion.div
          variants={itemVariants}
          className="glass-card p-6 rounded-lg"
        >
          <h3 className="text-lg font-semibold mb-4">Audience Demographics</h3>
          <div className="h-64">
            <Doughnut data={audienceData} options={chartOptions} />
          </div>
        </motion.div>

        {/* Platform Distribution */}
        <motion.div
          variants={itemVariants}
          className="glass-card p-6 rounded-lg"
        >
          <h3 className="text-lg font-semibold mb-4">Platform Distribution</h3>
          <div className="h-64">
            <Doughnut data={platformData} options={chartOptions} />
          </div>
        </motion.div>

        {/* Performance Radar */}
        <motion.div
          variants={itemVariants}
          className="glass-card p-6 rounded-lg"
        >
          <h3 className="text-lg font-semibold mb-4">Performance Overview</h3>
          <div className="h-64">
            <Radar data={performanceData} options={chartOptions} />
          </div>
        </motion.div>
      </div>

      {/* Insights Panel */}
      <motion.div variants={itemVariants} className="glass-card p-6 rounded-lg">
        <h3 className="text-xl font-semibold mb-4">AI Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-2 text-green-400">
              📈 Growth Opportunities
            </h4>
            <ul className="space-y-2 text-sm text-white/80">
              <li>• Your engagement peaks on Wednesdays at 7 PM</li>
              <li>• Video content performs 3x better than images</li>
              <li>• Hashtag optimization could increase reach by 25%</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2 text-orange-400">
              ⚠️ Areas for Improvement
            </h4>
            <ul className="space-y-2 text-sm text-white/80">
              <li>• Posting frequency could be increased</li>
              <li>• Story engagement is below average</li>
              <li>• Consider more interactive content</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdvancedAnalytics;

