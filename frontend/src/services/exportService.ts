import { API_BASE_URL } from '../config/api';
import { getAuthToken } from './api';

export const exportService = {
  downloadPdf(tripId: string, tripTitle: string) {
    const token = getAuthToken();
    const url = `${API_BASE_URL}/exports/${tripId}/pdf`;
    
    // Trigger download with auth header using fetch blob
    fetch(url, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    })
    .then(response => {
      if (!response.ok) throw new Error('PDF Export failed');
      return response.blob();
    })
    .then(blob => {
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      const safeTitle = tripTitle.replace(/[^a-zA-Z0-9_-]/g, '_');
      a.download = `ARC_NOMADE_${safeTitle}_Itinerary.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
    })
    .catch(err => {
      console.error('PDF download error:', err);
      alert('Failed to download PDF export. Please try again.');
    });
  },

  downloadExcel(tripId: string, tripTitle: string) {
    const token = getAuthToken();
    const url = `${API_BASE_URL}/exports/${tripId}/excel`;

    fetch(url, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    })
    .then(response => {
      if (!response.ok) throw new Error('Excel Export failed');
      return response.blob();
    })
    .then(blob => {
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      const safeTitle = tripTitle.replace(/[^a-zA-Z0-9_-]/g, '_');
      a.download = `ARC_NOMADE_${safeTitle}_Dossier.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
    })
    .catch(err => {
      console.error('Excel download error:', err);
      alert('Failed to download Excel export. Please try again.');
    });
  }
};
