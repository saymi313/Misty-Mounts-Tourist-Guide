import React from 'react';
import { Routes } from 'react-router-dom';
import LocalGuideRoutes from './routes/LocalGuideRoutes';

/**
 * Local Guide panel. Each page provides its own dashboard shell (GuideLayout),
 * so this is just the route host.
 */
const LocalGuidePanel = () => {
  return <Routes>{LocalGuideRoutes()}</Routes>;
};

export default LocalGuidePanel;
