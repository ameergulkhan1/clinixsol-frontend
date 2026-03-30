import api from '../../../services/api';
import { jsPDF } from 'jspdf';

const LOCAL_SYMPTOM_RESULTS_KEY = 'clinixsol_symptom_results';

const readLocalResults = () => {
  try {
    const rawResults = localStorage.getItem(LOCAL_SYMPTOM_RESULTS_KEY);
    if (!rawResults) return [];

    const parsedResults = JSON.parse(rawResults);
    return Array.isArray(parsedResults) ? parsedResults : [];
  } catch (error) {
    console.error('Failed to read local symptom results:', error);
    return [];
  }
};

const writeLocalResults = (results) => {
  localStorage.setItem(LOCAL_SYMPTOM_RESULTS_KEY, JSON.stringify(results));
};

const ensureLocalCheckId = (checkData = {}) => {
  return checkData.checkId || checkData._id || checkData.localCheckId || `local-${Date.now()}`;
};

const toDisplayText = (value) => {
  if (value === null || value === undefined || value === '') return 'N/A';
  return String(value);
};

const addWrappedText = (doc, text, x, y, maxWidth, lineHeight = 6) => {
  const lines = doc.splitTextToSize(String(text), maxWidth);
  doc.text(lines, x, y);
  return y + (lines.length * lineHeight);
};

export const symptomService = {
  // Get all available symptoms
  getAvailableSymptoms: async () => {
    const response = await api.get('/symptoms/available');
    return response.data;
  },

  // Check symptoms and get disease predictions
  checkSymptoms: async (symptomData) => {
    const response = await api.post('/symptoms/check', symptomData);
    return response.data;
  },

  cacheSymptomResult: (checkData) => {
    const checkId = ensureLocalCheckId(checkData);
    const existingResults = readLocalResults();

    const normalizedRecord = {
      ...checkData,
      checkId,
      localOnly: !checkData?.checkId && !checkData?._id,
      createdAt: checkData?.createdAt || new Date().toISOString()
    };

    const filteredResults = existingResults.filter(
      (result) => (result.checkId || result._id || result.localCheckId) !== checkId
    );

    writeLocalResults([normalizedRecord, ...filteredResults].slice(0, 100));
    return normalizedRecord;
  },

  getLatestCachedResult: () => {
    const results = readLocalResults();
    return results[0] || null;
  },

  getCachedResultById: (checkId) => {
    if (!checkId) return null;

    const results = readLocalResults();
    return (
      results.find(
        (result) =>
          result?.checkId === checkId ||
          result?._id === checkId ||
          result?.localCheckId === checkId
      ) || null
    );
  },

  getCachedResults: () => {
    return readLocalResults();
  },

  markCachedResultAsSaved: (checkData) => {
    const cachedResult = symptomService.cacheSymptomResult({
      ...checkData,
      savedToRecords: true
    });

    return cachedResult;
  },

  // Get symptom check history for logged-in patient
  getSymptomHistory: async () => {
    const response = await api.get('/symptoms/history');
    return response.data;
  },

  // Get specific symptom check by ID
  getSymptomCheckById: async (checkId) => {
    const response = await api.get(`/symptoms/history/${checkId}`);
    return response.data;
  },

  // Save symptom check to medical records
  saveCheckToRecords: async (checkId) => {
    const response = await api.post('/symptoms/save-check', { checkId });
    return response.data;
  },

  // Update check status
  updateCheckStatus: async (checkId, status) => {
    const response = await api.patch(`/symptoms/check/${checkId}`, { status });
    return response.data;
  },

  // Get symptom check statistics
  getStatistics: async () => {
    const response = await api.get('/symptoms/statistics');
    return response.data;
  },

  // Generate PDF report
  generatePDFReport: async (checkId) => {
    const response = await api.get(`/symptoms/pdf/${checkId}`, {
      responseType: 'blob'
    });
    return response.data;
  },

  downloadPDFReportFromData: (checkData, filename = 'symptom-check-report.pdf') => {
    const doc = new jsPDF();
    const generatedAt = checkData?.createdAt
      ? new Date(checkData.createdAt).toLocaleString()
      : new Date().toLocaleString();

    const symptoms = Array.isArray(checkData?.symptoms)
      ? checkData.symptoms.map((symptom) => symptom?.label || symptom?.name || symptom?.id || symptom)
      : [];

    const predictions = Array.isArray(checkData?.predictions) ? checkData.predictions : [];
    const recommendations = Array.isArray(checkData?.recommendations)
      ? checkData.recommendations.map((item) => item?.message || item)
      : [];

    let y = 16;
    doc.setFontSize(16);
    doc.text('Symptom Check Report', 14, y);

    y += 8;
    doc.setFontSize(10);
    doc.text(`Generated: ${generatedAt}`, 14, y);

    y += 8;
    doc.setFontSize(12);
    doc.text('Urgency', 14, y);

    y += 6;
    doc.setFontSize(10);
    y = addWrappedText(
      doc,
      `Level: ${toDisplayText(checkData?.urgencyLevel)}`,
      14,
      y,
      180
    );
    y = addWrappedText(
      doc,
      `Message: ${toDisplayText(checkData?.urgencyMessage)}`,
      14,
      y + 1,
      180
    );

    y += 6;
    doc.setFontSize(12);
    doc.text('Symptoms', 14, y);

    y += 6;
    doc.setFontSize(10);
    if (symptoms.length === 0) {
      y = addWrappedText(doc, 'No symptoms listed', 14, y, 180);
    } else {
      symptoms.forEach((symptom, index) => {
        y = addWrappedText(doc, `${index + 1}. ${symptom}`, 14, y, 180);
      });
    }

    y += 6;
    if (y > 265) {
      doc.addPage();
      y = 16;
    }

    doc.setFontSize(12);
    doc.text('Top Predictions', 14, y);

    y += 6;
    doc.setFontSize(10);
    if (predictions.length === 0) {
      y = addWrappedText(doc, 'No predictions available', 14, y, 180);
    } else {
      predictions.slice(0, 5).forEach((prediction, index) => {
        const probability = typeof prediction?.probability === 'number'
          ? `${Math.round(prediction.probability * 100)}%`
          : 'N/A';
        const confidence = toDisplayText(prediction?.confidence);
        y = addWrappedText(
          doc,
          `${index + 1}. ${toDisplayText(prediction?.disease)} (${probability}, ${confidence} confidence)`,
          14,
          y,
          180
        );
      });
    }

    if (recommendations.length > 0) {
      y += 6;
      if (y > 265) {
        doc.addPage();
        y = 16;
      }

      doc.setFontSize(12);
      doc.text('Recommendations', 14, y);

      y += 6;
      doc.setFontSize(10);
      recommendations.forEach((recommendation, index) => {
        y = addWrappedText(doc, `${index + 1}. ${recommendation}`, 14, y, 180);
      });
    }

    doc.save(filename);
  }
};

export default symptomService;