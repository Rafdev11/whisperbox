
const SUPABASE_URL = "https://irrzvlzricryvihjjtnf.supabase.co";

const SUPABASE_KEY = "sb_publishable_I3oiHS9XyW9_d0UjGILQvA_SQJqtgk0";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

console.log("WhisperBox Supabase client initialized!");
