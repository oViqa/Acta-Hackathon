import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { connectDatabase } from './config/database';
import { User } from './models/User';
import { Event, EventStatus } from './models/Event';
import { Attendance, AttendanceStatus } from './models/Attendance';
import { Message } from './models/Message';

const germanCities = [
  { city: 'Berlin', state: 'Berlin', lat: 52.520008, lng: 13.404954 },
  { city: 'Munich', state: 'Bavaria', lat: 48.137154, lng: 11.576124 },
  { city: 'Hamburg', state: 'Hamburg', lat: 53.551086, lng: 9.993682 },
  { city: 'Cologne', state: 'North Rhine-Westphalia', lat: 50.937531, lng: 6.960279 },
  { city: 'Frankfurt', state: 'Hesse', lat: 50.110924, lng: 8.682127 },
  { city: 'Stuttgart', state: 'Baden-Württemberg', lat: 48.775846, lng: 9.182932 },
  { city: 'Düsseldorf', state: 'North Rhine-Westphalia', lat: 51.227741, lng: 6.773456 },
  { city: 'Leipzig', state: 'Saxony', lat: 51.339695, lng: 12.373075 },
  { city: 'Dresden', state: 'Saxony', lat: 51.050407, lng: 13.737262 },
  { city: 'Nuremberg', state: 'Bavaria', lat: 49.452103, lng: 11.076665 },
];

const eventTitles = [
  'Schoko-Pudding Sonntag',
  'Vanilla Dreams Meetup',
  'Caramel Connection',
  'Strawberry Pudding Party',
  'Chocolate Lovers Unite',
  'Vanilla Vibes',
  'Pudding Paradise',
  'Sweet Sunday Gathering',
  'Dessert Delight Meetup',
  'Pudding Power Hour',
];

const descriptions = [
  'Bring your favorite pudding and let\'s share stories!',
  'Let\'s meet and enjoy delicious pudding together!',
  'A gathering for pudding enthusiasts. All flavors welcome!',
  'Join us for an afternoon of pudding tasting and fun conversations.',
  'Let\'s celebrate the pudding culture together!',
];

async function seed() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  await User.deleteMany({});
  await Event.deleteMany({});
  await Attendance.deleteMany({});
  await Message.deleteMany({});

  // Create admin user
  const admin = await User.create({
    email: 'admin@puddingmeetup.com',
    passwordHash: await bcrypt.hash('admin123', 10),
    name: 'Admin',
  });
  console.log(`✅ Created admin: ${admin.email}`);

  // Create test users
  const users = [admin];
  for (let i = 1; i <= 5; i++) {
    const user = await User.create({
      email: `user${i}@puddingmeetup.com`,
      passwordHash: await bcrypt.hash('password123', 10),
      name: `Test User ${i}`,
    });
    users.push(user);
    console.log(`✅ Created user: ${user.name}`);
  }

  // Create test events
  const now = new Date();
  for (let i = 0; i < 10; i++) {
    const city = germanCities[i];
    const startTime = new Date(now.getTime() + (i + 1) * 24 * 60 * 60 * 1000 + Math.random() * 48 * 60 * 60 * 1000);
    const endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000);

    const event = await Event.create({
      title: eventTitles[i],
      description: descriptions[i % descriptions.length],
      location: {
        type: 'Point',
        coordinates: [city.lng, city.lat]
      },
      city: city.city,
      state: city.state,
      startTime,
      endTime,
      attendeeLimit: 10 + Math.floor(Math.random() * 20),
      organizerId: users[i % users.length]._id,
    });

    // Add some attendances
    const numAttendees = Math.floor(Math.random() * 5) + 2;
    for (let j = 0; j < numAttendees; j++) {
      const attendeeUser = users[(i + j + 1) % users.length];
      await Attendance.create({
        userId: attendeeUser._id,
        eventId: event._id,
        status: j < numAttendees - 1 ? AttendanceStatus.APPROVED : AttendanceStatus.PENDING,
        puddingPhoto: '/uploads/placeholder-pudding.jpg',
        puddingName: ['Vanilla', 'Chocolate', 'Strawberry', 'Caramel', 'Banana'][j % 5] + ' Pudding',
        puddingDesc: 'Homemade with love!',
      });
    }

    // Add some messages
    if (numAttendees > 1) {
      for (let k = 0; k < 3; k++) {
        const messageUser = users[(i + k) % users.length];
        await Message.create({
          userId: messageUser._id,
          eventId: event._id,
          content: [
            'Can\'t wait for this event!',
            'I\'m bringing my special pudding recipe!',
            'This is going to be amazing!',
            'Looking forward to meeting everyone!',
            'Does anyone have dietary restrictions?',
          ][k % 5],
        });
      }
    }

    console.log(`✅ Created event: ${event.title} in ${event.city}`);
  }

  console.log('🎉 Seeding completed!');
}

connectDatabase()
  .then(() => seed())
  .then(() => {
    console.log('Closing database connection...');
    mongoose.connection.close();
  })
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  });
