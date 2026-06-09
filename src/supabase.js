import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://zgnpjwczcnbbhpwrdbbg.supabase.co";
const supabaseKey = "sb_publishable_atPSBCAYtXqnmSzrd0m8Bg_t7M-FLCY";

export const supabase = createClient(supabaseUrl, supabaseKey);