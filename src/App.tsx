import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './lib/AuthProvider';
import { SiteSettingsProvider } from './lib/SiteSettingsProvider';
import { SiteLayout } from './components/site/SiteLayout';
import { AdminLayout } from './components/admin/AdminLayout';
import { ProtectedRoute } from './components/admin/ProtectedRoute';
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Articles } from './pages/Articles';
import { ArticleDetail } from './pages/ArticleDetail';
import { Gallery } from './pages/Gallery';
import { ProjectsSpeaking } from './pages/ProjectsSpeaking';
import { RabbitFarm } from './pages/RabbitFarm';
import { Contact } from './pages/Contact';
import { AdminLogin } from './pages/admin/Login';
import { AdminDashboard } from './pages/admin/Dashboard';
import { ArticlesAdmin } from './pages/admin/ArticlesAdmin';
import { GalleryAdmin } from './pages/admin/GalleryAdmin';
import { ProjectsAdmin } from './pages/admin/ProjectsAdmin';
import { EventsAdmin } from './pages/admin/EventsAdmin';
import { MediaAdmin } from './pages/admin/MediaAdmin';
import { RabbitFarmAdmin } from './pages/admin/RabbitFarmAdmin';
import { TestimonialsAdmin } from './pages/admin/TestimonialsAdmin';
import { MessagesAdmin } from './pages/admin/MessagesAdmin';
import { SubscribersAdmin } from './pages/admin/SubscribersAdmin';
import { SettingsAdmin } from './pages/admin/SettingsAdmin';

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SiteSettingsProvider>
          <Routes>
            <Route element={<SiteLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/articles" element={<Articles />} />
              <Route path="/articles/:slug" element={<ArticleDetail />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/projects-speaking" element={<ProjectsSpeaking />} />
              <Route path="/rabbit-farm" element={<RabbitFarm />} />
              <Route path="/contact" element={<Contact />} />
            </Route>

            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin"
              element={
              <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }>
              
              <Route index element={<AdminDashboard />} />
              <Route path="articles" element={<ArticlesAdmin />} />
              <Route path="gallery" element={<GalleryAdmin />} />
              <Route path="projects" element={<ProjectsAdmin />} />
              <Route path="events" element={<EventsAdmin />} />
              <Route path="media" element={<MediaAdmin />} />
              <Route path="rabbit-farm" element={<RabbitFarmAdmin />} />
              <Route path="testimonials" element={<TestimonialsAdmin />} />
              <Route path="messages" element={<MessagesAdmin />} />
              <Route path="subscribers" element={<SubscribersAdmin />} />
              <Route path="settings" element={<SettingsAdmin />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Toaster position="bottom-right" richColors closeButton />
        </SiteSettingsProvider>
      </AuthProvider>
    </BrowserRouter>);

}