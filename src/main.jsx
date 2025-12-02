import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { Toaster } from "react-hot-toast";

import { supabase } from './utils/supabaseClient' //added now can remove
window.supabase = supabase; // ADD THIS LINE,can remvoe
createRoot(document.getElementById("root")).render(
  <>
    <App />
    <Toaster />
  </>
);

