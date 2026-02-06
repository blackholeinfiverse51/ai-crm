import { supabase, isMockSupabase } from '@/lib/supabase'

// Dev mode: allow login without Supabase
const DEV_MODE_ENABLED = true

export const authService = {
  // Sign up with email and password
  async signUp({ email, password, firstName, lastName, companyName }) {
    // In dev mode with mock Supabase, simulate success
    if (isMockSupabase() && DEV_MODE_ENABLED) {
      console.warn('Dev mode: Simulating signup (Supabase not configured)')
      return {
        user: {
          id: 'dev-user-' + Date.now(),
          email,
          user_metadata: {
            first_name: firstName,
            last_name: lastName,
            company_name: companyName,
            full_name: `${firstName} ${lastName}`
          }
        },
        session: {
          access_token: 'dev-token',
          user: {
            id: 'dev-user-' + Date.now(),
            email
          }
        }
      }
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/verify-email`,
        data: {
          first_name: firstName,
          last_name: lastName,
          company_name: companyName,
          full_name: `${firstName} ${lastName}`
        }
      }
    })

    if (error) throw error

    // Create profile if signup successful
    if (data.user) {
      await this.createUserProfile(data.user.id, {
        email,
        first_name: firstName,
        last_name: lastName,
        company_name: companyName
      })
    }

    return data
  },

  // Sign in with email and password
  async signIn({ email, password }) {
    // In dev mode with mock Supabase, simulate successful login
    if (isMockSupabase() && DEV_MODE_ENABLED) {
      console.warn('Dev mode: Simulating login (Supabase not configured)')
      return {
        user: {
          id: 'dev-user-' + Date.now(),
          email,
          user_metadata: {
            full_name: 'Dev User'
          }
        },
        session: {
          access_token: 'dev-token',
          user: {
            id: 'dev-user-' + Date.now(),
            email
          }
        }
      }
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) throw error
    return data
  },

  // Sign in with OAuth provider
  async signInWithOAuth(provider) {
    // In dev mode with mock Supabase, show message
    if (isMockSupabase() && DEV_MODE_ENABLED) {
      throw new Error('OAuth login requires Supabase configuration. Please configure Supabase or use email/password login in dev mode.')
    }

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })

    if (error) throw error
    return data
  },

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  // Send password reset email
  async resetPassword(email) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`
    })

    if (error) throw error
    return data
  },

  // Update password
  async updatePassword(newPassword) {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    })

    if (error) throw error
    return data
  },

  // Get current session
  async getSession() {
    if (isMockSupabase() && DEV_MODE_ENABLED) {
      return null // No session in dev mode
    }
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) throw error
    return session
  },

  // Get current user
  async getCurrentUser() {
    if (isMockSupabase() && DEV_MODE_ENABLED) {
      return null // No user in dev mode
    }
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return user
  },

  // Create user profile
  async createUserProfile(userId, profileData) {
    const { data, error } = await supabase
      .from('profiles')
      .insert([
        {
          id: userId,
          ...profileData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
      .select()
      .single()

    if (error) {
      console.error('Error creating profile:', error)
      // Don't throw error as profile table might not exist yet
      return null
    }
    return data
  },

  // Update user profile
  async updateUserProfile(userId, updates) {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Get user profile
  async getUserProfile(userId) {
    if (isMockSupabase() && DEV_MODE_ENABLED) {
      // Return mock profile in dev mode immediately
      return Promise.resolve({
        id: userId,
        email: 'dev@example.com',
        first_name: 'Dev',
        last_name: 'User',
        company_name: 'Dev Company'
      })
    }

    // Add timeout to prevent hanging
    const queryPromise = supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Profile query timeout')), 2000)
    )

    try {
      const { data, error } = await Promise.race([queryPromise, timeoutPromise])

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = not found, which is okay
        throw error
      }
      return data
    } catch (err) {
      // If timeout or other error, return null instead of throwing
      console.warn('getUserProfile error:', err)
      return null
    }
  },

  // Resend verification email
  async resendVerificationEmail(email) {
    const { data, error } = await supabase.auth.resend({
      type: 'signup',
      email
    })

    if (error) throw error
    return data
  }
}

export default authService
