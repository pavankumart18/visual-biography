/**
 * Supabase auth + stories persistence.
 * Use Storage.init(url, key) then login/logout; listStories/saveStory/deleteStory for stories.
 *
 * In Supabase SQL editor, create the table and RLS:
 *   create table stories (
 *     id uuid primary key default gen_random_uuid(),
 *     user_id uuid references auth.users(id) on delete cascade not null,
 *     title text not null,
 *     config jsonb not null,
 *     created_at timestamptz default now(),
 *     updated_at timestamptz default now()
 *   );
 *   alter table stories enable row level security;
 *   create policy "Users manage own stories" on stories for all using (auth.uid() = user_id);
 * Enable Google in Supabase Dashboard > Authentication > Providers.
 * Add your app URL to Redirect URLs (e.g. http://localhost:8080/index.html and your production URL).
 */
let supabase = null;
let session = null;
let supabaseUrl = null;
let supabaseKey = null;

const loadSupabase = async () => {
  const mod = await import("https://esm.sh/@supabase/supabase-js@2");
  return mod;
};

export const Storage = {
  async init(url, key) {
    if (!url || !key) return false;
    supabaseUrl = url;
    supabaseKey = key;
    try {
      const { createClient } = await loadSupabase();
      supabase = createClient(url, key, {
        auth: {
          detectSessionInUrl: true,
          persistSession: true,
          autoRefreshToken: true,
        },
      });
      const { data } = await supabase.auth.getSession();
      session = data.session;
      supabase.auth.onAuthStateChange((_event, _session) => {
        session = _session;
        window.dispatchEvent(new CustomEvent("auth-changed", { detail: session }));
      });
      return true;
    } catch (e) {
      console.error("Supabase init error:", e);
      return false;
    }
  },

  getSession() {
    return session;
  },

  isConfigured() {
    return !!supabase;
  },

  async login() {
    if (!supabase) throw new Error("Supabase not configured");
    const redirectTo = new URL("index.html", window.location.href).href;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
    if (error) throw error;
  },

  async logout() {
    if (!supabase) return;
    await supabase.auth.signOut();
    session = null;
  },

  async listStories() {
    if (!supabase || !session) return [];
    const { data, error } = await supabase
      .from("stories")
      .select("id, title, config, created_at, updated_at")
      .order("updated_at", { ascending: false });
    if (error) throw error;
    return (data || []).map((row) => ({
      id: row.id,
      title: row.title,
      savedAt: new Date(row.updated_at || row.created_at).getTime(),
      config: row.config,
      source: "supabase",
    }));
  },

  async getStory(id) {
    if (!supabase || !session) return null;
    const { data, error } = await supabase.from("stories").select("id, title, config, updated_at").eq("id", id).single();
    if (error || !data) return null;
    return { id: data.id, title: data.title, savedAt: new Date(data.updated_at).getTime(), config: data.config, source: "supabase" };
  },

  async saveStory(payload) {
    if (!supabase || !session) throw new Error("Sign in to save stories");
    const { id, title, config } = payload;
    const row = {
      id: id || crypto.randomUUID(),
      user_id: session.user.id,
      title: title || "Untitled story",
      config: config,
      updated_at: new Date().toISOString(),
    };
    const { data, error } = await supabase.from("stories").upsert(row, { onConflict: "id" }).select().single();
    if (error) throw error;
    return data.id;
  },

  async deleteStory(id) {
    if (!supabase || !session) throw new Error("Not logged in");
    const { error } = await supabase.from("stories").delete().eq("id", id);
    if (error) throw error;
  },
};

if (typeof window !== "undefined") window.StoryStorage = Storage;
