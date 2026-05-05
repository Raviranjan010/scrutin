const Review = require('../models/Review');
const { nanoid } = require('nanoid');

async function saveReview({ userId, code, language, review, score }) {
  const newReview = await Review.create({
    id: nanoid(8),
    userId: userId || null,
    code,
    language,
    review,
    score
  });
  
  return newReview.id;
}

async function getReview(reviewId) {
  return await Review.findOne({ id: reviewId });
}

async function getUserReviews(userId) {
  return await Review.find({ userId });
}

module.exports = {
  saveReview,
  getReview,
  getUserReviews
};

