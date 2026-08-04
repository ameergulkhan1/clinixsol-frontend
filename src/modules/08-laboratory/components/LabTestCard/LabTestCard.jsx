import React from 'react';
import Card from '../../../../components/common/Card/Card';
import { formatPKRSimple } from '../../../../utils/currencyFormatter';
import './LabTestCard.css';

const LabTestCard = ({ test, isSelected, onSelect }) => {
  return (
    <Card className={`lab-test-card ${isSelected ? 'selected' : ''}`}>
      <div className="test-header">
        <h3 className="test-title">{test.testName}</h3>
        <span className="test-code">{test.testCode}</span>
      </div>
      
      <p className="test-description">{test.description}</p>
      
      <div className="test-details">
        {test.category && (
          <div className="detail-item">
            <span className="detail-label">Category:</span>
            <span className="detail-value">{test.category}</span>
          </div>
        )}
        {test.processingTime && (
          <div className="detail-item">
            <span className="detail-label">Processing:</span>
            <span className="detail-value">{test.processingTime}</span>
          </div>
        )}
        {test.fastingRequired && (
          <div className="detail-item fasting-required">
            ⚠️ Fasting Required
          </div>
        )}
      </div>
      
      <div className="test-footer">
        <span className="test-price">{formatPKRSimple(test.price)}</span>
        <button 
          className={`btn-select ${isSelected ? 'selected' : ''}`}
          onClick={() => onSelect(test)}
        >
          {isSelected ? '✓ Selected' : 'Select'}
        </button>
      </div>
    </Card>
  );
};

export default LabTestCard;
