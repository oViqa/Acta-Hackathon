import bcrypt from 'bcrypt';
import { connectDatabase, getDb } from './config/database';
import { ObjectId } from 'mongodb';

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

  const db = getDb();
  if (!db) {
    console.log('⚠️ Database not connected, skipping seed');
    return;
  }

  // Clear existing data
  await db.collection('users').deleteMany({});
  await db.collection('events').deleteMany({});
  await db.collection('attendances').deleteMany({});
  await db.collection('messages').deleteMany({});

  // Create admin users
  const admin1 = await db.collection('users').insertOne({
    email: 'admin@puddingmeetup.com',
    passwordHash: await bcrypt.hash('admin123', 10),
    name: 'Admin',
    createdAt: new Date()
  });

  const admin2 = await db.collection('users').insertOne({
    email: 'admin2@puddingmeetup.com',
    passwordHash: await bcrypt.hash('adminpudding2', 10),
    name: 'Admin2',
    createdAt: new Date()
  });

  const puddingDummy = await db.collection('users').insertOne({
    email: 'puddingdummy@puddingmeetup.com',
    passwordHash: await bcrypt.hash('dummytest', 10),
    name: 'PuddingDummy',
    createdAt: new Date()
  });

  console.log(`✅ Created admin: admin@puddingmeetup.com`);
  console.log(`✅ Created admin2: admin2@puddingmeetup.com`);
  console.log(`✅ Created puddingdummy: puddingdummy@puddingmeetup.com`);

  // Create test users
  const users = [admin1.insertedId, admin2.insertedId, puddingDummy.insertedId];
  for (let i = 1; i <= 5; i++) {
    const result = await db.collection('users').insertOne({
      email: `user${i}@puddingmeetup.com`,
      passwordHash: await bcrypt.hash('password123', 10),
      name: `Test User ${i}`,
      createdAt: new Date()
    });
    users.push(result.insertedId);
    console.log(`✅ Created user: Test User ${i}`);
  }

  // Create test events
  const now = new Date();
  for (let i = 0; i < 10; i++) {
    const city = germanCities[i];
    const startTime = new Date(now.getTime() + (i + 1) * 24 * 60 * 60 * 1000 + Math.random() * 48 * 60 * 60 * 1000);
    const endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000);

    const eventResult = await db.collection('events').insertOne({
      title: eventTitles[i],
      description: descriptions[i % descriptions.length],
      location: {
        type: 'Point',
        coordinates: [city.lng, city.lat]
      },
      city: city.city,
      state: city.state,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      attendeeLimit: 10 + Math.floor(Math.random() * 20),
      organizerId: users[i % users.length].toHexString(),
      status: 'UPCOMING',
      createdAt: now.toISOString()
    });

    // Add some attendances
    const numAttendees = Math.floor(Math.random() * 5) + 2;
    for (let j = 0; j < numAttendees; j++) {
      const attendeeUser = users[(i + j + 1) % users.length];
      await db.collection('attendances').insertOne({
        userId: attendeeUser.toHexString(),
        eventId: eventResult.insertedId.toHexString(),
        status: j < numAttendees - 1 ? 'APPROVED' : 'PENDING',
        puddingPhoto: '/uploads/placeholder-pudding.jpg',
        puddingName: ['Vanilla', 'Chocolate', 'Strawberry', 'Caramel', 'Banana'][j % 5] + ' Pudding',
        puddingDesc: 'Homemade with love!',
        joinedAt: new Date()
      });
    }

    // Add some messages
    if (numAttendees > 1) {
      for (let k = 0; k < 3; k++) {
        const messageUser = users[(i + k) % users.length];
        await db.collection('messages').insertOne({
          userId: messageUser.toHexString(),
          eventId: eventResult.insertedId.toHexString(),
          content: [
            'Can\'t wait for this event!',
            'I\'m bringing my special pudding recipe!',
            'This is going to be amazing!',
            'Looking forward to meeting everyone!',
            'Does anyone have dietary restrictions?',
          ][k % 5],
          createdAt: new Date()
        });
      }
    }

    console.log(`✅ Created event: ${eventTitles[i]} in ${city.city}`);
  }

  console.log('🎉 Seeding completed!');
}

connectDatabase()
  .then(() => seed())
  .then(() => {
    console.log('🎉 Seeding completed successfully!');
    process.exit(0);
  })
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  });
