// Add this to CourseController.js

// Get all completed levels for a user
static getUserCompletedLevels = catchErrors(async (req, res) => {
    const { userId } = req.params;

    if (!userId || typeof userId !== 'string') {
        return res.status(400).json({ error: 'userId requis' });
    }

    // Convert userId to ObjectId if needed
    const mongoose = require('mongoose');
    const crypto = require('crypto');

    let userObjectId;
    if (mongoose.isValidObjectId(userId)) {
        userObjectId = typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId;
    } else {
        const hash = crypto.createHash('md5').update(userId).digest('hex');
        userObjectId = new mongoose.Types.ObjectId(hash.substring(0, 24));
    }

    // Fetch all completed levels
    const completedLevels = await UserLevelProgress.find({
        user: userObjectId,
        completed: true
    }).select('level').lean();

    const levelIds = completedLevels.map(lp => lp.level.toString());

    res.json({ completedLevels: levelIds });
});
