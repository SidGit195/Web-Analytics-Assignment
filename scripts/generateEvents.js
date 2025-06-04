const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');
const Event = require('../models/Event');
const moment = require('moment');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/web_analytics';
const NUM_EVENTS = 3000;

const sampleUrls = [
  'https://example.com/',
  'https://example.com/about',
  'https://example.com/products',
  'https://example.com/contact',
  'https://example.com/blog',
  'https://example.com/pricing',
  'https://example.com/support'
];

const sampleElements = [
  { id: 'nav-home', text: 'Home' },
  { id: 'nav-about', text: 'About' },
  { id: 'btn-submit', text: 'Submit' },
  { id: 'btn-cancel', text: 'Cancel' },
  { id: 'link-pricing', text: 'View Pricing' },
  { id: 'footer-contact', text: 'Contact Us' }
];

function generateViewPayload() {
  const url = faker.helpers.arrayElement(sampleUrls);
  return {
    url,
    title: faker.datatype.boolean() ? faker.lorem.words(3) : undefined
  };
}

function generateClickPayload() {
  const element = faker.helpers.arrayElement(sampleElements);
  return {
    element_id: element.id,
    text: element.text,
    xpath: faker.datatype.boolean() ? `//*[@id="${element.id}"]` : undefined
  };
}

function generateLocationPayload() {
  return {
    latitude: parseFloat(faker.location.latitude()),
    longitude: parseFloat(faker.location.longitude()),
    accuracy: faker.datatype.boolean() ? faker.number.int({ min: 5, max: 100 }) : undefined
  };
}

function generateRandomTimestamp() {
  const start = moment('2025-05-01');
  const end = moment('2025-05-29');
  const randomDate = moment(faker.date.between({ from: start.toDate(), to: end.toDate() }));
  return randomDate.toDate();
}

async function generateEvents() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing events
    await Event.deleteMany({});
    console.log('Cleared existing events');

    const userIds = Array.from({ length: 50 }, () => faker.string.uuid());
    const eventTypes = ['view', 'click', 'location'];

    console.log('Generating and inserting events...');
    
    // Insert events one by one to ensure event_id generation
    for (let i = 0; i < NUM_EVENTS; i++) {
      const user_id = faker.helpers.arrayElement(userIds);
      const event_type = faker.helpers.arrayElement(eventTypes);
      
      let payload;
      switch (event_type) {
        case 'view':
          payload = generateViewPayload();
          break;
        case 'click':
          payload = generateClickPayload();
          break;
        case 'location':
          payload = generateLocationPayload();
          break;
      }

      // Create new event - event_id will be auto-generated
      const event = new Event({
        user_id,
        event_type,
        payload,
        timestamp: generateRandomTimestamp()
      });

      await event.save();

      if ((i + 1) % 500 === 0) {
        console.log(`Generated ${i + 1} events...`);
      }
    }
    
    console.log(`Successfully generated and inserted ${NUM_EVENTS} events`);
    
    // Display summary with sample events
    const summary = await Event.aggregate([
      {
        $group: {
          _id: '$event_type',
          count: { $sum: 1 }
        }
      }
    ]);
    
    console.log('\nEvent Summary:');
    summary.forEach(item => {
      console.log(`${item._id}: ${item.count}`);
    });

    // Show sample events to verify event_id generation
    console.log('\nSample Events (first 3):');
    const sampleEvents = await Event.find({}).limit(3);
    sampleEvents.forEach((event, index) => {
      console.log(`\nEvent ${index + 1}:`);
      console.log(`  event_id: ${event.event_id}`);
      console.log(`  user_id: ${event.user_id}`);
      console.log(`  event_type: ${event.event_type}`);
      console.log(`  timestamp: ${event.timestamp}`);
      console.log(`  payload: ${JSON.stringify(event.payload, null, 2)}`);
    });

    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  } catch (error) {
    console.error('Error generating events:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  generateEvents();
}

module.exports = { generateEvents };