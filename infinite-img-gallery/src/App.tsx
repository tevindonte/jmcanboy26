import { useEffect, useState } from 'react';
import Index from './pages/Index';
import Loader from './components/Loader';

function App() {
  const [showLoader, setShowLoader] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setShowLoader(false);
    }, 1500);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <>
      <Loader visible={showLoader} />
      <main id="main">
        <Index />
      </main>
    </>
  );
}

export default App;
