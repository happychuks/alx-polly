"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// Input validation and sanitization utilities
function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}

function validatePollInput(question: string, options: string[]): { isValid: boolean; error?: string } {
  if (!question || question.length < 3) {
    return { isValid: false, error: "Question must be at least 3 characters long." };
  }
  
  if (question.length > 500) {
    return { isValid: false, error: "Question must be less than 500 characters." };
  }
  
  if (options.length < 2) {
    return { isValid: false, error: "At least 2 options are required." };
  }
  
  if (options.length > 10) {
    return { isValid: false, error: "Maximum 10 options allowed." };
  }
  
  for (const option of options) {
    if (!option || option.length < 1) {
      return { isValid: false, error: "All options must have content." };
    }
    if (option.length > 200) {
      return { isValid: false, error: "Each option must be less than 200 characters." };
    }
  }
  
  return { isValid: true };
}

// CREATE POLL
export async function createPoll(formData: FormData) {
  const supabase = await createClient();

  const question = sanitizeInput(formData.get("question") as string);
  const options = formData.getAll("options").filter(Boolean).map(opt => sanitizeInput(opt as string));

  // Validate input
  const validation = validatePollInput(question, options);
  if (!validation.isValid) {
    return { error: validation.error };
  }

  // Get user from session
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError) {
    return { error: userError.message };
  }
  if (!user) {
    return { error: "You must be logged in to create a poll." };
  }

  const { error } = await supabase.from("polls").insert([
    {
      user_id: user.id,
      question,
      options,
    },
  ]);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/polls");
  return { error: null };
}

// GET USER POLLS
export async function getUserPolls() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { polls: [], error: "Not authenticated" };

  const { data, error } = await supabase
    .from("polls")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return { polls: [], error: error.message };
  return { polls: data ?? [], error: null };
}

// GET POLL BY ID
export async function getPollById(id: string) {
  const supabase = await createClient();
  
  // Validate ID format (basic UUID validation)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    return { poll: null, error: "Invalid poll ID format" };
  }
  
  const { data, error } = await supabase
    .from("polls")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return { poll: null, error: error.message };
  return { poll: data, error: null };
}

// SUBMIT VOTE
export async function submitVote(pollId: string, optionIndex: number) {
  const supabase = await createClient();
  
  // Validate poll ID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(pollId)) {
    return { error: "Invalid poll ID format" };
  }

  // Validate option index
  if (typeof optionIndex !== 'number' || optionIndex < 0 || optionIndex > 9) {
    return { error: "Invalid option index" };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Check if poll exists and get options count
  const { data: poll, error: pollError } = await supabase
    .from("polls")
    .select("options")
    .eq("id", pollId)
    .single();

  if (pollError || !poll) {
    return { error: "Poll not found" };
  }

  if (optionIndex >= poll.options.length) {
    return { error: "Invalid option index for this poll" };
  }

  // Check if user has already voted (if logged in)
  if (user) {
    const { data: existingVote } = await supabase
      .from("votes")
      .select("id")
      .eq("poll_id", pollId)
      .eq("user_id", user.id)
      .single();

    if (existingVote) {
      return { error: "You have already voted on this poll" };
    }
  }

  const { error } = await supabase.from("votes").insert([
    {
      poll_id: pollId,
      user_id: user?.id ?? null,
      option_index: optionIndex,
    },
  ]);

  if (error) return { error: error.message };
  return { error: null };
}

// DELETE POLL
export async function deletePoll(id: string) {
  const supabase = await createClient();
  
  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  
  if (userError) {
    return { error: "Authentication error" };
  }
  
  if (!user) {
    return { error: "You must be logged in to delete a poll." };
  }

  // Only allow deleting polls owned by the user
  const { error } = await supabase
    .from("polls")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
    
  if (error) return { error: error.message };
  revalidatePath("/polls");
  return { error: null };
}

// UPDATE POLL
export async function updatePoll(pollId: string, formData: FormData) {
  const supabase = await createClient();

  const question = sanitizeInput(formData.get("question") as string);
  const options = formData.getAll("options").filter(Boolean).map(opt => sanitizeInput(opt as string));

  // Validate input
  const validation = validatePollInput(question, options);
  if (!validation.isValid) {
    return { error: validation.error };
  }

  // Get user from session
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError) {
    return { error: userError.message };
  }
  if (!user) {
    return { error: "You must be logged in to update a poll." };
  }

  // Only allow updating polls owned by the user
  const { error } = await supabase
    .from("polls")
    .update({ question, options })
    .eq("id", pollId)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  return { error: null };
}
