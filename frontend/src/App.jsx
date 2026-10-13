import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RequireAuth from './utils/RequireAuth';

const Home = lazy(() => import('./Components/Home/Home'));
const BuyPage = lazy(() => import('./Components/Buy/BuyPage'));
const SellPage = lazy(() => import('./Components/Sell/SellPage'));
const PropertyDetail = lazy(() => import('./Components/Buy/PropertyDetail'));
const Login = lazy(() => import('./Components/Auth/Login'));
const MyListings = lazy(() => import('./Components/Sell/MyListings'));

function App() {
  return (
    <Router>
      <Suspense fallback={<div role="status">Loading page...</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/buy" element={<BuyPage />} />
          <Route path="/sell" element={
            <RequireAuth>
              <SellPage />
            </RequireAuth>
          } />
          <Route path="/property/:id" element={<PropertyDetail />} />
          <Route path="/my-listings" element={
            <RequireAuth>
              <MyListings />
            </RequireAuth>
          } />
          <Route path="/login" element={<Login />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;