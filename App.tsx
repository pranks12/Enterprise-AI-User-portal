import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import AgentIntake from './components/AgentIntake';
import AgentCatalog from './components/AgentCatalog';
import AgentEnhancement from './components/AgentEnhancement';
import Playground from './components/Playground';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'intake':
        return <AgentIntake />;
      case 'discovery':
        return <AgentCatalog />;
      case 'enhancement':
        return <AgentEnhancement />;
      case 'playground':
        return <Playground />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </Layout>
  );
};

export default App;
