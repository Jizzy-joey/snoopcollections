
import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL?.trim();

const supabaseKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Missing Supabase URL or API key. Check .env.local"
  );
}

const parsedUrl = new URL(supabaseUrl);

if (
  parsedUrl.protocol !== "https:" ||
  parsedUrl.pathname !== "/" ||
  parsedUrl.search ||
  parsedUrl.hash
) {
  throw new Error(
    "Invalid Supabase URL. Use the Project URL without /rest/v1 or /orders."
  );
}

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
);
