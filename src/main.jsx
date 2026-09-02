import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { BrowserRouter } from 'react-router-dom';
import ShopContextProvider from './context/ShopContext.jsx';
import { configureAuth } from './amplify-auth';

configureAuth()
  .then(() =>
    createRoot(document.getElementById('root')).render(
      <BrowserRouter>
        <ShopContextProvider>
          <App />
        </ShopContextProvider>
      </BrowserRouter>,
    ),
  )
  .catch(() => {
    document.getElementById('root').textContent =
      'Configuration error. Check .env.example and restart the development server.';
  });
