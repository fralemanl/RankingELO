"use client";

import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer } from "recharts";

export default function PlayerRadar({ player }) {
  const data = Array.isArray(player?.RADAR_STATS) && player.RADAR_STATS.length > 0
    ? player.RADAR_STATS
    : [
        { stat: "FIS", value: parseFloat(player.FIS || 0) || 0 },
        { stat: "TEC", value: parseFloat(player.TEC || 0) || 0 },
        { stat: "TAC", value: parseFloat(player.TAC || 0) || 0 },
        { stat: "ATA", value: parseFloat(player.ATA || 0) || 0 },
        { stat: "DEF", value: parseFloat(player.DEF || 0) || 0 },
        { stat: "MNT", value: parseFloat(player.MNT || 0) || 0 },
      ];

  return (
    <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
      <div style={{ width: 200, height: 200 }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data}>
            <PolarGrid />
            <PolarAngleAxis dataKey="stat" />
            <Radar name="Stats" dataKey="value" stroke="#667eea" fill="#667eea" fillOpacity={0.6} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
