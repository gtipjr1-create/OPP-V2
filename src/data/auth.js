import { supabase } from "../lib/supabase";

export async function getCurrentUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw new Error(error.message);
  }

  if (!user) {
    throw new Error("No signed-in user found.");
  }

  return user;
}

export async function signOut() {
  await supabase.auth.signOut();
}
