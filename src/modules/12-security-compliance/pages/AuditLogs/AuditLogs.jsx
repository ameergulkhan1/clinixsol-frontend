import React from 'react';
import DataTable from '../../../../components/common/DataTable/DataTable';
import './AuditLogs.css';

const AuditLogs = () => {
  const logs = [
    { id: 1, timestamp: '2026-02-17 10:30', user: 'admin@example.com', action: 'User Created', resource: 'User #1234' },
    { id: 2, timestamp: '2026-02-17 09:15', user: 'doctor@example.com', action: 'Record Updated', resource: 'Patient #5678' }
  ];

  const columns = [
    { header: 'Timestamp', accessor: 'timestamp' },
    { header: 'User', accessor: 'user' },
    { header: 'Action', accessor: 'action' },
    { header: 'Resource', accessor: 'resource' }
  ];

  return (
    <div className="audit-logs">
      <h2>Audit Logs</h2>
      <DataTable columns={columns} data={logs} />
    </div>
  );
};

export default AuditLogs;