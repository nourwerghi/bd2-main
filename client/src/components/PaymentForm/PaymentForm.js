import React, { useState } from 'react';
import { useCartStore } from '../../lib/store';
import './PaymentForm.css';

const PaymentForm = ({ onSubmit }) => {
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [formData, setFormData] = useState({
    // Card payment fields
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: '',
    // Cash on delivery fields
    deliveryAddress: '',
    city: '',
    postalCode: '',
    phone: ''
  });
  const [errors, setErrors] = useState({});
  const { total } = useCartStore();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (paymentMethod === 'card') {
      if (!formData.cardNumber.match(/^\d{16}$/)) {
        newErrors.cardNumber = 'Veuillez entrer un numéro de carte valide à 16 chiffres';
      }
      if (!formData.cardHolder.trim()) {
        newErrors.cardHolder = 'Le nom du titulaire de la carte est requis';
      }
      if (!formData.expiryDate.match(/^(0[1-9]|1[0-2])\/([0-9]{2})$/)) {
        newErrors.expiryDate = 'Veuillez entrer une date d\'expiration valide (MM/AA)';
      }
      if (!formData.cvv.match(/^\d{3,4}$/)) {
        newErrors.cvv = 'Veuillez entrer un CVV valide';
      }
    } else {
      if (!formData.deliveryAddress.trim()) {
        newErrors.deliveryAddress = 'L\'adresse de livraison est requise';
      }
      if (!formData.city.trim()) {
        newErrors.city = 'La ville est requise';
      }
      if (!formData.postalCode.trim()) {
        newErrors.postalCode = 'Le code postal est requis';
      }
      if (!formData.phone.match(/^\+?[0-9\s\-()]{6,20}$/)) {
        newErrors.phone = 'Veuillez entrer un numéro de téléphone valide';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const orderData = {
        paymentMethod,
        formData,
        status: paymentMethod === 'cash' ? 'pending_approval' : 'processing'
      };
      onSubmit(orderData);
    }
  };

  return (
    <div className="payment-form">
      <h2>Informations de Paiement</h2>
      <div className="total-amount">
        <span>Montant Total:</span>
        <span className="amount">{Number(typeof total === 'function' ? total() : total || 0).toFixed(2)} TND</span>
      </div>

      <div className="payment-method-selector">
        <button
          type="button"
          className={`method-button ${paymentMethod === 'card' ? 'active' : ''}`}
          onClick={() => setPaymentMethod('card')}
        >
          Paiement par Carte
        </button>
        <button
          type="button"
          className={`method-button ${paymentMethod === 'cash' ? 'active' : ''}`}
          onClick={() => setPaymentMethod('cash')}
        >
          Paiement à la Livraison
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {paymentMethod === 'card' ? (
          <div className="card-payment-section">
            <div className="form-group">
              <label htmlFor="cardNumber">Numéro de Carte</label>
              <input
                type="text"
                id="cardNumber"
                name="cardNumber"
                value={formData.cardNumber}
                onChange={handleInputChange}
                placeholder="1234 5678 9012 3456"
                maxLength="16"
              />
              {errors.cardNumber && <span className="error">{errors.cardNumber}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="cardHolder">Nom du Titulaire</label>
              <input
                type="text"
                id="cardHolder"
                name="cardHolder"
                value={formData.cardHolder}
                onChange={handleInputChange}
                placeholder="John Doe"
              />
              {errors.cardHolder && <span className="error">{errors.cardHolder}</span>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="expiryDate">Date d'Expiration</label>
                <input
                  type="text"
                  id="expiryDate"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleInputChange}
                  placeholder="MM/AA"
                  maxLength="5"
                />
                {errors.expiryDate && <span className="error">{errors.expiryDate}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="cvv">CVV</label>
                <input
                  type="password"
                  id="cvv"
                  name="cvv"
                  value={formData.cvv}
                  onChange={handleInputChange}
                  placeholder="123"
                  maxLength="4"
                />
                {errors.cvv && <span className="error">{errors.cvv}</span>}
              </div>
            </div>
          </div>
        ) : (
          <div className="cash-delivery-section">
            <div className="form-group">
              <label htmlFor="deliveryAddress">Adresse de Livraison</label>
              <textarea
                id="deliveryAddress"
                name="deliveryAddress"
                value={formData.deliveryAddress}
                onChange={handleInputChange}
                placeholder="Entrez votre adresse de livraison"
              />
              {errors.deliveryAddress && <span className="error">{errors.deliveryAddress}</span>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="city">Ville</label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="Entrez votre ville"
                />
                {errors.city && <span className="error">{errors.city}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="postalCode">Code Postal</label>
                <input
                  type="text"
                  id="postalCode"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleInputChange}
                  placeholder="Entrez votre code postal"
                  maxLength="15"
                />
                {errors.postalCode && <span className="error">{errors.postalCode}</span>}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="phone">Numéro de Téléphone</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Entrez votre numéro de téléphone"
                maxLength="10"
              />
              {errors.phone && <span className="error">{errors.phone}</span>}
            </div>
          </div>
        )}

        <button type="submit" className="submit-button">
          Valider Demande
        </button>
      </form>
    </div>
  );
};

export default PaymentForm;