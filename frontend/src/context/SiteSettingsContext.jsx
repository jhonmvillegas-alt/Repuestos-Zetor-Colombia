import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../lib/api";

const SiteSettingsContext = createContext({});

const FALLBACKS = {
  hero_left_image: "https://almacenzetorrepuestos.com/wp-content/uploads/2026/04/Gemini_Generated_Image_n0vlzqn0vlzqn0vl-1-scaled.png",
  hero_right_video: "https://almacenzetorrepuestos.com/wp-content/uploads/2026/04/Agent_video_Pippit_20260429224100.mp4",
  system_image_motor: "https://images.unsplash.com/photo-1759850425725-41216a62b6e0?crop=entropy&cs=srgb&fm=jpg&q=80&w=800",
  system_image_hidraulico: "https://images.unsplash.com/photo-1759692071969-c32285cffc40?crop=entropy&cs=srgb&fm=jpg&q=80&w=800",
  system_image_transmision: "https://images.unsplash.com/photo-1667339240140-1aee60bea0e5?crop=entropy&cs=srgb&fm=jpg&q=80&w=800",
  system_image_frenos: "https://images.unsplash.com/photo-1770705950498-d373e33ecb1a?crop=entropy&cs=srgb&fm=jpg&q=80&w=800",
  system_image_filtros: "https://images.unsplash.com/photo-1776856793085-5cfc8fefb5b8?crop=entropy&cs=srgb&fm=jpg&q=80&w=800",
  about_mechanic_image: "https://images.unsplash.com/photo-1770705950498-d373e33ecb1a?crop=entropy&cs=srgb&fm=jpg&q=80&w=1200",
  about_tractor_image: "https://images.unsplash.com/photo-1776856793085-5cfc8fefb5b8?crop=entropy&cs=srgb&fm=jpg&q=80&w=1200",
};

export function SiteSettingsProvider({ children }) {
  const [settings, setSettings] = useState(FALLBACKS);
  useEffect(() => {
    api.get("/site/settings").then((r) => setSettings({ ...FALLBACKS, ...r.data })).catch(() => {});
  }, []);
  return <SiteSettingsContext.Provider value={settings}>{children}</SiteSettingsContext.Provider>;
}

export const useSiteSettings = () => useContext(SiteSettingsContext);
