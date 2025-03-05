import React, { useState } from 'react';
import { api } from '../../lib/api';
import './ReclamationForm.css';

const ReclamationForm = () => {
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    priority: 'normal',
    status: 'pending'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/reclamations', formData);
      
      // Reset form
      setFormData({
        subject: '',
        description: '',
        priority: 'normal',
        status: 'pending'
      });

      // Show success message
      alert('Votre réclamation a été soumise avec succès');
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la soumission de la réclamation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reclamation-form">
      <h2>Soumettre une Réclamation</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="subject">Sujet</label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            required
            placeholder="Sujet de votre réclamation"
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            placeholder="Décrivez votre réclamation en détail"
            rows="5"
          />
        </div>

        <div className="form-group">
          <label htmlFor="priority">Priorité</label>
          <select
            id="priority"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            required
          >
            <option value="low">Basse</option>
            <option value="normal">Normale</option>
            <option value="high">Haute</option>
            <option value="urgent">Urgente</option>
          </select>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Soumission en cours...' : 'Soumettre la réclamation'}
        </button>
      </form>
    </div>
  );
};

export default ReclamationForm;