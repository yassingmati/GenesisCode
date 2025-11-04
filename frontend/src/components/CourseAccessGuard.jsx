// src/components/CourseAccessGuard.jsx - Version améliorée
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../hooks/useTranslation';
import SubscriptionModal from './SubscriptionModal';
import API_CONFIG from '../config/api';
import './CourseAccessGuard.css';

const CourseAccessGuard = ({ 
  children, 
  pathId, 
  pathName, 
  levelId = null, 
  exerciseId = null,
  showPreview = false 
}) => {
  const { currentUser, loading: authLoading } = useAuth();
  const { t } = useTranslation();
  const [access, setAccess] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  useEffect(() => {
    if (pathId) {
      checkAccess();
    }
  }, [pathId, levelId, exerciseId, currentUser]);

  const checkAccess = async () => {
    if (authLoading) return;

    try {
      setLoading(true);
      setError(null);

      console.log('[CourseAccessGuard] Checking access for:', { pathId, levelId, exerciseId });

      if (!currentUser) {
        setAccess({
          hasAccess: false,
          canView: showPreview,
          canInteract: false,
          reason: 'login_required'
        });
        setLoading(false);
        return;
      }

      // Vérification d'accès via la nouvelle route générique
      try {
        const url = API_CONFIG.getFullUrl(
          API_CONFIG.ENDPOINTS.ACCESS_CHECK({ pathId, levelId, exerciseId })
        );

        const response = await fetch(url, {
          headers: API_CONFIG.getDefaultHeaders()
        });

        if (response.ok) {
          const data = await response.json();
          console.log('[CourseAccessGuard] Access check response:', data);
          setAccess({
            hasAccess: data.access?.hasAccess || false,
            canView: data.access?.canView || false,
            canInteract: data.access?.canInteract || false,
            source: data.access?.source,
            reason: data.access?.reason || 'no_access',
            availablePlans: data.availablePlans || [],
            meta: data.access || null
          });
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.warn('[CourseAccessGuard] Access denied:', errorData);
          setAccess({
            hasAccess: false,
            canView: false,
            canInteract: false,
            reason: errorData.reason || errorData.code || errorData?.data?.reason || 'no_access',
            availablePlans: errorData.availablePlans || [],
            meta: errorData.data || null
          });
        }
      } catch (apiError) {
        console.error('[CourseAccessGuard] API access check failed:', apiError);
        setAccess({
          hasAccess: false,
          canView: false,
          canInteract: false,
          reason: 'error'
        });
      }

    } catch (err) {
      console.error('[CourseAccessGuard] Error checking access:', err);
      setError(t('accessCheckError') || 'Erreur de vérification d\'accès');
      setAccess({ 
        hasAccess: false, 
        canView: false,
        canInteract: false,
        reason: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = () => {
    setShowSubscriptionModal(true);
  };

  const handleCloseModal = () => {
    setShowSubscriptionModal(false);
    checkAccess();
  };

  // Loading state
  if (loading) {
    return (
      <div className="access-guard-loading">
        <div className="loading-spinner"></div>
        <p>{t('checkingAccess') || 'Vérification de l\'accès...'}</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="access-guard-error">
        <div className="error-icon">⚠️</div>
        <p>{error}</p>
        <button onClick={checkAccess} className="retry-btn">
          {t('retry') || 'Réessayer'}
        </button>
      </div>
    );
  }

  // Accès autorisé
  if (access && access.hasAccess) {
    return (
      <>
        {children}
        {access.source === 'preview' && (
          <div className="preview-notice">
            <div className="preview-content">
              <div className="preview-icon">👁️</div>
              <div className="preview-text">
                <strong>{t('previewMode') || 'Mode Aperçu'}</strong>
                <p>{t('previewModeDesc') || 'Vous pouvez voir le contenu mais pas interagir avec les exercices'}</p>
              </div>
              <button onClick={handleSubscribe} className="preview-upgrade-btn">
                {t('unlockFullAccess') || 'Débloquer l\'accès complet'}
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Mode consultation (peut voir mais pas interagir)
  if (access && access.canView && !access.canInteract) {
    return (
      <>
        <div className="access-guard-preview-mode">
          <div className="preview-banner">
            <div className="preview-icon">👁️</div>
            <div className="preview-text">
              <strong>{t('viewMode') || 'Mode Consultation'}</strong>
              <p>{t('viewModeDesc') || 'Vous pouvez voir ce contenu mais les interactions sont limitées'}</p>
            </div>
            <button onClick={handleSubscribe} className="preview-upgrade-btn">
              {t('unlockFullAccess') || 'Débloquer l\'accès complet'}
            </button>
          </div>
        </div>
        {children}
        <SubscriptionModal
          isOpen={showSubscriptionModal}
          onClose={handleCloseModal}
          pathId={pathId}
          pathName={pathName}
          onSubscribe={handleSubscribe}
        />
      </>
    );
  }

  // Afficher le contenu de toute façon si showPreview est activé
  if (showPreview) {
    return (
      <>
        <div className="access-guard-preview-mode">
          <div className="preview-banner preview-banner-info">
            <div className="preview-icon">ℹ️</div>
            <div className="preview-text">
              <strong>{t('contentPreview') || 'Aperçu du contenu'}</strong>
              <p>{t('loginOrSubscribe') || 'Connectez-vous ou abonnez-vous pour un accès complet'}</p>
            </div>
            <button onClick={handleSubscribe} className="preview-upgrade-btn">
              {t('getAccess') || 'Obtenir l\'accès'}
            </button>
          </div>
        </div>
        {children}
      </>
    );
  }

  // Accès refusé - Afficher le message de verrouillage
  return (
    <>
      <div className="access-guard-blocked">
        <motion.div
          className="blocked-content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="blocked-icon">
            {access?.reason === 'no_access' ? '🔒' : 
             access?.reason === 'no_category_access' ? '📚' :
             access?.reason === 'previous_level_not_completed' ? '🎯' :
             access?.reason === 'level_not_unlocked' ? '🔐' :
             access?.reason === 'plan_not_covering_path' ? '📦' : 
             access?.reason === 'not_first_lesson' ? '🚪' : 
             access?.reason === 'login_required' ? '🔑' : '🚫'}
          </div>
          
          <h3>{t('contentLocked') || 'Contenu Verrouillé'}</h3>
          
          <div className="blocked-message">
            {access?.reason === 'no_access' && (
              <p>{t('needSubscription') || 'Ce contenu nécessite un abonnement pour y accéder.'}</p>
            )}
            {access?.reason === 'no_category_access' && (
              <p>{t('noCategoryAccess') || 'Vous n\'avez pas accès à cette catégorie. Veuillez souscrire à un plan.'}</p>
            )}
            {access?.reason === 'previous_level_not_completed' && (
              <>
                <p>{t('previousLevelRequired') || 'Vous devez terminer le niveau précédent pour débloquer celui-ci.'}</p>
                <p className="hint-text">💡 {t('completeInOrder') || 'Complétez les niveaux dans l\'ordre pour progresser.'}</p>
              </>
            )}
            {access?.reason === 'level_not_unlocked' && (
              <>
                <p>{t('levelNotUnlocked') || 'Ce niveau n\'est pas encore débloqué.'}</p>
                <p className="hint-text">💡 {t('unlockByProgress') || 'Progressez dans les niveaux précédents pour le débloquer.'}</p>
              </>
            )}
            {access?.reason === 'plan_not_covering_path' && (
              <p>{t('planNotCovering') || 'Votre abonnement actuel ne couvre pas ce parcours.'}</p>
            )}
            {access?.reason === 'not_first_lesson' && (
              <p>{t('onlyFirstFree') || 'Seule la première leçon est accessible gratuitement.'}</p>
            )}
            {access?.reason === 'login_required' && (
              <p>{t('loginRequired') || 'Vous devez vous connecter pour accéder à ce contenu.'}</p>
            )}
            {access?.reason === 'error' && (
              <p>{t('accessCheckError') || 'Erreur lors de la vérification de l\'accès. Veuillez réessayer.'}</p>
            )}
            {!access?.reason && (
              <p>{t('accessDenied') || 'Accès refusé à ce contenu.'}</p>
            )}
          </div>

          {/* CTA enrichi si backend a fourni des détails */}
          {access?.meta?.source === 'subscription' && (
            <div className="cta-details">
              <p>{t('upgradePlanToAccess') || 'Mettez à niveau votre plan pour accéder à ce contenu.'}</p>
            </div>
          )}
          {access?.meta && access.meta.planType === 'category' && access?.meta?.categoryPlan && (
            <div className="cta-details">
              <p>
                {t('categoryPlanAvailable') || 'Plan catégorie disponible'}: {access.meta.categoryPlan?.name} – {access.meta.categoryPlan?.priceMonthly ? `${(access.meta.categoryPlan.priceMonthly).toFixed(2)} TND/mois` : t('free') || 'Gratuit'}
              </p>
            </div>
          )}

          <div className="blocked-actions">
            {access?.reason !== 'previous_level_not_completed' && 
             access?.reason !== 'level_not_unlocked' && 
             access?.reason !== 'login_required' && (
              <motion.button
                onClick={handleSubscribe}
                className="unlock-btn primary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="btn-icon">🔓</span>
                {t('unlockAccess') || 'Débloquer l\'accès'}
              </motion.button>
            )}
            
            {access?.reason === 'login_required' && (
              <motion.button
                onClick={() => window.location.href = '/auth'}
                className="unlock-btn primary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="btn-icon">🔑</span>
                {t('login') || 'Se connecter'}
              </motion.button>
            )}

            {access?.reason === 'previous_level_not_completed' || access?.reason === 'level_not_unlocked' ? (
              <motion.button
                onClick={() => window.history.back()}
                className="unlock-btn secondary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="btn-icon">⬅️</span>
                {t('goBack') || 'Retour au niveau précédent'}
              </motion.button>
            ) : null}
          </div>

          <div className="blocked-footer">
            <p>💡 <strong>{t('tip') || 'Astuce'} :</strong> {t('startWithFirstLesson') || 'Commencez par la première leçon gratuite de chaque parcours !'}</p>
          </div>
        </motion.div>
      </div>

      <SubscriptionModal
        isOpen={showSubscriptionModal}
        onClose={handleCloseModal}
        pathId={pathId}
        pathName={pathName}
        onSubscribe={handleSubscribe}
      />
    </>
  );
};

export default CourseAccessGuard;

