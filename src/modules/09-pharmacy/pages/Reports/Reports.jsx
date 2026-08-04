import React, { useState, useEffect } from 'react';
import './Reports.css';
import { useAuth } from '../../../../hooks/useAuth';
import { pharmacyService } from '../../services/pharmacyService';
import { formatPKRSimple } from '../../../../utils/currencyFormatter';

const Reports = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchReports();
  }, [filterType, dateRange]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await pharmacyService.getReports({
        type: filterType,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      });
      setReports(response?.data?.reports || response?.reports || generateMockReports());
    } catch (error) {
      console.error('Error fetching reports:', error);
      setReports(generateMockReports());
    } finally {
      setLoading(false);
    }
  };

  const generateMockReports = () => {
    return [
      {
        id: 'report_001',
        type: 'sales',
        title: 'Monthly Sales Report',
        date: new Date().toISOString(),
        amount: 45000,
        transactions: 234,
        status: 'completed'
      },
      {
        id: 'report_002',
        type: 'inventory',
        title: 'Inventory Summary',
        date: new Date().toISOString(),
        items: 1250,
        lowStock: 45,
        status: 'completed'
      },
      {
        id: 'report_003',
        type: 'prescription',
        title: 'Prescription Fulfillment Report',
        date: new Date().toISOString(),
        total: 567,
        fulfilled: 523,
        pending: 44,
        status: 'completed'
      },
      {
        id: 'report_004',
        type: 'financial',
        title: 'Financial Summary',
        date: new Date().toISOString(),
        revenue: 125000,
        expenses: 45000,
        profit: 80000,
        status: 'completed'
      }
    ];
  };

  const handleExport = (reportId, format = 'pdf') => {
    console.log(`Exporting report ${reportId} as ${format}`);
    // TODO: Implement actual export functionality
  };

  const filteredReports = filterType === 'all' 
    ? reports 
    : reports.filter(r => r.type === filterType);

  return (
    <div className="pharmacy-reports-container">
      <div className="reports-header">
        <h1>📊 Pharmacy Reports</h1>
        <p>View and analyze your pharmacy performance and operations</p>
      </div>

      {/* Filters Section */}
      <div className="reports-filters">
        <div className="filter-group">
          <label>Report Type:</label>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="all">All Reports</option>
            <option value="sales">Sales Reports</option>
            <option value="inventory">Inventory Reports</option>
            <option value="prescription">Prescription Reports</option>
            <option value="financial">Financial Reports</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Start Date:</label>
          <input 
            type="date" 
            value={dateRange.startDate}
            onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
          />
        </div>

        <div className="filter-group">
          <label>End Date:</label>
          <input 
            type="date" 
            value={dateRange.endDate}
            onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
          />
        </div>

        <button className="btn-refresh" onClick={fetchReports}>
          🔄 Refresh
        </button>
      </div>

      {/* Reports Grid */}
      <div className="reports-grid">
        {loading ? (
          <div className="loading">Loading reports...</div>
        ) : filteredReports.length > 0 ? (
          filteredReports.map(report => (
            <div key={report.id} className="report-card">
              <div className="report-header">
                <h3>{report.title}</h3>
                <span className="report-badge">{report.type}</span>
              </div>

              <div className="report-content">
                {report.type === 'sales' && (
                  <>
                    <div className="metric">
                      <span className="label">Total Sales</span>
                      <span className="value">{formatPKRSimple(report.amount)}</span>
                    </div>
                    <div className="metric">
                      <span className="label">Transactions</span>
                      <span className="value">{report.transactions}</span>
                    </div>
                  </>
                )}

                {report.type === 'inventory' && (
                  <>
                    <div className="metric">
                      <span className="label">Total Items</span>
                      <span className="value">{report.items}</span>
                    </div>
                    <div className="metric">
                      <span className="label">Low Stock Items</span>
                      <span className="value warning">{report.lowStock}</span>
                    </div>
                  </>
                )}

                {report.type === 'prescription' && (
                  <>
                    <div className="metric">
                      <span className="label">Total Prescriptions</span>
                      <span className="value">{report.total}</span>
                    </div>
                    <div className="metric">
                      <span className="label">Fulfilled</span>
                      <span className="value success">{report.fulfilled}</span>
                    </div>
                    <div className="metric">
                      <span className="label">Pending</span>
                      <span className="value warning">{report.pending}</span>
                    </div>
                  </>
                )}

                {report.type === 'financial' && (
                  <>
                    <div className="metric">
                      <span className="label">Revenue</span>
                      <span className="value">{formatPKRSimple(report.revenue)}</span>
                    </div>
                    <div className="metric">
                      <span className="label">Expenses</span>
                      <span className="value">{formatPKRSimple(report.expenses)}</span>
                    </div>
                    <div className="metric">
                      <span className="label">Profit</span>
                      <span className="value success">{formatPKRSimple(report.profit)}</span>
                    </div>
                  </>
                )}
              </div>

              <div className="report-date">
                {new Date(report.date).toLocaleDateString()}
              </div>

              <div className="report-actions">
                <button 
                  className="btn-download" 
                  onClick={() => handleExport(report.id, 'pdf')}
                  title="Download as PDF"
                >
                  📥 PDF
                </button>
                <button 
                  className="btn-download" 
                  onClick={() => handleExport(report.id, 'excel')}
                  title="Download as Excel"
                >
                  📊 Excel
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-reports">No reports found for the selected filters.</div>
        )}
      </div>
    </div>
  );
};

export default Reports;
