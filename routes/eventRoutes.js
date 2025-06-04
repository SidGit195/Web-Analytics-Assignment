const express = require('express');
const eventController = require('../controllers/eventController');

const router = express.Router();

router.post('/events', eventController.createEvent);

router.get('/analytics/event-counts', eventController.getEventCounts);

router.get('/analytics/event-counts-by-type', eventController.getEventCountsByType);


module.exports = router;