// src/services/accessControlService.js
const User = require('../models/User');
const accessCache = require('../utils/accessCache');
const CourseAccess = require('../models/CourseAccess');
const CategoryAccess = require('../models/CategoryAccess');
const Category = require('../models/Category');
const Path = require('../models/Path');
const Level = require('../models/Level');
const Subscription = require('../models/Subscription');

/**
 * Unified access control service for path/level/exercise
 * Standard reasons returned:
 * - 'user_not_found'
 * - 'no_access' (default deny)
 * - 'plan_not_covering_path'
 * - 'not_first_lesson'
 * - 'no_category_access'
 * - 'level_not_unlocked'
 * - 'error'
 */
class AccessControlService {
  static async checkPathAccess(userId, pathId) {
    return this.checkUserAccess(userId, pathId, null, null);
  }

  static async checkLevelAccess(userId, pathId, levelId) {
    return this.checkUserAccess(userId, pathId, levelId, null);
  }

  static async checkExerciseAccess(userId, pathId, levelId, exerciseId) {
    return this.checkUserAccess(userId, pathId, levelId, exerciseId);
  }

  static async checkUserAccess(userId, pathId, levelId = null, exerciseId = null) {
    try {
      const cacheKey = `${userId}:${pathId}:${levelId || ''}:${exerciseId || ''}`;
      const cached = accessCache.get(cacheKey);
      if (cached) return cached;

      const user = await User.findById(userId).select('subscription roles role').lean();
      if (!user) return { hasAccess: false, reason: 'user_not_found' };

      // 0) Admin Bypass
      // Check for admin role in 'roles' array or legacy 'role' field
      const isAdmin = (user.roles && user.roles.includes('admin')) || user.role === 'admin';

      if (isAdmin) {
        return {
          hasAccess: true,
          accessType: 'admin',
          canView: true,
          canInteract: true,
          canDownload: true,
          source: 'admin_bypass'
        };
      }

      // 1) Explicit access (CourseAccess)
      const explicit = await CourseAccess.checkAccess(userId, pathId, levelId, exerciseId);
      if (explicit) {
        return {
          hasAccess: true,
          accessType: explicit.accessType,
          canView: explicit.canView,
          canInteract: explicit.canInteract,
          canDownload: explicit.canDownload,
          source: 'explicit'
        };
      }

      // 2) Subscription-based access (if present)
      const subscriptionAccess = await this.checkSubscriptionCoverage(user, pathId, levelId);
      if (subscriptionAccess.hasAccess) {
        return subscriptionAccess;
      }

      // 3) Category-based sequential unlock when level is specified
      if (levelId) {
        const seq = await this.checkSequentialLevelAccess(userId, pathId, levelId);
        if (seq.hasAccess) return seq;
        // Only return error if it's a definitive reason, not just no category access
        if (seq.reason && seq.reason !== 'no_category_access' && seq.reason !== 'level_not_unlocked') {
          return { hasAccess: false, reason: seq.reason };
        }
      }

      // 4) Free first lesson for a path if level provided or not
      const free = await this.checkFreeFirstLevel(userId, pathId, levelId);
      if (free.hasAccess) {
        accessCache.set(cacheKey, free);
        return free;
      }

      const deny = { hasAccess: false, reason: 'no_access' };
      accessCache.set(cacheKey, deny);
      return deny;
    } catch (error) {
      console.error('AccessControlService.checkUserAccess error:', error);
      return { hasAccess: false, reason: 'error' };
    }
  }

  static async checkSubscriptionCoverage(user, pathId, levelId = null) {
    try {
      // FIX: Check the separate Subscription model instead of the deprecated embedded field
      const activeSub = await Subscription.findActiveByUser(user._id);

      if (!activeSub) {
        console.log(`[DEBUG] No active subscription found for user ${user._id}`);
        return { hasAccess: false };
      }

      // Ensure plan is populated
      if (!activeSub.plan) {
        // Should have been populated by findActiveByUser, but double check
        await activeSub.populate('plan');
      }
      const plan = activeSub.plan;

      console.log(`[DEBUG] Active subscription found: ${plan ? plan.name : 'Unknown Plan'} (${activeSub.status})`);

      if (!plan) {
        console.warn(`[WARN] Active subscription ${activeSub._id} refers to missing plan ${activeSub.plan}`);
        return { hasAccess: false, reason: 'invalid_subscription_plan' };
      }

      // If no pathId check requested (general check), grant access
      if (!pathId) {
        return {
          hasAccess: true,
          accessType: 'subscription',
          canView: true,
          canInteract: true,
          canDownload: false,
          source: 'subscription',
          plan: plan
        };
      }

      // ----------------------------------------------------
      // Verify Plan Scope (Global vs Category vs Path)
      // ----------------------------------------------------

      // 1. Global Access
      if (!plan.type || plan.type === 'global') {
        return {
          hasAccess: true,
          accessType: 'subscription',
          canView: true,
          canInteract: true,
          canDownload: false,
          source: 'subscription_global',
          plan: plan
        };
      }

      // Load the requested path to find its category
      const pathDoc = await Path.findById(pathId).select('category').lean();
      if (!pathDoc) {
        console.log(`[DEBUG] Path not found: ${pathId}`);
        return { hasAccess: false };
      }

      // 2. Category Access
      if (plan.type === 'Category') {
        // If plan has targetId, it must match path's category
        if (plan.targetId && pathDoc.category) {
          if (plan.targetId.toString() === pathDoc.category.toString()) {
            return {
              hasAccess: true,
              accessType: 'subscription',
              canView: true,
              canInteract: true,
              canDownload: false,
              source: 'subscription_category',
              plan: plan
            };
          } else {
            console.log(`[DEBUG] Plan category mismatch: Plan=${plan.targetId} vs Path=${pathDoc.category}`);
            // Fallthrough to return false
          }
        }
      }

      // 3. Path Access (Specific Paths)
      if (plan.type === 'Path') {
        // Check targetId
        if (plan.targetId && plan.targetId.toString() === pathId.toString()) {
          return {
            hasAccess: true,
            accessType: 'subscription',
            canView: true,
            canInteract: true,
            canDownload: false,
            source: 'subscription_path',
            plan: plan
          };
        }
        // Check allowedPaths list
        if (plan.allowedPaths && plan.allowedPaths.length > 0) {
          const allowed = plan.allowedPaths.some(p => p.toString() === pathId.toString());
          if (allowed) {
            return {
              hasAccess: true,
              accessType: 'subscription',
              canView: true,
              canInteract: true,
              canDownload: false,
              source: 'subscription_path_list',
              plan: plan
            };
          }
        }
      }

      console.log(`[DEBUG] Access denied by plan scope. Plan type: ${plan.type}`);
      return { hasAccess: false, reason: 'plan_scope_mismatch' };

    } catch (e) {
      console.error('AccessControlService.checkSubscriptionCoverage error:', e);
      return { hasAccess: false };
    }
  }

  static async checkSequentialLevelAccess(userId, pathId, levelId) {
    try {
      console.log(`[DEBUG] checkSequentialLevelAccess: userId=${userId}, pathId=${pathId}, levelId=${levelId}`);

      const path = await Path.findById(pathId).lean();
      if (!path) {
        console.log(`[DEBUG] Path not found`);
        return { hasAccess: false, reason: 'no_access' };
      }

      console.log(`[DEBUG] Path found, category=${path.category}`);

      // Category access must be active to use sequential unlock
      const categoryAccess = await CategoryAccess.findActiveByUserAndCategory(userId, path.category);
      console.log(`[DEBUG] CategoryAccess found:`, !!categoryAccess);

      if (!categoryAccess || !categoryAccess.isActive()) {
        console.log(`[DEBUG] No category access or inactive`);
        return { hasAccess: false, reason: 'no_category_access' };
      }

      console.log(`[DEBUG] CategoryAccess is active, accessType=${categoryAccess.accessType}`);

      // If user has admin access type, grant full access to all levels
      if (categoryAccess.accessType === 'admin') {
        console.log(`[DEBUG] Admin CategoryAccess - granting full access`);
        return {
          hasAccess: true,
          accessType: 'admin',
          canView: true,
          canInteract: true,
          canDownload: true,
          source: 'category_admin'
        };
      }

      // If already unlocked in CategoryAccess
      if (categoryAccess.hasUnlockedLevel(pathId, levelId)) {
        return { hasAccess: true, accessType: 'unlocked', canView: true, canInteract: true, canDownload: false, source: 'category_unlock' };
      }

      // Check if it's the first level (always accessible with category access)
      const isFirst = await this.isFirstLevelOfPath(pathId, levelId);
      if (isFirst) {
        return { hasAccess: true, accessType: 'free_first_level', canView: true, canInteract: true, canDownload: false, source: 'free_first_lesson' };
      }

      // For non-first levels, check if previous level is completed
      const UserLevelProgress = require('../models/UserLevelProgress');
      const currentLevel = await Level.findById(levelId).lean();
      if (!currentLevel) return { hasAccess: false, reason: 'level_not_found' };

      // Find the previous level (order - 1)
      const previousLevel = await Level.findOne({
        path: pathId,
        order: currentLevel.order - 1
      }).lean();

      if (!previousLevel) {
        // No previous level, should be the first level (already handled above)
        return { hasAccess: false, reason: 'level_not_unlocked' };
      }

      // Check if the previous level is completed
      const previousProgress = await UserLevelProgress.findOne({
        user: userId,
        level: previousLevel._id,
        completed: true
      }).lean();

      if (previousProgress) {
        // Previous level is completed, grant access
        return {
          hasAccess: true,
          accessType: 'sequential_unlock',
          canView: true,
          canInteract: true,
          canDownload: false,
          source: 'sequential_unlock',
          previousLevelCompleted: true
        };
      }

      return { hasAccess: false, reason: 'previous_level_not_completed' };
    } catch (e) {
      console.error('AccessControlService.checkSequentialLevelAccess error:', e);
      return { hasAccess: false, reason: 'error' };
    }
  }

  static async checkFreeFirstLevel(userId, pathId, levelId = null) {
    try {
      // Récupérer le premier niveau sans populate lourd
      const firstLevel = await Level.findOne({ path: pathId }).sort({ order: 1 }).lean();
      if (!firstLevel) return { hasAccess: false };

      // If a specific level is requested, only grant if it's the first
      if (levelId) {
        if (firstLevel?._id?.toString() === levelId?.toString()) {
          return { hasAccess: true, accessType: 'free', canView: true, canInteract: true, canDownload: false, source: 'free' };
        }
        return { hasAccess: false, reason: 'not_first_lesson' };
      }

      // If only pathId (e.g., path overview), allow view by default
      return { hasAccess: true, accessType: 'free', canView: true, canInteract: false, canDownload: false, source: 'free' };
    } catch (e) {
      return { hasAccess: false };
    }
  }

  static async isFirstLevelOfPath(pathId, levelId) {
    const levels = await Level.find({ path: pathId }).sort({ order: 1 });
    if (!levels.length) return false;
    const first = levels[0];
    return first._id.toString() === levelId.toString();
  }
}

module.exports = AccessControlService;


