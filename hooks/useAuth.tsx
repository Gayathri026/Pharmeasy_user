// import { useEffect, useState } from 'react';
// import { User, Session } from '@supabase/supabase-js';
// import { supabase } from '@/integrations/supabase/client';

// export function useAuth() {
//   const [user, setUser] = useState<User | null>(null);
//   const [session, setSession] = useState<Session | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [isAdmin, setIsAdmin] = useState(false);

//   useEffect(() => {
//     // Set up auth listener
//     const { data: { subscription } } = supabase.auth.onAuthStateChange(
//       (event, session) => {
//         setSession(session);
//         setUser(session?.user ?? null);

//         if (session?.user) {
//           // Fetch user role
//           setTimeout(() => {
//             checkAdminStatus(session.user.id);
//           }, 0);
//         } else {
//           setIsAdmin(false);
//         }
//       }
//     );

//     // Check for existing session
//     supabase.auth.getSession().then(({ data: { session } }) => {
//       setSession(session);
//       setUser(session?.user ?? null);
//       if (session?.user) {
//         checkAdminStatus(session.user.id);
//       }
//       setLoading(false);
//     });

//     return () => subscription.unsubscribe();
//   }, []);

//   const checkAdminStatus = async (userId: string) => {
//     const { data } = await supabase
//       .from('user_roles')
//       .select('role')
//       .eq('user_id', userId)
//       .eq('role', 'admin')
//       .single();

//     setIsAdmin(!!data);
//   };

//   const signIn = async (email: string, password: string) => {
//     const { error } = await supabase.auth.signInWithPassword({
//       email,
//       password,
//     });
//     return { error };
//   };

//   const signUp = async (email: string, password: string, fullName: string) => {
//     const redirectUrl = `${window.location.origin}/`;
//     const { error } = await supabase.auth.signUp({
//       email,
//       password,
//       options: {
//         emailRedirectTo: redirectUrl,
//         data: {
//           full_name: fullName,
//         },
//       },
//     });
//     return { error };
//   };

//   const signOut = async () => {
//     const { error } = await supabase.auth.signOut();
//     return { error };
//   };

//   return {
//     user,
//     session,
//     loading,
//     isAdmin,
//     signIn,
//     signUp,
//     signOut,
//   };
// }

// src/hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { authService, roleService } from '@/firebase/services';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = authService.onAuthStateChange(async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        // Check if user is admin
        const adminStatus = await roleService.isAdmin(currentUser.uid);
        setIsAdmin(adminStatus);
      } else {
        setIsAdmin(false);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName?: string) => {
    return authService.signUp(email, password, fullName);
  };

  const signIn = async (email: string, password: string) => {
    return authService.signIn(email, password);
  };

  const signOut = async () => {
    return authService.signOut();
  };

  return {
    user,
    loading,
    isAdmin,
    signUp,
    signIn,
    signOut,
  };
}