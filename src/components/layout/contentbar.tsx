import React, { useEffect, useState } from 'react';

import { Outlet } from 'react-router-dom';
import { Alert, Button, Card, Spin } from 'antd';
import useBranchStore from '../../store/branch';

// Custom hook for responsive breakpoints
const useResponsive = () => {
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)

  useEffect(() => {
    const checkSize = () => {
      setIsMobile(window.innerWidth <= 768)
      setIsTablet(window.innerWidth > 768 && window.innerWidth <= 1024)
    }
    
    checkSize()
    window.addEventListener('resize', checkSize)
    return () => window.removeEventListener('resize', checkSize)
  }, [])

  return { isMobile, isTablet }
}

const PageContent: React.FC = () => {
  const { isMobile, isTablet } = useResponsive()
  const { branchId, ready, error, load } = useBranchStore()

  return (
    <div style={{ 
      padding: isMobile ? "12px" : isTablet ? "16px" : "20px", 
      flex: 1,
    }}>
      <Card style={{ 
        minHeight: "100%",
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      }}>
        {error ? <Alert type="error" showIcon message={error} action={<Button onClick={() => { void load() }}>Retry</Button>} /> : ready ? <Outlet key={branchId} /> : <Spin tip="Loading branches"><div style={{ minHeight: 120 }} /></Spin>}
      </Card>
    </div>
  );
};

export default PageContent;
