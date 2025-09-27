// src/components/Footer.jsx
import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-dark text-white py-4 mt-auto">
      <div className="container">
        <div className="row">
          <div className="col-md-6">
            <h5>CodeGenesis</h5>
            <p>Plateforme d'apprentissage en ligne pour développeurs</p>
          </div>
          <div className="col-md-6 text-md-end">
            <p>&copy; {new Date().getFullYear()} CodeGenesis. Tous droits réservés.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;