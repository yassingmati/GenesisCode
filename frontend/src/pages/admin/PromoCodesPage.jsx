import React from 'react';
import PromoCodesPanel from './panels/PromoCodesPanel';

const PromoCodesPage = () => {
    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-6">Gestion des Codes Promo</h1>
            <PromoCodesPanel />
        </div>
    );
};

export default PromoCodesPage;
