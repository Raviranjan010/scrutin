const fs = require('fs').promises;
const path = require('path');
const { nanoid } = require('nanoid');

const REVIEWS_FILE = path.join(__dirname, '../../data/reviews.json');

async function getReviews() {
  try {
    const data = await fs.readFile(REVIEWS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    if (err.code === 'ENOENT') {
      await fs.writeFile(REVIEWS_FILE, '[]');
      return [];
    }
    throw err;
  }
}

async function saveReviewsData(reviews) {
  await fs.writeFile(REVIEWS_FILE, JSON.stringify(reviews, null, 2));
}

async function saveReview({ userId, code, language, review, score }) {
  const reviews = await getReviews();
  const newReview = {
    id: nanoid(8),
    userId: userId || null,
    code,
    language,
    review,
    score,
    createdAt: new Date().toISOString()
  };
  
  reviews.push(newReview);
  await saveReviewsData(reviews);
  
  return newReview.id;
}

async function getReview(reviewId) {
  const reviews = await getReviews();
  return reviews.find(r => r.id === reviewId) || null;
}

async function getUserReviews(userId) {
  const reviews = await getReviews();
  return reviews.filter(r => r.userId === userId);
}

module.exports = {
  saveReview,
  getReview,
  getUserReviews
};
