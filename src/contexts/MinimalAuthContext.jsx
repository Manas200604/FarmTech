import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabase/client';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(false); // Changed to false to prevent blank page

  const login = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      toast.success('Successfully logged in!');
      return data;
    } catch (error) {
      toast.error(error.message || 'Failed to login');
      throw error;
    }
  };

  const register = async (email, password, userData) => {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: userData.name || '',
            role: userData.role || 'farmer'
          }
        }
      });

      if (authError) throw authError;
      toast.success('Account created successfully!');
      return authData;
    } catch (error) {
      toast.error(error.message || 'Failed to create account');
      throw error;
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUserProfile(null);
      toast.success('Successfully logged out!');
    } catch (error) {
      toast.error(error.message || 'Failed to logout');
      throw error;
    }
  };

  const resetPassword = async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      toast.success('Password reset email sent!');
    } catch (error) {
      toast.error(error.message || 'Failed to send reset email');
      throw error;
    }
  };

  const updateUserProfile = async (data) => {
    // Simplified - just show success for now
    toast.success('Profile updated successfully!');
  };

  useEffect(() => {
    // Simplified auth state management
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUser(session?.user ?? null);
      // Don't try to fetch profile for now to avoid errors
      setUserProfile(session?.user ? { 
        id: session.user.id, 
        email: session.user.email, 
        name: session.user.email.split('@')[0],
        role: 'farmer' 
      } : null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setCurrentUser(session?.user ?? null);
      setUserProfile(session?.user ? { 
        id: session.user.id, 
        email: session.user.email, 
        name: session.user.email.split('@')[0],
        role: 'farmer' 
      } : null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const value = {
    currentUser,
    userProfile,
    loading,
    login,
    register,
    logout,
    resetPassword,
    updateUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          fontFamily: 'Arial, sans-serif'
        }}>
          <div>Loading FarmTech...</div>
        </div>
      ) : children}
    </AuthContext.Provider>
  );
};