// src/services/exerciseService.js
/**
 * Service centralisé pour la validation et l'évaluation des exercices
 * Gère tous les types d'exercices avec validation et calcul de points unifié
 */

class ExerciseService {
  /**
   * Valide et évalue une réponse d'exercice
   * @param {Object} exercise - L'exercice à évaluer
   * @param {*} answer - La réponse de l'utilisateur
   * @param {Object} options - Options supplémentaires (passed, passedCount, totalCount, tests)
   * @returns {Object} { isCorrect, pointsEarned, xp, details }
   */
  static evaluateAnswer(exercise, answer, options = {}) {
    const type = exercise.type;
    const pointsMax = exercise.points || 10;
    const allowPartial = exercise.allowPartial !== false; // default true

    let isCorrect = false;
    let pointsEarned = 0;
    let xp = 0;
    let details = {};

    try {
      switch (type) {
        case 'QCM':
          return this.evaluateQCM(exercise, answer, pointsMax, allowPartial);

        case 'Matching':
        case 'DragDrop':
        case 'OrderBlocks':
          return this.evaluateInteractive(exercise, answer, type, pointsMax, allowPartial);

        case 'TextInput':
        case 'FillInTheBlank':
          return this.evaluateTextInput(exercise, answer, pointsMax);

        case 'SpotTheError':
          return this.evaluateSpotTheError(exercise, answer, pointsMax);

        case 'Code':
          return this.evaluateCode(exercise, answer, options, pointsMax);

        case 'Algorithm':
        case 'AlgorithmSteps':
          return this.evaluateAlgorithm(exercise, answer, pointsMax, allowPartial);

        case 'FlowChart':
          return this.evaluateFlowChart(exercise, answer, pointsMax);

        case 'Trace':
          return this.evaluateTrace(exercise, answer, pointsMax, allowPartial);

        case 'Debug':
          return this.evaluateDebug(exercise, answer, pointsMax, allowPartial);

        case 'CodeCompletion':
          return this.evaluateCodeCompletion(exercise, answer, pointsMax, allowPartial);

        case 'PseudoCode':
          return this.evaluatePseudoCode(exercise, answer, pointsMax);

        case 'Complexity':
          return this.evaluateComplexity(exercise, answer, pointsMax);

        case 'DataStructure':
          return this.evaluateDataStructure(exercise, answer, pointsMax, allowPartial);

        case 'ScratchBlocks':
          return this.evaluateScratchBlocks(exercise, answer, pointsMax, allowPartial);

        case 'Scratch':
          return this.evaluateScratch(exercise, answer, pointsMax);

        case 'VisualProgramming':
          return this.evaluateVisualProgramming(exercise, answer, pointsMax);

        case 'ConceptMapping':
          return this.evaluateConceptMapping(exercise, answer, pointsMax, allowPartial);

        case 'CodeOutput':
          return this.evaluateCodeOutput(exercise, answer, pointsMax);

        case 'Optimization':
          return this.evaluateOptimization(exercise, answer, pointsMax);

        default:
          throw new Error(`Type d'exercice non supporté: ${type}`);
      }
    } catch (error) {
      console.error(`ExerciseService.evaluateAnswer error for type ${type}:`, error);
      throw error;
    }
  }

  /**
   * Évalue une réponse QCM
   */
  static evaluateQCM(exercise, answer, pointsMax, allowPartial) {
    const user = Array.isArray(answer) ? answer : [answer];
    const correctAnswers = exercise.solutions || [];

    // Normaliser les réponses (supporter indices et IDs)
    const normalize = (arr) => {
      if (exercise.options && exercise.options.length && typeof exercise.options[0] === 'object') {
        return arr.map(a => {
          if (typeof a === 'number') return exercise.options[a]?.id;
          return a;
        }).filter(Boolean);
      }
      return arr;
    };

    const userNorm = normalize(user);
    const correctNorm = normalize(correctAnswers);

    let pointsEarned = 0;

    if (allowPartial) {
      const perOption = pointsMax / Math.max(correctNorm.length, 1);
      const matched = userNorm.filter(u => correctNorm.includes(u)).length;
      pointsEarned = perOption * matched;
    } else {
      const sortedU = [...userNorm].sort();
      const sortedC = [...correctNorm].sort();
      pointsEarned = (JSON.stringify(sortedU) === JSON.stringify(sortedC)) ? pointsMax : 0;
    }

    const isCorrect = pointsEarned >= pointsMax;
    const xp = Math.round(pointsEarned);

    return {
      isCorrect,
      pointsEarned: Math.round(pointsEarned * 100) / 100,
      xp,
      details: { type: 'QCM', user: userNorm, correct: correctNorm, pointsEarned, pointsMax },
      feedback: isCorrect ? 'Bravo !' : (pointsEarned > 0 ? 'Partiellement correct.' : 'Incorrect, réessayez.')
    };
  }

  /**
   * Évalue les exercices interactifs (Matching, DragDrop, OrderBlocks)
   */
  static evaluateInteractive(exercise, answer, type, pointsMax, allowPartial) {
    let earned = 0;

    if (type === 'Matching') {
      const pairs = exercise.solutions || [];
      const totalPairs = pairs.length || 1;
      const perPair = pointsMax / totalPairs;

      for (const pair of pairs) {
        const found = (Array.isArray(answer) ? answer : []).some(a =>
          a.promptId === pair.promptId && a.matchId === pair.matchId
        );
        if (found) earned += perPair;
      }
    } else if (type === 'OrderBlocks') {
      const solution = exercise.solutions?.[0] || [];
      const userOrder = Array.isArray(answer) ? answer : [];
      const minLen = Math.min(solution.length, userOrder.length);
      const per = pointsMax / solution.length;

      for (let i = 0; i < minLen; i++) {
        if (solution[i] === userOrder[i]) earned += per;
      }
    } else if (type === 'DragDrop') {
      const solution = exercise.solutions?.[0] || {};

      // Determine user map from answer (support both map directly and { zones } format)
      let userMap = {};
      if (answer && answer.userMap && typeof answer.userMap === 'object') {
        userMap = answer.userMap;
        console.log('[DragDrop] Using explicit userMap from frontend');
      } else if (answer && answer.zones && Array.isArray(answer.zones)) {
        // Fallback for older frontend version
        // Convert zones [{ id: targetId, itemId: elementId }] to map { elementId: targetId }
        // Note: We need to handle cases where elementId/targetId might be IDs or content strings
        // If elements/targets are strings in exercise, the IDs match the content.

        // Helper to find text content if possible, else use ID
        const getElText = (id) => {
          if (!exercise.elements) return id;
          const found = exercise.elements.find(e => (typeof e === 'string' ? e : e.id) === id);
          return typeof found === 'string' ? found : (found?.text || found?.content || id);
        };
        const getTargText = (id) => {
          if (!exercise.targets) return id;
          const found = exercise.targets.find(t => (typeof t === 'string' ? t : t.id) === id);
          return typeof found === 'string' ? found : (found?.title || found?.id || id);
        };

        answer.zones.forEach(z => {
          if (z.itemId && z.id) {
            const key = getElText(z.itemId);
            const val = getTargText(z.id);
            userMap[key] = val;
          }
        });
      } else {
        userMap = answer || {};
      }

      console.log('[DragDrop Debug] Solution:', JSON.stringify(solution));
      console.log('[DragDrop Debug] Answer Raw:', JSON.stringify(answer));
      console.log('[DragDrop Debug] UserMap Construit:', JSON.stringify(userMap));

      const keys = Object.keys(solution || {});
      const per = pointsMax / Math.max(keys.length, 1);

      for (const k of keys) {
        // Loose comparison for string numbers validity
        // FIXED: Use lowerCase and Trim for robustness
        const userVal = String(userMap[k] || '').trim().toLowerCase();
        const solVal = String(solution[k] || '').trim().toLowerCase();
        const match = userVal === solVal;

        if (!match) {
          console.log(`[DragDrop Mismatch] Key="${k}": User="${userVal}" vs Solution="${solVal}"`);
        }

        if (match) {
          earned += per;
        }
      }

    }


    const pointsEarned = Math.round(earned * 100) / 100;
    const isCorrect = pointsEarned >= pointsMax;

    return {
      isCorrect,
      pointsEarned,
      xp: Math.round(pointsEarned),
      details: { type, pointsEarned, pointsMax }
    };
  }

  /**
   * Évalue les exercices de saisie de texte
   */
  static evaluateTextInput(exercise, answer, pointsMax) {
    const normalized = String(answer || '').trim();
    const solutions = exercise.solutions || [];
    let matched = false;

    for (const sol of solutions) {
      if (typeof sol === 'string') {
        if (normalized.toLowerCase() === sol.trim().toLowerCase()) {
          matched = true;
          break;
        }
      } else if (sol && sol.regex) {
        const re = new RegExp(sol.regex, sol.flags || 'i');
        if (re.test(normalized)) {
          matched = true;
          break;
        }
      } else if (sol && sol.range) {
        const val = Number(normalized);
        if (!Number.isNaN(val) && val >= sol.range.min && val <= sol.range.max) {
          matched = true;
          break;
        }
      }
    }

    const pointsEarned = matched ? pointsMax : 0;

    return {
      isCorrect: matched,
      pointsEarned,
      xp: pointsEarned,
      details: { matched }
    };
  }

  /**
   * Évalue SpotTheError
   */
  static evaluateSpotTheError(exercise, answer, pointsMax) {
    const solutions = exercise.solutions || [];
    const matched = solutions.some(solution =>
      JSON.stringify(solution) === JSON.stringify(answer)
    );

    const pointsEarned = matched ? pointsMax : 0;

    return {
      isCorrect: matched,
      pointsEarned,
      xp: pointsEarned,
      details: { matched }
    };
  }

  /**
   * Évalue les exercices de code
   */
  static evaluateCode(exercise, answer, options, pointsMax) {
    const { passed, passedCount, totalCount, tests } = options;

    let pointsEarned = 0;
    let details = {};

    if (typeof passed === 'boolean') {
      pointsEarned = passed ? pointsMax : 0;
      details = { passed };
    } else if (typeof passedCount === 'number' && typeof totalCount === 'number') {
      const ratio = totalCount === 0 ? 0 : (passedCount / totalCount);
      pointsEarned = Math.round(ratio * pointsMax * 100) / 100;
      details = { passedCount, totalCount, tests: tests || [] };
    } else if (Array.isArray(tests)) {
      let earned = 0;
      for (const t of tests) {
        if (t.passed) earned += (t.points || 1);
      }
      pointsEarned = Math.min(pointsMax, earned);
      details = { tests };
    } else {
      // Calculer depuis testCases si disponible
      const testCases = exercise.testCases || [];
      if (testCases.length > 0) {
        const totalPoints = testCases.reduce((sum, tc) => sum + (tc.points || 1), 0);
        pointsEarned = Math.min(pointsMax, totalPoints);
        details = { testCases: testCases.length };
      } else {
        throw new Error('Pour Code, fournissez passed, passedCount/totalCount, ou tests[]');
      }
    }

    const isCorrect = pointsEarned >= pointsMax;

    // Generate feedback
    const feedback = [];
    if (!isCorrect) {
      if (details.tests) {
        const failed = details.tests.filter(t => !t.passed);
        if (failed.length > 0) {
          feedback.push(`Tests échoués (${failed.length}):`);
          failed.slice(0, 3).forEach(f => feedback.push(`- ${f.message || 'Condition non respectée'}`));
          if (failed.length > 3) feedback.push(`...et ${failed.length - 3} autres.`);
        }
      } else if (typeof details.passedCount === 'number') {
        feedback.push(`Vous avez passé ${details.passedCount} tests sur ${details.totalCount}.`);
      } else {
        feedback.push("Le code ne produit pas le résultat attendu.");
      }
    }

    return {
      isCorrect,
      pointsEarned,
      xp: Math.round(pointsEarned),
      details,
      feedback: feedback.join('\n')
    };
  }

  /**
   * Évalue Algorithm/AlgorithmSteps
   */
  static evaluateAlgorithm(exercise, answer, pointsMax, allowPartial) {
    const userOrder = Array.isArray(answer) ? answer : [];
    const correctOrder = exercise.solutions?.[0] || [];

    if (JSON.stringify(userOrder) === JSON.stringify(correctOrder)) {
      return {
        isCorrect: true,
        pointsEarned: pointsMax,
        xp: pointsMax,
        details: { userOrder, correctOrder, pointsEarned: pointsMax, pointsMax }
      };
    }

    if (allowPartial) {
      let correct = 0;
      const minLen = Math.min(userOrder.length, correctOrder.length);
      for (let i = 0; i < minLen; i++) {
        if (userOrder[i] === correctOrder[i]) correct++;
      }
      const pointsEarned = Math.round((correct / correctOrder.length) * pointsMax);
      return {
        isCorrect: pointsEarned >= pointsMax,
        pointsEarned,
        xp: pointsEarned,
        details: { userOrder, correctOrder, pointsEarned, pointsMax }
      };
    }

    return {
      isCorrect: false,
      pointsEarned: 0,
      xp: 0,
      details: { userOrder, correctOrder, pointsEarned: 0, pointsMax }
    };
  }

  /**
   * Évalue FlowChart
   */
  static evaluateFlowChart(exercise, answer, pointsMax) {
    const userNodes = answer?.nodes || [];
    const userConnections = answer?.connections || [];
    const correctStructure = exercise.solutions?.[0] || {};

    const structureMatch = JSON.stringify(userNodes) === JSON.stringify(correctStructure.nodes) &&
      JSON.stringify(userConnections) === JSON.stringify(correctStructure.connections);

    const pointsEarned = structureMatch ? pointsMax : 0;

    return {
      isCorrect: structureMatch,
      pointsEarned,
      xp: pointsEarned,
      details: { structureMatch, pointsEarned, pointsMax }
    };
  }

  /**
   * Évalue Trace
   */
  static evaluateTrace(exercise, answer, pointsMax, allowPartial) {
    const userTrace = answer?.trace || [];
    const correctTrace = exercise.solutions?.[0] || [];

    if (allowPartial) {
      let correctSteps = 0;
      userTrace.forEach((step, i) => {
        if (correctTrace[i] && JSON.stringify(step) === JSON.stringify(correctTrace[i])) {
          correctSteps++;
        }
      });
      const pointsEarned = Math.round((correctSteps / correctTrace.length) * pointsMax);
      return {
        isCorrect: pointsEarned >= pointsMax,
        pointsEarned,
        xp: pointsEarned,
        details: { userTrace, correctTrace, pointsEarned, pointsMax }
      };
    }

    const matched = JSON.stringify(userTrace) === JSON.stringify(correctTrace);
    const pointsEarned = matched ? pointsMax : 0;

    return {
      isCorrect: matched,
      pointsEarned,
      xp: pointsEarned,
      details: { userTrace, correctTrace, pointsEarned, pointsMax }
    };
  }

  /**
   * Évalue Debug
   */
  static evaluateDebug(exercise, answer, pointsMax, allowPartial) {
    const userErrors = Array.isArray(answer) ? answer : [];
    const correctErrors = exercise.solutions || [];

    if (allowPartial) {
      const foundErrors = userErrors.filter(err =>
        correctErrors.some(correctErr =>
          correctErr.line === err.line && correctErr.type === err.type
        )
      );
      const pointsEarned = Math.round((foundErrors.length / correctErrors.length) * pointsMax);
      return {
        isCorrect: pointsEarned >= pointsMax,
        pointsEarned,
        xp: pointsEarned,
        details: { userErrors, correctErrors, pointsEarned, pointsMax }
      };
    }

    const allFound = correctErrors.every(correctErr =>
      userErrors.some(err => correctErr.line === err.line && correctErr.type === err.type)
    );
    const pointsEarned = allFound ? pointsMax : 0;

    return {
      isCorrect: allFound,
      pointsEarned,
      xp: pointsEarned,
      details: { userErrors, correctErrors, pointsEarned, pointsMax }
    };
  }

  /**
   * Évalue CodeCompletion
   */
  static evaluateCodeCompletion(exercise, answer, pointsMax, allowPartial) {
    const userCode = answer?.completions || {};
    const correctCode = exercise.solutions?.[0] || {};

    if (allowPartial) {
      const gaps = Object.keys(correctCode);
      let correctCompletions = 0;
      gaps.forEach(gap => {
        if (userCode[gap] && userCode[gap].trim() === correctCode[gap].trim()) {
          correctCompletions++;
        }
      });
      const pointsEarned = Math.round((correctCompletions / gaps.length) * pointsMax);
      return {
        isCorrect: pointsEarned >= pointsMax,
        pointsEarned,
        xp: pointsEarned,
        details: { userCode, correctCode, pointsEarned, pointsMax }
      };
    }

    const allCorrect = Object.keys(correctCode).every(gap =>
      userCode[gap] && userCode[gap].trim() === correctCode[gap].trim()
    );
    const pointsEarned = allCorrect ? pointsMax : 0;

    return {
      isCorrect: allCorrect,
      pointsEarned,
      xp: pointsEarned,
      details: { userCode, correctCode, pointsEarned, pointsMax }
    };
  }

  /**
   * Évalue PseudoCode
   */
  static evaluatePseudoCode(exercise, answer, pointsMax) {
    const userPseudo = String(answer || '').trim();
    const correctStructure = exercise.solutions?.[0] || '';
    const matched = userPseudo.toLowerCase() === correctStructure.toLowerCase();

    return {
      isCorrect: matched,
      pointsEarned: matched ? pointsMax : 0,
      xp: matched ? pointsMax : 0,
      details: { userPseudo, matched, pointsEarned: matched ? pointsMax : 0, pointsMax }
    };
  }

  /**
   * Évalue Complexity
   */
  static evaluateComplexity(exercise, answer, pointsMax) {
    const userComplexity = answer?.complexity || '';
    const correctComplexity = exercise.solutions?.[0] || '';
    const matched = userComplexity.toLowerCase() === correctComplexity.toLowerCase();

    return {
      isCorrect: matched,
      pointsEarned: matched ? pointsMax : 0,
      xp: matched ? pointsMax : 0,
      details: { userComplexity, correctComplexity, matched, pointsEarned: matched ? pointsMax : 0, pointsMax }
    };
  }

  /**
   * Évalue DataStructure
   */
  static evaluateDataStructure(exercise, answer, pointsMax, allowPartial) {
    const userOperations = answer?.operations || [];
    const correctOperations = exercise.solutions || [];

    if (allowPartial) {
      let correctOps = 0;
      userOperations.forEach((op, i) => {
        if (correctOperations[i] && JSON.stringify(op) === JSON.stringify(correctOperations[i])) {
          correctOps++;
        }
      });
      const pointsEarned = Math.round((correctOps / correctOperations.length) * pointsMax);
      return {
        isCorrect: pointsEarned >= pointsMax,
        pointsEarned,
        xp: pointsEarned,
        details: { userOperations, correctOperations, pointsEarned, pointsMax }
      };
    }

    const matched = JSON.stringify(userOperations) === JSON.stringify(correctOperations);
    const pointsEarned = matched ? pointsMax : 0;

    return {
      isCorrect: matched,
      pointsEarned,
      xp: pointsEarned,
      details: { userOperations, correctOperations, pointsEarned, pointsMax }
    };
  }

  /**
   * Évalue ScratchBlocks
   */
  static evaluateScratchBlocks(exercise, answer, pointsMax, allowPartial) {
    const userBlocks = Array.isArray(answer) ? answer : (answer?.blocks || []);
    const correctBlocks = Array.isArray(exercise.solutions) ? exercise.solutions : [];

    // Normaliser les blocs en retirant le champ 'id' ajouté par le frontend
    const normalizeBlock = (block) => {
      if (typeof block === 'object' && block !== null) {
        const { id, ...rest } = block;
        return rest;
      }
      return block;
    };

    const normalizedUserBlocks = userBlocks.map(normalizeBlock);
    const normalizedCorrectBlocks = correctBlocks.map(normalizeBlock);

    if (allowPartial) {
      let correctCount = 0;
      const minLength = Math.min(normalizedUserBlocks.length, normalizedCorrectBlocks.length);
      for (let i = 0; i < minLength; i++) {
        // Compare objects by JSON string
        if (JSON.stringify(normalizedUserBlocks[i]) === JSON.stringify(normalizedCorrectBlocks[i])) {
          correctCount++;
        }
      }
      const pointsEarned = normalizedCorrectBlocks.length > 0 ? Math.round((correctCount / normalizedCorrectBlocks.length) * pointsMax) : 0;
      return {
        isCorrect: pointsEarned >= pointsMax,
        pointsEarned,
        xp: pointsEarned,
        details: { userBlocks: normalizedUserBlocks, correctBlocks: normalizedCorrectBlocks, blocksMatch: false, pointsEarned, pointsMax }
      };
    }

    const blocksMatch = JSON.stringify(normalizedUserBlocks) === JSON.stringify(normalizedCorrectBlocks);
    const pointsEarned = blocksMatch ? pointsMax : 0;

    return {
      isCorrect: blocksMatch,
      pointsEarned,
      xp: pointsEarned,
      details: { userBlocks: normalizedUserBlocks, correctBlocks: normalizedCorrectBlocks, blocksMatch, pointsEarned, pointsMax }
    };
  }

  /**
   * Évalue Scratch (Blockly XML)
   */
  /**
   * Évalue Scratch (Blockly XML)
   */
  static evaluateScratch(exercise, answer, pointsMax) {
    const userXml = String(answer || '').trim();
    const correctXml = String(exercise.solutions?.[0] || '').trim();
    const validationRules = exercise.validationRules || [];

    // Helper to check if XML contains specific block type
    const hasBlock = (xml, blockType) => {
      const regex = new RegExp(`type="${blockType}"`, 'i');
      return regex.test(xml);
    };

    // Helper to count blocks
    const countBlocks = (xml) => {
      const match = xml.match(/<block/g);
      return match ? match.length : 0;
    };

    let isCorrect = true;
    let feedback = [];

    // 1. Validation par règles (si disponibles)
    if (validationRules.length > 0) {
      for (const rule of validationRules) {
        if (rule.type === 'mustUseBlock') {
          if (!hasBlock(userXml, rule.value)) {
            isCorrect = false;
            feedback.push(rule.message || `Vous devez utiliser le bloc "${rule.value}".`);
          }
        } else if (rule.type === 'maxBlocks') {
          const max = parseInt(rule.value, 10);
          if (countBlocks(userXml) > max) {
            isCorrect = false;
            feedback.push(rule.message || `Vous avez utilisé trop de blocs (max: ${max}).`);
          }
        }
        // Ajouter d'autres règles si nécessaire (whitelist, etc.)
      }
    } else {
      // 2. Fallback: Comparaison XML stricte (mais normalisée)
      // Normaliser les XML pour comparaison (enlever IDs, positions, espaces)
      const normalizeXml = (xml) => {
        return xml
          .replace(/\s+/g, ' ') // Réduire espaces
          .replace(/id="[^"]*"/g, '') // Enlever IDs
          .replace(/[xy]="[^"]*"/g, '') // Enlever positions x,y
          .replace(/variable="[^"]*"/g, 'variable="VAR"') // Normaliser variables
          .replace(/>\s+</g, '><')
          .trim();
      };

      if (!correctXml) {
        // Pas de solution ni de règles => on valide par défaut (ou erreur ?)
        isCorrect = true; // Ou false si strict
        feedback.push("Aucune solution définie.");
      } else {
        const userNorm = normalizeXml(userXml);
        const correctNorm = normalizeXml(correctXml);

        // Comparaison moins stricte: vérifier si les blocs de la solution sont présents
        // C'est difficile de faire une égalité parfaite sans parser le XML.
        // On tente une égalité des chaînes normalisées pour l'instant.
        if (userNorm !== correctNorm) {
          isCorrect = false;
          feedback.push('Le programme ne correspond pas exactement à la solution.');
        }
      }
    }

    const pointsEarned = isCorrect ? pointsMax : 0;

    return {
      isCorrect,
      pointsEarned,
      xp: pointsEarned,
      details: { userXml, correctXml, validationRules, matched: isCorrect, pointsEarned, pointsMax },
      feedback: feedback.length > 0 ? feedback.join('\n') : 'Bravo !'
    };
  }

  /**
   * Évalue VisualProgramming
   */
  static evaluateVisualProgramming(exercise, answer, pointsMax) {
    const userElements = answer?.elements || [];
    const correctElements = exercise.solutions?.[0] || [];
    const elementsMatch = JSON.stringify(userElements) === JSON.stringify(correctElements);

    return {
      isCorrect: elementsMatch,
      pointsEarned: elementsMatch ? pointsMax : 0,
      xp: elementsMatch ? pointsMax : 0,
      details: { userElements, correctElements, elementsMatch, pointsEarned: elementsMatch ? pointsMax : 0, pointsMax }
    };
  }

  /**
   * Évalue ConceptMapping
   */
  static evaluateConceptMapping(exercise, answer, pointsMax, allowPartial) {
    const userMappings = answer?.mappings || [];
    const correctMappings = exercise.solutions || [];

    if (allowPartial) {
      const correctMatches = userMappings.filter(mapping =>
        correctMappings.some(correct =>
          correct.conceptId === mapping.conceptId && correct.definitionId === mapping.definitionId
        )
      );
      const pointsEarned = Math.round((correctMatches.length / correctMappings.length) * pointsMax);
      return {
        isCorrect: pointsEarned >= pointsMax,
        pointsEarned,
        xp: pointsEarned,
        details: { userMappings, correctMappings, pointsEarned, pointsMax }
      };
    }

    const allCorrect = correctMappings.every(correct =>
      userMappings.some(mapping =>
        correct.conceptId === mapping.conceptId && correct.definitionId === mapping.definitionId
      )
    );
    const pointsEarned = allCorrect ? pointsMax : 0;

    return {
      isCorrect: allCorrect,
      pointsEarned,
      xp: pointsEarned,
      details: { userMappings, correctMappings, pointsEarned, pointsMax }
    };
  }

  /**
   * Évalue CodeOutput
   */
  static evaluateCodeOutput(exercise, answer, pointsMax) {
    const userOutput = String(answer || '').trim();
    const correctOutput = String(exercise.solutions?.[0] || '').trim();
    const matched = userOutput === correctOutput;

    return {
      isCorrect: matched,
      pointsEarned: matched ? pointsMax : 0,
      xp: matched ? pointsMax : 0,
      details: { userOutput, correctOutput, matched, pointsEarned: matched ? pointsMax : 0, pointsMax }
    };
  }

  /**
   * Évalue Optimization
   */
  static evaluateOptimization(exercise, answer, pointsMax) {
    let score = 0;
    const criteria = exercise.optimizationCriteria || [];

    criteria.forEach(criterion => {
      if (answer?.improvements?.[criterion]) {
        score += pointsMax / criteria.length;
      }
    });

    const pointsEarned = Math.round(score);

    return {
      isCorrect: pointsEarned >= pointsMax,
      pointsEarned,
      xp: pointsEarned,
      details: {
        userOptimization: answer?.optimization || '',
        correctOptimization: exercise.solutions?.[0] || '',
        criteria,
        pointsEarned,
        pointsMax
      }
    };
  }

  /**
   * Valide une réponse avant évaluation
   * @param {Object} exercise - L'exercice
   * @param {*} answer - La réponse
   * @param {Object} options - Options supplémentaires
   * @returns {Object} { valid, error }
   */
  static validateAnswer(exercise, answer, options = {}) {
    const type = exercise.type;

    // Validation générale
    if (!exercise.solutions && type !== 'Code') {
      if (!exercise.testCases || exercise.testCases.length === 0) {
        return {
          valid: false,
          error: 'Exercice mal configuré: pas de solutions disponibles'
        };
      }
    }

    // Validation spécifique par type
    switch (type) {
      case 'QCM':
        if (!Array.isArray(answer) && typeof answer !== 'number' && typeof answer !== 'string') {
          return { valid: false, error: 'Réponse QCM doit être un tableau, un nombre ou une chaîne' };
        }
        break;

      case 'TextInput':
      case 'FillInTheBlank':
        if (typeof answer !== 'string') {
          return { valid: false, error: 'Réponse doit être une chaîne de caractères' };
        }
        break;

      case 'Code':
        if (typeof options.passed !== 'boolean' &&
          (typeof options.passedCount !== 'number' || typeof options.totalCount !== 'number') &&
          !Array.isArray(options.tests)) {
          return { valid: false, error: 'Pour Code, fournissez passed, passedCount/totalCount, ou tests[]' };
        }
        break;

      case 'OrderBlocks':
      case 'Matching':
      case 'DragDrop':
        if (!Array.isArray(answer) && typeof answer !== 'object') {
          return { valid: false, error: 'Réponse doit être un tableau ou un objet' };
        }
        break;

      default:
        // Validation basique pour les autres types
        if (answer === null || answer === undefined) {
          return { valid: false, error: 'Réponse requise' };
        }
    }

    return { valid: true };
  }
}

module.exports = ExerciseService;

