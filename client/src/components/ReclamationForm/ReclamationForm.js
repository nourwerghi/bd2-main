import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
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
      const response = await axios.post('http://localhost:5000/api/reclamations', formData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.success) {
        // Reset form
        setFormData({
          subject: '',
          description: '',
          priority: 'normal',
          status: 'pending'
        });

        // Show success message
        toast.success('Votre réclamation a été soumise avec succès');
      } else {
        throw new Error(response.data.message || 'Une erreur est survenue');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Une erreur est survenue lors de l\'envoi de la réclamation';
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reclamation-form">
      <h2>Soumettre une Réclamation</h2>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded relative mb-4">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
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
            className={error ? 'error' : ''}
            disabled={loading}
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
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="priority">Priorité</label>
          <select
            id="priority"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            disabled={loading}
          >
            <option value="low">Basse</option>
            <option value="normal">Normale</option>
            <option value="high">Haute</option>
          </select>
        </div>

        <button 
          type="submit" 
          className="submit-button" 
          disabled={loading}
        >
          {loading ? 'Envoi en cours...' : 'Soumettre la réclamation'}
        </button>
      </form>
    </div>
  );
};

export default ReclamationForm;