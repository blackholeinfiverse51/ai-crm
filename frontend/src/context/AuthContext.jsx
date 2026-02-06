import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase, isMockSupabase } from '@/lib/supabase';
import { authService } from '@/services/auth/authService';
import { API_BASE_URL } from '@/utils/constants';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    // Safety timeout: ensure loading is always set to false within 5 seconds
    const safetyTimeout = setTimeout(() => {
      console.warn('Auth initialization timeout - forcing loading to false');
      setLoading(false);
    }, 5000);

    // Get initial session
    const initializeAuth = async () => {
      try {
        // Check if supabase is properly configured
        if (supabase && supabase.auth && typeof supabase.auth.getSession === 'function') {
          const { data: { session: initialSession } } = await supabase.auth.getSession();
          setSession(initialSession);
          setUser(initialSession?.user ?? null);

          // Get user profile if session exists (with timeout)
          if (initialSession?.user) {
            // Store token in localStorage if available
            if (initialSession.access_token) {
              localStorage.setItem('token', initialSession.access_token);
            }
            
            const profilePromise = authService.getUserProfile(initialSession.user.id).catch(err => {
              console.warn('Could not load user profile:', err);
              return null;
            });
            
            const timeoutPromise = new Promise(resolve => setTimeout(() => resolve(null), 2000));
            
            try {
              const userProfile = await Promise.race([profilePromise, timeoutPromise]);
              if (userProfile) {
                setProfile(userProfile);
              }
            } catch (profileError) {
              console.warn('Could not load user profile:', profileError);
            }
          } else {
            // No session - check if we have a dev token
            if (isMockSupabase() && !localStorage.getItem('token')) {
              localStorage.setItem('token', 'dev-token-' + Date.now());
            }
          }
        } else {
          // Supabase not configured, skip auth
          console.warn('Supabase not configured, skipping authentication');
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        // Don't block the app if auth fails
      } finally {
        clearTimeout(safetyTimeout);
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes (only if supabase is configured)
    let subscription = null;
    if (supabase && supabase.auth && typeof supabase.auth.onAuthStateChange === 'function') {
      try {
        const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
          async (event, currentSession) => {
            console.log('Auth state changed:', event);
            setSession(currentSession);
            setUser(currentSession?.user ?? null);

            // Get profile when user signs in (with timeout to prevent hanging)
            if (event === 'SIGNED_IN' && currentSession?.user) {
              // Store token in localStorage
              if (currentSession.access_token) {
                localStorage.setItem('token', currentSession.access_token);
              }
              
              // Use Promise.race to add timeout
              const profilePromise = authService.getUserProfile(currentSession.user.id).catch(err => {
                console.warn('Could not load user profile:', err);
                return null;
              });
              
              const timeoutPromise = new Promise(resolve => setTimeout(() => resolve(null), 3000));
              
              try {
                const userProfile = await Promise.race([profilePromise, timeoutPromise]);
                if (userProfile) {
                  setProfile(userProfile);
                }
              } catch (profileError) {
                console.warn('Could not load user profile:', profileError);
              }
            }

            // Clear profile when user signs out
            if (event === 'SIGNED_OUT') {
              setProfile(null);
              localStorage.removeItem('token');
            }

            // Always set loading to false, even if profile loading fails
            setLoading(false);
          }
        );
        subscription = authSubscription;
      } catch (error) {
        console.warn('Could not set up auth state listener:', error);
      }
    }

    return () => {
      if (subscription && subscription.unsubscribe) {
        subscription.unsubscribe();
      }
      // Ensure loading is false on unmount
      setLoading(false);
    };
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const result = await authService.signIn({
        email,
        password
      });
      
      // Handle both mock and real Supabase responses
      const signedInUser = result?.user || result?.data?.user;
      const newSession = result?.session || result?.data?.session;
      
      // Set user and session
      if (signedInUser) {
        setUser(signedInUser);
        setSession(newSession);
        
        // Also login to backend API to get JWT token
        try {
          const backendLoginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              username: email, // Backend uses username field
              password: password
            })
          });
          
          if (backendLoginResponse.ok) {
            const backendToken = await backendLoginResponse.json();
            if (backendToken.access_token) {
              localStorage.setItem('token', backendToken.access_token);
            }
          } else {
            // If backend login fails, use Supabase token or create dev token
            if (newSession?.access_token) {
              localStorage.setItem('token', newSession.access_token);
            } else if (result?.session?.access_token) {
              localStorage.setItem('token', result.session.access_token);
            } else if (result?.data?.session?.access_token) {
              localStorage.setItem('token', result.data.session.access_token);
            } else if (isMockSupabase()) {
              // In dev mode, create a mock token
              localStorage.setItem('token', 'dev-token-' + Date.now());
            }
          }
        } catch (backendError) {
          console.warn('Backend login failed, using Supabase token:', backendError);
          // Fallback to Supabase token or dev token
          if (newSession?.access_token) {
            localStorage.setItem('token', newSession.access_token);
          } else if (isMockSupabase()) {
            localStorage.setItem('token', 'dev-token-' + Date.now());
          }
        }
        
        // Get user profile (with timeout to prevent hanging)
        const profilePromise = authService.getUserProfile(signedInUser.id).catch(err => {
          console.warn('Could not load user profile:', err);
          return null;
        });
        
        const timeoutPromise = new Promise(resolve => setTimeout(() => resolve(null), 3000));
        
        try {
          const userProfile = await Promise.race([profilePromise, timeoutPromise]);
          if (userProfile) {
            setProfile(userProfile);
          }
        } catch (profileError) {
          console.warn('Could not load user profile:', profileError);
        }
      }
      
      return { user: signedInUser, session: newSession };
    } catch (error) {
      // In dev mode, if it's a "not configured" error, still allow login
      if (isMockSupabase() && error.message?.includes('not configured')) {
        // Create a mock user for dev mode
        const mockUser = {
          id: 'dev-user-' + Date.now(),
          email,
          user_metadata: { full_name: 'Dev User' }
        };
        setUser(mockUser);
        setSession({ access_token: 'dev-token', user: mockUser });
        return { user: mockUser, session: { access_token: 'dev-token', user: mockUser } };
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async ({ email, password, firstName, lastName, companyName }) => {
    setLoading(true);
    try {
      const data = await authService.signUp({
        email,
        password,
        firstName,
        lastName,
        companyName
      });
      return data;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loginWithOAuth = async (provider) => {
    setLoading(true);
    try {
      const data = await authService.signInWithOAuth(provider);
      return data;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authService.signOut();
      setUser(null);
      setSession(null);
      setProfile(null);
      // Remove token from localStorage
      localStorage.removeItem('token');
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email) => {
    try {
      await authService.resetPassword(email);
    } catch (error) {
      throw error;
    }
  };

  const updatePassword = async (newPassword) => {
    try {
      await authService.updatePassword(newPassword);
    } catch (error) {
      throw error;
    }
  };

  const updateProfile = async (updates) => {
    if (!user) return;
    try {
      const updatedProfile = await authService.updateUserProfile(user.id, updates);
      setProfile(updatedProfile);
      return updatedProfile;
    } catch (error) {
      throw error;
    }
  };

  const value = {
    user,
    session,
    profile,
    loading,
    isAuthenticated: !!user,
    login,
    signup,
    loginWithOAuth,
    logout,
    resetPassword,
    updatePassword,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
