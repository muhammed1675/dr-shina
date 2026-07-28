import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { isSupabaseConfigured } from '../../lib/supabase';

export function SiteLayout() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Navbar />
      <motion.main
        key={location.pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="flex-1">
        
        <Outlet />
      </motion.main>
      <Footer />
      {!isSupabaseConfigured &&
      <div className="fixed bottom-4 left-1/2 z-40 w-[min(92vw,44rem)] -translate-x-1/2 rounded-full border border-line bg-white px-6 py-3 text-center text-xs text-subtle shadow-lift">
          Supabase isn’t connected yet — add <code className="text-ink">NEXT_PUBLIC_SUPABASE_URL</code> and{' '}
          <code className="text-ink">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to <code className="text-ink">.env.local</code> to load
          live content.
        </div>
      }
    </div>);

}