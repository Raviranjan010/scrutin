const express = require('express');
const { getReview, getUserReviews } = require('../services/review.service');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// GET /reviews/mine - Fetch logged in user's reviews
router.get('/mine', authMiddleware, async (req, res) => {
  try {
    const reviews = await getUserReviews(req.user.id);
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    res.status(500).send('Internal server error');
  }
});

// GET /reviews/:id - Fetch public review
router.get('/:id', async (req, res) => {
  try {
    const review = await getReview(req.params.id);
    if (!review) {
      return res.status(404).send('Review not found');
    }
    res.json(review);
  } catch (error) {
    console.error('Error fetching review:', error);
    res.status(500).send('Internal server error');
  }
});

module.exports = router;
