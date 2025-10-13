// src/controllers/invitationController.js
const ParentChild = require('../models/ParentChild');
const User = require('../models/User');

/**
 * Obtenir les invitations en attente pour un étudiant
 */
exports.getInvitations = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Vérifier que l'utilisateur est un étudiant
    const user = await User.findById(userId);
    if (!user || user.userType !== 'student') {
      return res.status(403).json({ 
        message: 'Accès refusé. Cette fonctionnalité est réservée aux étudiants.' 
      });
    }

    // Récupérer les invitations en attente
    const invitations = await ParentChild.find({
      child: userId,
      status: 'pending'
    }).populate('parent', 'firstName lastName email');

    res.json(invitations);
  } catch (error) {
    console.error('Erreur récupération invitations:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la récupération des invitations' 
    });
  }
};

/**
 * Accepter une invitation parent
 */
exports.acceptInvitation = async (req, res) => {
  try {
    const userId = req.user.id;
    const { invitationId } = req.body;

    if (!invitationId) {
      return res.status(400).json({ 
        message: 'ID d\'invitation requis' 
      });
    }

    // Vérifier que l'utilisateur est un étudiant
    const user = await User.findById(userId);
    if (!user || user.userType !== 'student') {
      return res.status(403).json({ 
        message: 'Accès refusé. Cette fonctionnalité est réservée aux étudiants.' 
      });
    }

    // Trouver l'invitation
    const invitation = await ParentChild.findOne({
      _id: invitationId,
      child: userId,
      status: 'pending'
    });

    if (!invitation) {
      return res.status(404).json({ 
        message: 'Invitation non trouvée ou déjà traitée' 
      });
    }

    // Accepter l'invitation
    invitation.status = 'active';
    invitation.acceptedAt = new Date();
    
    // Appliquer les contrôles parentaux à l'utilisateur
    user.appliedParentalControls = invitation.parentalControls;
    user.parentAccount = invitation.parent;
    
    await Promise.all([invitation.save(), user.save()]);

    res.json({ 
      message: 'Invitation acceptée avec succès',
      invitation: invitation
    });
  } catch (error) {
    console.error('Erreur acceptation invitation:', error);
    res.status(500).json({ 
      message: 'Erreur lors de l\'acceptation de l\'invitation' 
    });
  }
};

/**
 * Refuser une invitation parent
 */
exports.rejectInvitation = async (req, res) => {
  try {
    const userId = req.user.id;
    const { invitationId } = req.body;

    if (!invitationId) {
      return res.status(400).json({ 
        message: 'ID d\'invitation requis' 
      });
    }

    // Vérifier que l'utilisateur est un étudiant
    const user = await User.findById(userId);
    if (!user || user.userType !== 'student') {
      return res.status(403).json({ 
        message: 'Accès refusé. Cette fonctionnalité est réservée aux étudiants.' 
      });
    }

    // Trouver l'invitation
    const invitation = await ParentChild.findOne({
      _id: invitationId,
      child: userId,
      status: 'pending'
    });

    if (!invitation) {
      return res.status(404).json({ 
        message: 'Invitation non trouvée ou déjà traitée' 
      });
    }

    // Refuser l'invitation
    invitation.status = 'revoked';
    await invitation.save();

    res.json({ 
      message: 'Invitation refusée',
      invitation: invitation
    });
  } catch (error) {
    console.error('Erreur refus invitation:', error);
    res.status(500).json({ 
      message: 'Erreur lors du refus de l\'invitation' 
    });
  }
};

/**
 * Obtenir les notifications pour un utilisateur
 */
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ 
        message: 'Utilisateur non trouvé' 
      });
    }

    // Pour les étudiants, vérifier les invitations parent
    if (user.userType === 'student') {
      const pendingInvitations = await ParentChild.find({
        child: userId,
        status: 'pending'
      }).populate('parent', 'firstName lastName');

      const notifications = pendingInvitations.map(invitation => ({
        id: `invitation_${invitation._id}`,
        type: 'parent_invitation',
        title: 'Invitation parent reçue',
        message: `${invitation.parent.firstName} ${invitation.parent.lastName} souhaite suivre votre progression`,
        timestamp: invitation.invitedAt,
        read: false,
        priority: 'high',
        data: {
          invitationId: invitation._id,
          parentName: `${invitation.parent.firstName} ${invitation.parent.lastName}`
        }
      }));

      return res.json(notifications);
    }

    // Pour les parents, notifications sur l'activité des enfants
    if (user.userType === 'parent') {
      const children = await ParentChild.find({
        parent: userId,
        status: 'active'
      }).populate('child', 'firstName lastName');

      // Créer des notifications de démonstration
      const notifications = children.map((relation, index) => ({
        id: `child_activity_${relation._id}`,
        type: 'child_activity',
        title: 'Activité de votre enfant',
        message: `${relation.child.firstName} a terminé un exercice`,
        timestamp: new Date(Date.now() - (index + 1) * 60 * 60 * 1000),
        read: index > 0,
        priority: 'medium',
        data: {
          childId: relation.child._id,
          childName: `${relation.child.firstName} ${relation.child.lastName}`
        }
      }));

      return res.json(notifications);
    }

    // Par défaut, notifications génériques
    res.json([]);
  } catch (error) {
    console.error('Erreur récupération notifications:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la récupération des notifications' 
    });
  }
};

/**
 * Marquer une notification comme lue
 */
exports.markNotificationAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { notificationId } = req.params;

    // Pour l'instant, on simule juste le marquage comme lu
    // En production, vous pourriez avoir une collection Notifications séparée
    res.json({ 
      message: 'Notification marquée comme lue',
      notificationId: notificationId
    });
  } catch (error) {
    console.error('Erreur marquage notification:', error);
    res.status(500).json({ 
      message: 'Erreur lors du marquage de la notification' 
    });
  }
};
