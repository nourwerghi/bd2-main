const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');
const Message = require('../models/Message');

// Get user by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Update user seller status
router.put('/become-seller', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.isSeller = true;
    await user.save();
    
    // Find top admin to send the message
    const topAdmin = await User.findOne({ role: 'admin' });
    
    if (topAdmin) {
      // Create a new message with all user coordinates/information
      await Message.create({
        sender: user._id,
        recipient: topAdmin._id,
        subject: 'Nouvelle demande de vendeur',
        content: `
          Nouvelle demande de vendeur validée:
          Nom: ${user.name}
          Email: ${user.email}
          Téléphone: ${user.phone || 'Non spécifié'}
          Adresse: ${user.address || 'Non spécifiée'}
          Date d'inscription: ${user.createdAt}
        `,
        isRead: false,
        type: 'seller_request'
      });
    }
    
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.json(userResponse);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Add new route for payment on delivery validation
router.post('/validate-payment', auth, async (req, res) => {
  try {
    const { productId, shippingAddress, productDetails } = req.body;
    const user = await User.findById(req.user._id);
    
    // Find top admin to send the message
    const topAdmin = await User.findOne({ isTopAdmin: true });
    
    if (topAdmin) {
      // Create a new message with detailed client information for shipping
      await Message.create({
        sender: user._id,
        recipient: topAdmin._id,
        subject: 'Demande de paiement à la livraison',
        content: `
          Un client a validé une demande de paiement à la livraison:
          
          Coordonnées du client:
          Nom: ${user.name}
          Email: ${user.email}
          Téléphone: ${user.phone || 'Non spécifié'}
          
          Adresse de livraison:
          ${shippingAddress?.street || user.address || 'Non spécifiée'}
          ${shippingAddress?.city || ''}
          ${shippingAddress?.postalCode || ''}
          ${shippingAddress?.country || ''}
          
          Informations produit:
          ID Produit: ${productId}
          Nom du produit: ${productDetails?.name || 'Non spécifié'}
          Prix: ${productDetails?.price || 'Non spécifié'} €
          Quantité: ${productDetails?.quantity || 1}
          
          Montant total: ${(productDetails?.price * (productDetails?.quantity || 1)).toFixed(2)} €
          
          Veuillez préparer l'envoi du produit pour livraison avec paiement à réception.
        `,
        isRead: false,
        type: 'payment_on_delivery'
      });
      
      return res.status(200).json({ message: 'Votre demande de paiement à la livraison a été envoyée avec succès' });
    }
    
    res.status(200).json({ message: 'Votre demande a été traitée' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});
module.exports = router;
