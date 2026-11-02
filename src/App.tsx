import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { CapabilityStrip } from './components/CapabilityStrip';
import { PlatformSection } from './components/PlatformSection';
import { WorkflowSection } from './components/WorkflowSection';
import { BuildersSection, BuilderType } from './components/BuildersSection';
import { ClosingSection } from './components/ClosingSection';
import { Footer } from './components/Footer';
import { WaitlistModal } from './components/WaitlistModal';
import { InquiryModal } from './components/InquiryModal';
import { QuickStartModal } from './components/QuickStartModal';
import { AdminDashboard } from './components/AdminDashboard';
import { PlatformDemoPage } from './components/PlatformDemoPage';

export const App: React.FC = () => {
  const [isAdminView, setIsAdminView] = useState(() => {
    if (typeof window !== 'undefined' && window.location.hash === '#admin') {
      window.history.replaceState(null, '', '/admin');
      return true;
    }
    return typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
  });

  const [isPlatformView, setIsPlatformView] = useState(() => {
    if (typeof window !== 'undefined' && window.location.hash === '#platform-sandbox') {
      return true;
    }
    return typeof window !== 'undefined' && window.location.pathname.startsWith('/platform');
  });

  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);
  const [isQuickStartOpen, setIsQuickStartOpen] = useState(false);
  const [currentBuilderRole, setCurrentBuilderRole] = useState<BuilderType>('fullstack');

  useEffect(() => {
    const handlePopState = () => {
      setIsAdminView(window.location.pathname.startsWith('/admin'));
      setIsPlatformView(window.location.pathname.startsWith('/platform'));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const openAdmin = () => {
    window.history.pushState(null, '', '/admin');
    setIsAdminView(true);
    setIsPlatformView(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const closeAdmin = () => {
    window.history.pushState(null, '', '/');
    setIsAdminView(false);
    setIsPlatformView(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openPlatformDemo = () => {
    window.history.pushState(null, '', '/platform');
    setIsPlatformView(true);
    setIsAdminView(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const closePlatformDemo = () => {
    window.history.pushState(null, '', '/');
    setIsPlatformView(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="orbit-app">
      {isAdminView ? (
        <AdminDashboard onBackToWebsite={closeAdmin} />
      ) : isPlatformView ? (
        <PlatformDemoPage
          onBackToWebsite={closePlatformDemo}
          onOpenQuickStart={() => setIsQuickStartOpen(true)}
          onOpenWaitlist={() => setIsWaitlistOpen(true)}
        />
      ) : (
        <>
          <Header
            onOpenWaitlist={() => setIsWaitlistOpen(true)}
            onOpenAdmin={openAdmin}
            onOpenPlatformDemo={openPlatformDemo}
            onOpenQuickStart={() => setIsQuickStartOpen(true)}
            isAdminView={false}
          />
          <main id="top">
            <Hero
              currentBuilderRole={currentBuilderRole}
              onOpenQuickStart={() => setIsQuickStartOpen(true)}
              onOpenPlatformDemo={openPlatformDemo}
            />
            <CapabilityStrip />
            <PlatformSection onOpenPlatformDemo={openPlatformDemo} />
            <WorkflowSection />
            <BuildersSection onRoleChange={setCurrentBuilderRole} />
            <ClosingSection
              onOpenWaitlist={() => setIsWaitlistOpen(true)}
              onOpenInquiry={() => setIsInquiryOpen(true)}
            />
          </main>
          <Footer
            onOpenAdmin={openAdmin}
            onOpenQuickStart={() => setIsQuickStartOpen(true)}
            onOpenPlatformDemo={openPlatformDemo}
          />
        </>
      )}

      {/* Global Modals */}
      <WaitlistModal
        isOpen={isWaitlistOpen}
        onClose={() => setIsWaitlistOpen(false)}
        onOpenAdmin={openAdmin}
      />
      <InquiryModal
        isOpen={isInquiryOpen}
        onClose={() => setIsInquiryOpen(false)}
        onOpenAdmin={openAdmin}
      />
      <QuickStartModal
        isOpen={isQuickStartOpen}
        onClose={() => setIsQuickStartOpen(false)}
      />
    </div>
  );
};

export default App;
