/**
 * User interface representing an authenticated user in the system
 */
export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Individual poll option with vote count
 */
export interface PollOption {
  id: string;
  text: string;
  votes: number;
}

/**
 * Complete poll object with all necessary data for display and management
 */
export interface Poll {
  id: string;
  title: string;
  description?: string;
  options: PollOption[];
  createdBy: string; // User ID
  createdAt: Date;
  updatedAt: Date;
  endDate?: Date;
  settings: PollSettings;
}

/**
 * Poll configuration settings for voting behavior
 */
export interface PollSettings {
  allowMultipleVotes: boolean;
  requireAuthentication: boolean;
}

/**
 * Vote record linking a user to a specific poll option
 */
export interface Vote {
  id: string;
  pollId: string;
  optionId: string;
  userId?: string; // Optional if anonymous voting is allowed
  createdAt: Date;
}

/**
 * Form data structure for creating new polls
 */
export interface CreatePollFormData {
  title: string;
  description?: string;
  options: string[];
  settings: PollSettings;
  endDate?: string;
}

/**
 * Form data structure for user login
 */
export interface LoginFormData {
  email: string;
  password: string;
}

/**
 * Form data structure for user registration
 */
export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
}