const Event = require('../models/Event');
const { validateEvent, validateDateRange } = require('../utils/validation');
const moment = require('moment');

class EventController {
  // POST /events
  async createEvent(req, res) {
    try {
      const { error, value } = validateEvent(req.body);
      
      if (error) {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.details.map(detail => detail.message)
        });
      }

      const event = new Event({
        user_id: value.user_id,
        event_type: value.event_type,
        payload: value.payload,
        timestamp: new Date()
      });

      await event.save();
      
      res.status(202).json({
        message: 'Event received successfully',
        event_id: event.event_id
      });
    } catch (error) {
      console.error('Error creating event:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to process event'
      });
    }
  }

  // GET /analytics/event-counts
  async getEventCounts(req, res) {
    try {
      const { event_type, start_date, end_date } = req.query;
      
      // Validate date parameters
      const dateValidation = validateDateRange(start_date, end_date);
      if (dateValidation.error) {
        return res.status(400).json({
          error: 'Invalid date parameters',
          message: dateValidation.error
        });
      }

      // Build query filter
      const filter = {};
      
      if (event_type) {
        if (!['view', 'click', 'location'].includes(event_type)) {
          return res.status(400).json({
            error: 'Invalid event_type',
            message: 'event_type must be one of: view, click, location'
          });
        }
        filter.event_type = event_type;
      }

      if (start_date || end_date) {
        filter.timestamp = {};
        if (start_date) {
          filter.timestamp.$gte = moment(start_date).startOf('day').toDate();
        }
        if (end_date) {
          filter.timestamp.$lte = moment(end_date).endOf('day').toDate();
        }
      }

      const totalEvents = await Event.countDocuments(filter);
      
      res.status(200).json({
        total_events: totalEvents
      });
    } catch (error) {
      console.error('Error getting event counts:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to retrieve event counts'
      });
    }
  }

  // GET /analytics/event-counts-by-type
  async getEventCountsByType(req, res) {
    try {
      const { start_date, end_date } = req.query;
      
      // Validate date parameters
      const dateValidation = validateDateRange(start_date, end_date);
      if (dateValidation.error) {
        return res.status(400).json({
          error: 'Invalid date parameters',
          message: dateValidation.error
        });
      }

      // Build match stage for aggregation
      const matchStage = {};
      
      if (start_date || end_date) {
        matchStage.timestamp = {};
        if (start_date) {
          matchStage.timestamp.$gte = moment(start_date).startOf('day').toDate();
        }
        if (end_date) {
          matchStage.timestamp.$lte = moment(end_date).endOf('day').toDate();
        }
      }

      const pipeline = [
        ...(Object.keys(matchStage).length > 0 ? [{ $match: matchStage }] : []),
        {
          $group: {
            _id: '$event_type',
            count: { $sum: 1 }
          }
        }
      ];

      const results = await Event.aggregate(pipeline);
      
      // Format results as required
      const eventCounts = {};
      results.forEach(result => {
        eventCounts[result._id] = result.count;
      });

      res.status(200).json(eventCounts);
    } catch (error) {
      console.error('Error getting event counts by type:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to retrieve event counts by type'
      });
    }
  }
}

module.exports = new EventController();