"use client";

import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";

export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  color: string;
  popupHtml?: string;
}

interface LeafletMapProps {
  markers: MapMarker[];
  height?: string;
  zoom?: number;
  interactive?: boolean;
  onMarkerClick?: (id: string) => void;
  className?: string;
}

// Manado, Sulawesi Utara — dipakai sebagai pusat peta default bila belum
// ada satu pun marker (mis. saat WO pertama belum dibuat).
const DEFAULT_CENTER: [number, number] = [1.4748, 124.8421];
const DEFAULT_ZOOM = 12;

/**
 * FR-3.2: Peta interaktif dengan pin marker berwarna sesuai status WO.
 *
 * Modul "leaflet" sengaja di-import secara dinamis DI DALAM useEffect
 * (bukan di top-level file) supaya kode Leaflet tidak pernah dieksekusi
 * saat Server-Side Rendering — menghindari error "window/document is not
 * defined" tanpa perlu next/dynamic ssr:false.
 */
export function LeafletMap({
  markers,
  height = "420px",
  zoom = DEFAULT_ZOOM,
  interactive = true,
  onMarkerClick,
  className,
}: LeafletMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapObjRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const layerGroupRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [leafletLib, setLeafletLib] = useState<any>(null);

  // 1) Inisialisasi peta sekali saat komponen mount.
  useEffect(() => {
    let cancelled = false;

    import("leaflet").then((mod) => {
      if (cancelled || !containerRef.current) return;
      const L = mod.default;

      const map = L.map(containerRef.current, {
        zoomControl: interactive,
        dragging: interactive,
        scrollWheelZoom: interactive,
        doubleClickZoom: interactive,
        touchZoom: interactive,
        boxZoom: interactive,
        keyboard: interactive,
      }).setView(DEFAULT_CENTER, zoom);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      mapObjRef.current = map;
      layerGroupRef.current = L.layerGroup().addTo(map);
      setLeafletLib(() => L);
    });

    return () => {
      cancelled = true;
      mapObjRef.current?.remove();
      mapObjRef.current = null;
      layerGroupRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2) Render ulang marker tiap kali data `markers` berubah.
  useEffect(() => {
    const L = leafletLib;
    const map = mapObjRef.current;
    const layerGroup = layerGroupRef.current;
    if (!L || !map || !layerGroup) return;

    layerGroup.clearLayers();

    markers.forEach((m) => {
      const icon = L.divIcon({
        className: "",
        html: `<div style="background:${m.color};width:18px;height:18px;border-radius:9999px;border:2.5px solid white;box-shadow:0 1px 4px rgba(15,23,42,0.45)"></div>`,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      });
      const marker = L.marker([m.lat, m.lng], { icon });
      if (m.popupHtml) marker.bindPopup(m.popupHtml);
      if (onMarkerClick) marker.on("click", () => onMarkerClick(m.id));
      marker.addTo(layerGroup);
    });

    if (markers.length > 0) {
      const bounds = L.latLngBounds(markers.map((m): [number, number] => [m.lat, m.lng]));
      map.fitBounds(bounds, { padding: [48, 48], maxZoom: 15 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leafletLib, markers]);

  return (
    <div
      ref={containerRef}
      style={{ height, width: "100%" }}
      className={className ?? "z-0 overflow-hidden rounded-lg bg-slate-100"}
    />
  );
}
