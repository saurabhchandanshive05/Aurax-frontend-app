import React from "react";

const TestImageLoad = () => {
  const testImages = [
    "/images/adidas-campaign.jpg",
    "/images/amazon-campaign.jpg",
  ];

  const testVideos = [
    "/videos/adidas-campaign.mp4",
    "/videos/amazon-campaign.mp4",
    "/videos/apple-campaign.mp4",
    "/videos/cocacola-campaign.mp4",
    "/videos/nike-campaign.mp4",
    "/videos/samsung-campaign.mp4",
  ];

  return (
    <div style={{ padding: "20px", background: "#1a1a1a", color: "white" }}>
      <h2>Image and Video Load Test</h2>

      <h3>Images:</h3>
      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
        {testImages.map((src, index) => (
          <div
            key={index}
            style={{ border: "1px solid #444", padding: "10px" }}
          >
            <p style={{ fontSize: "12px" }}>{src}</p>
            <img
              src={src}
              alt={`Test ${index}`}
              style={{ width: "200px", height: "120px", objectFit: "cover" }}
              onLoad={() => console.log(`✅ Loaded: ${src}`)}
              onError={() => console.log(`❌ Failed: ${src}`)}
            />
          </div>
        ))}
      </div>

      <h3>Videos:</h3>
      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
        {testVideos.map((src, index) => (
          <div
            key={index}
            style={{ border: "1px solid #444", padding: "10px" }}
          >
            <p style={{ fontSize: "12px" }}>{src}</p>
            <video
              src={src}
              style={{ width: "200px", height: "120px" }}
              controls
              muted
              onLoadedData={() => console.log(`✅ Video loaded: ${src}`)}
              onError={() => console.log(`❌ Video failed: ${src}`)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default TestImageLoad;
