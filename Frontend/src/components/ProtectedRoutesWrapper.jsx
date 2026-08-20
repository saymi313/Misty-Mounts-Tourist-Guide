import React from 'react';
import RoutesFile from '../UserPanel/Routes/RoutesFile';
import AiConcierge from './AiConcierge';

/**
 * Traveller panel shell. The panel is public — pages that require an account
 * (profile, messages, payment, etc.) are individually gated inside RoutesFile.
 */
const ProtectedRoutesWrapper = () => {
  return (
    <>
      <RoutesFile />
      <AiConcierge />
    </>
  );
};

export default ProtectedRoutesWrapper; 