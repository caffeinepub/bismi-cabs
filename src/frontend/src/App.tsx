import { useState } from 'react';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { LoginPage } from './pages/LoginPage';
import { BookingFormPage } from './pages/BookingFormPage';
import { LeadsPage } from './pages/LeadsPage';
import { RateCardPage } from './pages/RateCardPage';
import { AppShell } from './components/AppShell';

type Page = 'login' | 'booking' | 'leads' | 'rateCard';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('login');
  const { identity } = useInternetIdentity();

  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();

  // Render page based on current route
  const renderPage = () => {
    if (!isAuthenticated && currentPage !== 'login') {
      return <LoginPage onNavigate={setCurrentPage} />;
    }

    switch (currentPage) {
      case 'booking':
        return <BookingFormPage />;
      case 'leads':
        return <LeadsPage />;
      case 'rateCard':
        return <RateCardPage />;
      case 'login':
      default:
        return <LoginPage onNavigate={setCurrentPage} />;
    }
  };

  return (
    <AppShell currentPage={currentPage} onNavigate={setCurrentPage}>
      {renderPage()}
    </AppShell>
  );
}

export default App;
