import React from 'react'
import { AuthProvider } from './context/AuthContext'
import AppRouter from './routes/AppRouter'
import './App.css'
import { PublicClientApplication } from '@azure/msal-browser';
import { MsalProvider } from '@azure/msal-react';

const msalConfig = {
  auth: {
    clientId: 'ef43c3fa-f15a-42cf-8316-7ce7957375c1',
    authority: 'https://login.microsoftonline.com/common',
    redirectUri: window.location.origin + '/login',
  },
};
const msalInstance = new PublicClientApplication(msalConfig);

function App() {
  return (
    <MsalProvider instance={msalInstance}>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </MsalProvider>
  )
}

export default App