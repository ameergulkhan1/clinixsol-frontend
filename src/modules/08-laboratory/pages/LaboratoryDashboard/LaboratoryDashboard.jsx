import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import laboratoryService from '../../services/laboratoryService';
import Loader from '../../../../components/common/Loader/Loader';
import Button from '../../../../components/common/Button/Button';
import Card from '../../../../components/common/Card/Card';
import { useAuth } from '../../../../context/AuthContext';
import './LaboratoryDashboard.css';

const LaboratoryDashboard = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [results, setResults] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const normalizedRole = String(user?.role || '').trim().toLowerCase();
  const isLabUser = normalizedRole === 'lab' || normalizedRole === 'laboratory';

  useEffect(() => {
    fetchDashboardData();
  }, [orderId, isLabUser]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      if (isLabUser) {
        const ordersRes = await laboratoryService.getLabOrders();
        const list = ordersRes?.success ? ordersRes.data || [] : [];
        setOrders(list);

        if (orderId) {
          const detail = await laboratoryService.getOrderById(orderId);
          if (detail?.success) {
            setSelectedOrder(detail.data);
          } else {
            setSelectedOrder(list.find((item) => item._id === orderId) || list[0] || null);
          }
        } else {
          setSelectedOrder(list[0] || null);
        }

        setResults([]);
      } else {
        const [ordersRes, resultsRes] = await Promise.all([
          laboratoryService.getPatientOrders(),
          laboratoryService.getPatientResults()
        ]);

        const orderList = ordersRes?.success ? ordersRes.data || [] : [];
        const resultList = resultsRes?.success ? resultsRes.data || [] : [];

        setOrders(orderList);
        setResults(resultList);

        if (orderId) {
          const detail = await laboratoryService.getOrderById(orderId);
          if (detail?.success) {
            setSelectedOrder(detail.data);
          } else {
            setSelectedOrder(orderList.find((item) => item._id === orderId) || orderList[0] || null);
          }
        } else {
          setSelectedOrder(orderList[0] || null);
        }
      }
    } catch (error) {
      console.error('Dashboard fetch error:', error);
      toast.error(error?.message || 'Failed to load laboratory dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadgeClass = (status) => {
    const statusMap = {
      scheduled: 'status-badge-warning',
      'in-progress': 'status-badge-info',
      completed: 'status-badge-success',
      cancelled: 'status-badge-danger'
    };
    return statusMap[status] || 'status-badge-default';
  };

  const pendingOrders = useMemo(
    () => orders.filter((order) => ['scheduled', 'in-progress'].includes(order.orderStatus)).length,
    [orders]
  );

  const publishResultForTest = async (order, test) => {
    const interpretation = window.prompt('Interpretation / summary for this test result:', '') || '';
    const overallResult = (window.prompt('Overall result (normal/abnormal/critical):', 'normal') || 'normal').toLowerCase();

    try {
      setActionLoading(true);
      const payload = {
        interpretation,
        overallResult,
        markReported: true,
        parameters: []
      };

      const response = await laboratoryService.publishResult(order._id, test.testId?._id || test.testId, payload);
      if (!response?.success) {
        throw new Error(response?.message || 'Failed to publish result');
      }

      toast.success('Result published and patient notified');
      await fetchDashboardData();
    } catch (error) {
      toast.error(error?.message || 'Unable to publish result');
    } finally {
      setActionLoading(false);
    }
  };

  const updateOrderStatus = async (status) => {
    if (!selectedOrder?._id) return;

    try {
      setActionLoading(true);
      const response = await laboratoryService.updateOrderStatus(selectedOrder._id, {
        status,
        note: `Status updated to ${status}`
      });
      if (!response?.success) {
        throw new Error(response?.message || 'Failed to update order status');
      }
      toast.success('Order status updated');
      await fetchDashboardData();
    } catch (error) {
      toast.error(error?.message || 'Unable to update status');
    } finally {
      setActionLoading(false);
    }
  };

  const cancelPatientOrder = async (order) => {
    const reason = window.prompt('Reason for cancellation:', '') || 'Cancelled by patient';

    try {
      setActionLoading(true);
      const response = await laboratoryService.cancelOrder(order._id, reason);
      if (!response?.success) {
        throw new Error(response?.message || 'Failed to cancel order');
      }
      toast.success('Order cancelled successfully');
      await fetchDashboardData();
    } catch (error) {
      toast.error(error?.message || 'Unable to cancel order');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <Loader message="Loading laboratory dashboard..." />;
  }

  return (
    <div className="laboratory-dashboard">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">{isLabUser ? 'Laboratory Operations' : 'Laboratory Dashboard'}</h1>
          <p className="dashboard-subtitle">
            {isLabUser
              ? 'Manage bookings, update status, and publish reports.'
              : 'Track bookings, test processing, and ready reports.'}
          </p>
        </div>
        {!isLabUser ? (
          <Link to="/laboratory/book-test" className="btn-primary">Book Lab Test</Link>
        ) : null}
      </div>

      <div className="stats-grid">
        <div className="stat-card stat-blue">
          <div className="stat-content">
            <div className="stat-value">{orders.length}</div>
            <div className="stat-label">Total Orders</div>
          </div>
        </div>
        <div className="stat-card stat-yellow">
          <div className="stat-content">
            <div className="stat-value">{pendingOrders}</div>
            <div className="stat-label">In Queue</div>
          </div>
        </div>
        <div className="stat-card stat-green">
          <div className="stat-content">
            <div className="stat-value">{orders.filter((order) => order.orderStatus === 'completed').length}</div>
            <div className="stat-label">Completed</div>
          </div>
        </div>
        <div className="stat-card stat-purple">
          <div className="stat-content">
            <div className="stat-value">{isLabUser ? orders.filter((order) => order.tests?.some((test) => test.status !== 'completed')).length : results.length}</div>
            <div className="stat-label">{isLabUser ? 'Pending Reports' : 'Reports Available'}</div>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-section">
          <div className="section-header">
            <h2 className="section-title">Orders</h2>
          </div>

          {orders.length === 0 ? (
            <div className="empty-state">
              <p className="empty-text">No orders found</p>
              {!isLabUser ? <Link to="/laboratory/book-test" className="btn-secondary">Book Your First Test</Link> : null}
            </div>
          ) : (
            <div className="orders-list">
              {orders.map((order) => (
                <Card key={order._id} className="order-card" onClick={() => setSelectedOrder(order)}>
                  <div className="order-header">
                    <div>
                      <h3 className="order-number">{order.orderNumber}</h3>
                      <p className="order-date">{formatDate(order.appointmentDate)}</p>
                    </div>
                    <span className={`status-badge ${getStatusBadgeClass(order.orderStatus)}`}>
                      {order.orderStatus}
                    </span>
                  </div>
                  <div className="order-tests">
                    <p className="tests-count">{order.tests?.length || 0} test(s)</p>
                    {!isLabUser ? <p>{order.laboratory?.labName || 'Laboratory assigned'}</p> : null}
                  </div>
                  <div className="order-footer">
                    <span className="order-amount">INR {order.totalAmount}</span>
                    <Button
                      variant="secondary"
                      size="small"
                      onClick={(event) => {
                        event.stopPropagation();
                        navigate(`/laboratory/orders/${order._id}`);
                      }}
                    >
                      View
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="dashboard-section">
          <div className="section-header">
            <h2 className="section-title">{selectedOrder ? `Order ${selectedOrder.orderNumber}` : 'Order Details'}</h2>
          </div>

          {selectedOrder ? (
            <Card className="result-card">
              <p><strong>Status:</strong> {selectedOrder.orderStatus}</p>
              <p><strong>Appointment:</strong> {formatDate(selectedOrder.appointmentDate)}</p>
              <p><strong>Collection:</strong> {selectedOrder.sampleCollectionType}</p>
              <p><strong>Instructions:</strong> {selectedOrder.specialInstructions || 'N/A'}</p>

              <h4>Status Timeline</h4>
              {(selectedOrder.statusHistory || []).map((entry, index) => (
                <p key={`status-${index}`}>
                  {formatDate(entry.updatedAt)} - <strong>{entry.status}</strong> {entry.note ? `(${entry.note})` : ''}
                </p>
              ))}

              <h4>Tests</h4>
              {(selectedOrder.tests || []).map((test, index) => (
                <div key={`test-${index}`} className="medication-item">
                  <div className="medication-name">{test.testName}</div>
                  <div className="medication-details">
                    <span>{test.testCode}</span>
                    <span>Status: {test.status}</span>
                    <span>INR {test.price}</span>
                  </div>
                  {isLabUser && test.status !== 'completed' ? (
                    <Button
                      variant="primary"
                      size="small"
                      onClick={() => publishResultForTest(selectedOrder, test)}
                      disabled={actionLoading}
                    >
                      Publish Result
                    </Button>
                  ) : null}
                </div>
              ))}

              <div className="prescription-actions">
                {isLabUser ? (
                  <>
                    <Button variant="secondary" size="small" onClick={() => updateOrderStatus('in-progress')} disabled={actionLoading}>
                      Mark In Progress
                    </Button>
                    <Button variant="primary" size="small" onClick={() => updateOrderStatus('completed')} disabled={actionLoading}>
                      Mark Completed
                    </Button>
                  </>
                ) : (
                  <>
                    {selectedOrder.orderStatus !== 'completed' && selectedOrder.orderStatus !== 'cancelled' ? (
                      <Button variant="secondary" size="small" onClick={() => cancelPatientOrder(selectedOrder)} disabled={actionLoading}>
                        Cancel Order
                      </Button>
                    ) : null}
                    <Link to="/laboratory/results">Go to Results</Link>
                  </>
                )}
              </div>
            </Card>
          ) : (
            <div className="empty-state">
              <p className="empty-text">Select an order to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LaboratoryDashboard;
