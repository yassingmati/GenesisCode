export const normalizeScratchXml = (xmlString) => {
    if (!xmlString) return null;
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlString, "text/xml");
    return doc;
};

const cleanNode = (node) => {
    // Clone node to avoid modifying original
    const clone = node.cloneNode(true);

    // Remove attributes that don't matter for logic
    if (clone.removeAttribute) {
        clone.removeAttribute("id");
        clone.removeAttribute("x");
        clone.removeAttribute("y");
        clone.removeAttribute("variable"); // Variable IDs sometimes change
    }

    // Recursively clean children
    Array.from(clone.childNodes).forEach(child => {
        if (child.nodeType === 1) { // Element
            // Remove <shadow> blocks usually (they are placeholders)
            // But sometimes shadow blocks matter (like values). 
            // For strict comparison, we keep them but clean them.
            cleanNode(child);
        } else if (child.nodeType === 3) {
            // Text node - trim whitespace
            child.textContent = child.textContent.trim();
        }
    });

    return clone;
};

const nodesEqual = (msgNode, solNode) => {
    if (msgNode.nodeType !== solNode.nodeType) return false;

    // Compare text content for text nodes
    if (msgNode.nodeType === 3) {
        return msgNode.textContent === solNode.textContent;
    }

    // Compare Element tags
    if (msgNode.tagName !== solNode.tagName) return false;

    // Compare Attributes (excluding ignored ones)
    // We already cleaned them on input, but let's be double sure or just compare specific attributes based on tag
    if (msgNode.tagName === 'block') {
        if (msgNode.getAttribute('type') !== solNode.getAttribute('type')) return false;
    }
    if (msgNode.tagName === 'field') {
        if (msgNode.getAttribute('name') !== solNode.getAttribute('name')) return false;
        // Fields text content matters (e.g., variable name or value)
        if (msgNode.textContent !== solNode.textContent) return false;
    }
    if (msgNode.tagName === 'value') {
        if (msgNode.getAttribute('name') !== solNode.getAttribute('name')) return false;
    }

    // Compare Children
    // This is tricky because order matters for 'next', but maybe not for inputs if we mapped them?
    // In Scratch XML, inputs (values) and next blocks usually appear in specific order.
    // We will assume simpler strict structural equality for now.

    const msgChildren = Array.from(msgNode.childNodes).filter(n => n.nodeType === 1); // Only Elements
    const solChildren = Array.from(solNode.childNodes).filter(n => n.nodeType === 1);

    if (msgChildren.length !== solChildren.length) return false;

    for (let i = 0; i < msgChildren.length; i++) {
        if (!nodesEqual(msgChildren[i], solChildren[i])) return false;
    }

    return true;
};

export const compareScratchXml = (userXml, solutionXml) => {
    try {
        const userDoc = normalizeScratchXml(userXml);
        const solDoc = normalizeScratchXml(solutionXml);

        if (!userDoc || !solDoc) return { passed: false, error: "Invalid XML" };

        // We assume the solution defines a set of blocks that must exist.
        // User might have EXTRA blocks (detached), but the MAIN script must match.
        // Or we enforce strict equality of the workspace?
        // Let's assume we look for the Solution's block structure INSIDE the User's workspace.

        // Find the first "block" in solution (the root of the script)
        const solRoot = solDoc.querySelector('xml > block');
        if (!solRoot) return { passed: true, message: "No solution blocks defined" }; // Empty solution = pass?

        const cleanSol = cleanNode(solRoot);

        // Find ALL root blocks in user XML
        const userRoots = userDoc.querySelectorAll('xml > block');

        let matchFound = false;
        for (let userRoot of userRoots) {
            const cleanUser = cleanNode(userRoot);
            if (nodesEqual(cleanUser, cleanSol)) {
                matchFound = true;
                break;
            }
        }

        if (matchFound) {
            return { passed: true };
        } else {
            return { passed: false, message: "La structure des blocs ne correspond pas à la solution attendue." };
        }

    } catch (e) {
        console.error("Comparison error", e);
        return { passed: false, message: "Erreur de comparaison interne" };
    }
};
