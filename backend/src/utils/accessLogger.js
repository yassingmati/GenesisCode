// Simple structured logger for access decisions

function logAccessDecision({
  userId,
  context = 'unknown',
  pathId = null,
  levelId = null,
  exerciseId = null,
  decision,
  reason = null,
  latencyMs = null
}) {
  try {
    const entry = {
      ts: new Date().toISOString(),
      userId,
      context,
      pathId,
      levelId,
      exerciseId,
      decision,
      reason,
      latencyMs
    };
    // eslint-disable-next-line no-console
    console.log('[ACCESS_DECISION]', JSON.stringify(entry));
  } catch (_) {
    // swallow logging errors
  }
}

module.exports = { logAccessDecision };




