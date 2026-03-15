"use client";

import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap
} from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";

// Fix marker icons
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function HeatmapLayer({ points }) {
  const map = useMap();

  useEffect(() => {
    if (!points.length) return;

    const heatPoints = points.map((p) => [
      p.location.latitude,
      p.location.longitude,
      1
    ]);

    const heatLayer = L.heatLayer(heatPoints, {
      radius: map.getZoom() < 7 ? 60 : 30,
      blur: 25,
      maxZoom: 10,
      gradient: { 0.4: 'blue', 0.65: 'lime', 1: 'red' }
    }).addTo(map);

    return () => {
      map.removeLayer(heatLayer);
    };
  }, [points, map]);

  return null;
}

export default function PotholeMap() {
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    async function fetchLocations() {
      const res = await fetch(
        "/api/department/getPotholeLocations"
      );
      const data = await res.json();

      if (data.success) {
        setLocations(data.locations);
      }
    }

    fetchLocations();
  }, []);

  return (
    <div className="w-full flex justify-center items-center py-10 px-4">
      <div className="w-full max-w-6xl shadow-xl rounded-3xl overflow-hidden border border-cyan-500/30">
        <MapContainer
          center={[21.1458, 79.0882]}
          zoom={5}
          minZoom={4}
          maxZoom={18}
          style={{ height: "600px", width: "100%" }}
          className="z-10"
        >
          {/* Map tiles - Default OSM */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Heatmap */}
          <HeatmapLayer points={locations} />

          {/* Cluster markers */}
          <MarkerClusterGroup chunkedLoading>
            {locations.map((loc, index) => (
              <Marker
                key={index}
                position={[
                  loc.location.latitude,
                  loc.location.longitude,
                ]}
              >
                <Popup>
                  <div className="text-sm">
                    <strong>Pothole Location</strong>
                    <br />
                    <span>Lat:</span> {loc.location.latitude}
                    <br />
                    <span>Lng:</span> {loc.location.longitude}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MarkerClusterGroup>
        </MapContainer>
      </div>
    </div>
  );
}