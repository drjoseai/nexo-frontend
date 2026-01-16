/**
 * Authentication types for NEXO v2.0
 * @module types/auth
 */

/**
 * User subscription plan types
 */
export type UserPlan = 'trial' | 'free' | 'plus' | 'premium';

/**
 * Supported language codes
 */
export type LanguageCode = 'es' | 'en';

/**
 * User entity representing an authenticated user in the system
 * @interface User
 */
export interface User {
  /** Unique identifier for the user */
  id: string;
  
  /** User's email address */
  email: string;
  
  /** Optional display name for the user */
  display_name: string | null;
  
  /** Current subscription plan */
  plan: UserPlan;
  
  /** Whether the user's age has been verified */
  age_verified: boolean;
  
  /** Whether user has accepted Terms of Service */
  tos_accepted: boolean;
  
  /** User's date of birth */
  date_of_birth: string | null;
  
  /** User's preferred language for the interface */
  preferred_language: LanguageCode;
  
  /** Timestamp when the user account was created */
  created_at: string;
  
  /** Optional timestamp when the trial period ends */
  trial_ends_at: string | null;
}

/**
 * Request payload for user login
 * @interface LoginRequest
 */
export interface LoginRequest {
  /** User's email address */
  email: string;
  
  /** User's password */
  password: string;
}

/**
 * Response payload after successful login
 * @interface LoginResponse
 */
export interface LoginResponse {
  /** JWT access token for authenticated requests */
  access_token: string;
  
  /** JWT refresh token for obtaining new access tokens */
  refresh_token: string;
  
  /** Token validity period in seconds */
  expires_in: number;
  
  /** Type of the token (typically "Bearer") */
  token_type: string;
  
  /** Authenticated user data */
  user: User;
}

/**
 * Request payload for user registration
 * @interface RegisterRequest
 */
export interface RegisterRequest {
  /** User's email address */
  email: string;
  
  /** User's password */
  password: string;
  
  /** Optional display name for the user */
  display_name?: string;
  
  /** Optional preferred language (defaults to 'es' if not provided) */
  preferred_language?: LanguageCode;
  
  /** User's date of birth (YYYY-MM-DD format) - Required for age verification */
  date_of_birth: string;
  
  /** User must accept Terms of Service */
  tos_accepted: boolean;
}

/**
 * Response payload after successful registration
 * @interface RegisterResponse
 */
export interface RegisterResponse {
  /** Newly created user data */
  user: User;
  
  /** Success message */
  message: string;
}

/**
 * Authentication state in the store
 * @interface AuthState
 */
export interface AuthState {
  /** Currently authenticated user, null if not authenticated */
  user: User | null;
  
  /** JWT access token, null if not authenticated */
  token: string | null;
  
  /** Whether a user is currently authenticated */
  isAuthenticated: boolean;
  
  /** Whether an authentication operation is in progress */
  isLoading: boolean;
  
  /** Error message from the last failed authentication operation */
  error: string | null;
}

/**
 * Authentication actions available in the store
 * @interface AuthActions
 */
export interface AuthActions {
  /**
   * Authenticate a user with email and password
   * @param credentials - Login credentials
   * @returns Promise that resolves when login is complete
   */
  login: (credentials: LoginRequest) => Promise<void>;
  
  /**
   * Register a new user account
   * @param data - Registration data
   * @returns Promise that resolves when registration is complete
   */
  register: (data: RegisterRequest) => Promise<void>;
  
  /**
   * Log out the current user and clear authentication state
   * @returns void
   */
  logout: () => void;
  
  /**
   * Load user data from stored token
   * @returns Promise that resolves when user data is loaded
   */
  loadUser: () => Promise<void>;
  
  /**
   * Clear any authentication errors
   * @returns void
   */
  clearError: () => void;
  
  /**
   * Set the loading state
   * @param isLoading - Loading state
   * @returns void
   */
  setLoading: (isLoading: boolean) => void;
}

/**
 * Complete authentication store combining state and actions
 * @interface AuthStore
 */
export interface AuthStore extends AuthState, AuthActions {}

