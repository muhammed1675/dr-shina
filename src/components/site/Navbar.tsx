import React, { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';

const LINKS = [
{ label: 'Home', to: '/' },
{ label: 'About', to: '/about' },
{ label: 'Articles', to: '/articles' },
{ label: 'Gallery', to: '/gallery' },
{ label: 'Projects & Speaking', to: '/projects-speaking' },
{ label: 'Contact', to: '/contact' }];


export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const solid = scrolled || open;

  return (
    <motion.header
      initial={false}
      animate={{
        backgroundColor: solid ? 'rgba(255,255,255,0.96)' : 'rgba(255,255,255,0)',
        borderColor: solid ? '#E8E8E8' : 'rgba(255,255,255,0)'
      }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className={`fixed inset-x-0 top-0 z-50 border-b backdrop-blur-sm ${solid ? 'shadow-[0_1px_0_rgba(17,17,17,0.03)]' : ''}`}>
      
      <div className="mx-auto flex h-20 max-w-content items-center justify-between px-6 lg:px-10">
        <Link
          to="/"
          className={`font-heading text-xl tracking-tight transition-colors ${solid ? 'text-ink' : 'text-white'}`}>
          
          Dr.<span className="text-teal">A</span>debayo
          <span className={`ml-2 align-middle text-[10px] uppercase tracking-[0.24em] ${solid ? 'text-subtle' : 'text-white/70'}`}>
            MD
          </span>
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-8 lg:flex">
          {LINKS.map((link) =>
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/'}
            className={({ isActive }) =>
            `relative text-sm transition-colors ${
            solid ? 'text-ink hover:text-teal' : 'text-white/85 hover:text-white'} ${
            isActive ? solid ? 'text-teal' : 'text-white' : ''}`
            }>
            
              {({ isActive }) =>
            <span className="relative inline-block py-1">
                  {link.label}
                  {isActive &&
              <motion.span
                layoutId="nav-underline"
                className="absolute -bottom-0.5 left-0 h-px w-full bg-teal"
                transition={{ duration: 0.35, ease: 'easeOut' }} />

              }
                </span>
            }
            </NavLink>
          )}
          <Link
            to="/contact?intent=speaking"
            className="rounded-full bg-teal px-5 py-2.5 text-sm font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-teal-dark">
            
            Book Speaking
          </Link>
        </nav>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-label={open ? 'Close menu' : 'Open menu'}
          className={`lg:hidden ${solid ? 'text-ink' : 'text-white'}`}>
          
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <AnimatePresence>
        {open &&
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.28, ease: 'easeOut' }}
          className="border-t border-line bg-white lg:hidden">
          
            <nav aria-label="Mobile" className="mx-auto max-w-content px-6 py-6">
              <ul className="space-y-1">
                {LINKS.map((link, index) =>
              <motion.li
                key={link.to}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 + index * 0.05, duration: 0.3 }}>
                
                    <NavLink
                  to={link.to}
                  end={link.to === '/'}
                  className={({ isActive }) =>
                  `block border-b border-line/70 py-4 font-heading text-2xl ${isActive ? 'text-teal' : 'text-ink'}`
                  }>
                  
                      {link.label}
                    </NavLink>
                  </motion.li>
              )}
              </ul>
              <Link
              to="/contact?intent=speaking"
              className="mt-6 block rounded-full bg-teal px-6 py-3.5 text-center text-sm font-medium text-white transition-colors hover:bg-teal-dark">
              
                Book Speaking
              </Link>
            </nav>
          </motion.div>
        }
      </AnimatePresence>
    </motion.header>);

}