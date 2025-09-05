"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Sanitizes user input by removing potentially dangerous characters
 * @param input - The input string to sanitize
 * @returns Sanitized string with HTML tags removed and trimmed
 */
function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}

/**
 * Validates poll input data for security and business logic compliance
 * @param question - The poll question text
 * @param options - Array of poll option strings
 * @returns Validation result with success status and optional error message
 */
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

/**
 * Creates a new poll with the provided question and options
 * Validates user authentication, input data, and sanitizes content
 * @param formData - Form data containing poll question and options
 * @returns Promise resolving to success/error result
 */
export async function createPoll(formData: FormData) {
  const supabase = await createClient();

  // Extract and sanitize form data to prevent XSS attacks
  const question = sanitizeInput(formData.get("question") as string);
  const options = formData.getAll("options").filter(Boolean).map(opt => sanitizeInput(opt as string));

  // Validate input against business rules and security requirements
  const validation = validatePollInput(question, options);
  if (!validation.isValid) {
    return { error: validation.error };
  }

  // Verify user authentication before allowing poll creation
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

/**
 * Retrieves all polls created by the currently authenticated user
 * @returns Promise resolving to user's polls array and error status
 */
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

/**
 * Retrieves a specific poll by its ID with UUID validation
 * @param id - The UUID of the poll to retrieve
 * @returns Promise resolving to poll data and error status
 */
export async function getPollById(id: string) {
  const supabase = await createClient();
  
  // Validate ID format using UUID v4 regex to prevent injection attacks
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

/**
 * Submits a vote for a specific poll option with comprehensive validation
 * Prevents duplicate votes for authenticated users and validates poll/option existence
 * @param pollId - The UUID of the poll to vote on
 * @param optionIndex - The index of the selected option (0-based)
 * @returns Promise resolving to success/error result
 */
export async function submitVote(pollId: string, optionIndex: number) {
  const supabase = await createClient();
  
  // Validate poll ID format using UUID v4 regex to prevent injection attacks
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(pollId)) {
    return { error: "Invalid poll ID format" };
  }

  // Validate option index to prevent array bounds attacks
  if (typeof optionIndex !== 'number' || optionIndex < 0 || optionIndex > 9) {
    return { error: "Invalid option index" };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Verify poll exists and get options count to validate option index
  const { data: poll, error: pollError } = await supabase
    .from("polls")
    .select("options")
    .eq("id", pollId)
    .single();

  if (pollError || !poll) {
    return { error: "Poll not found" };
  }

  // Ensure option index is within valid range for this specific poll
  if (optionIndex >= poll.options.length) {
    return { error: "Invalid option index for this poll" };
  }

  // Prevent duplicate votes for authenticated users (anonymous users can vote multiple times)
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

/**
 * Deletes a poll with ownership verification for security
 * Only allows users to delete their own polls
 * @param id - The UUID of the poll to delete
 * @returns Promise resolving to success/error result
 */
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

  // Enforce ownership verification - only allow deleting polls owned by the current user
  const { error } = await supabase
    .from("polls")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
    
  if (error) return { error: error.message };
  revalidatePath("/polls");
  return { error: null };
}

/**
 * Updates an existing poll with ownership verification and input validation
 * Only allows users to update their own polls
 * @param pollId - The UUID of the poll to update
 * @param formData - Form data containing updated poll question and options
 * @returns Promise resolving to success/error result
 */
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

  // Enforce ownership verification - only allow updating polls owned by the current user
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
