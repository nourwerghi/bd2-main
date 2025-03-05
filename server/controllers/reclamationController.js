const Reclamation = require('../models/Reclamation');

// Create a new reclamation
exports.createReclamation = async (req, res) => {
  try {
    const { subject, description, priority } = req.body;
    
    const reclamation = new Reclamation({
      user: req.user._id,
      subject,
      description,
      priority,
      status: 'pending'
    });

    await reclamation.save();

    res.status(201).json({
      success: true,
      message: 'Réclamation soumise avec succès',
      data: reclamation
    });
  } catch (error) {
    console.error('Create reclamation error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la réclamation',
      error: error.message
    });
  }
};

// Get all reclamations for a user
exports.getUserReclamations = async (req, res) => {
  try {
    const reclamations = await Reclamation.find({ user: req.user._id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: reclamations
    });
  } catch (error) {
    console.error('Get user reclamations error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des réclamations',
      error: error.message
    });
  }
};

// Get all reclamations (admin only)
exports.getAllReclamations = async (req, res) => {
  try {
    const reclamations = await Reclamation.find()
      .populate('user', 'username email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: reclamations
    });
  } catch (error) {
    console.error('Get all reclamations error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des réclamations',
      error: error.message
    });
  }
};

// Update reclamation status (admin only)
exports.updateReclamationStatus = async (req, res) => {
  try {
    const { status, adminResponse } = req.body;
    const reclamation = await Reclamation.findById(req.params.id);

    if (!reclamation) {
      return res.status(404).json({
        success: false,
        message: 'Réclamation non trouvée'
      });
    }

    reclamation.status = status;
    if (adminResponse) {
      reclamation.adminResponse = adminResponse;
    }
    if (status === 'resolved') {
      reclamation.resolvedAt = new Date();
    }

    await reclamation.save();

    res.json({
      success: true,
      message: 'Statut de la réclamation mis à jour avec succès',
      data: reclamation
    });
  } catch (error) {
    console.error('Update reclamation status error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du statut de la réclamation',
      error: error.message
    });
  }
};