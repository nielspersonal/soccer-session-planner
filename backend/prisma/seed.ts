import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create a demo user
  const passwordHash = await bcrypt.hash('password123', 10);
  
  const user = await prisma.user.upsert({
    where: { email: 'coach@example.com' },
    update: {},
    create: {
      email: 'coach@example.com',
      passwordHash,
      name: 'Demo Coach',
    },
  });

  console.log('✅ Created user:', user.email);

  // Create sample drills
  const drill1 = await prisma.drill.create({
    data: {
      userId: user.id,
      title: 'Passing Triangle',
      objective: 'Improve short passing accuracy and movement',
      ageGroup: 'U12',
      durationMinutes: 15,
      notes: 'Focus on one-touch passing. Players should communicate and call for the ball.',
      tags: ['passing', 'technical', 'warm-up'],
      diagramJson: {
        background: 'blank',
        objects: [
          { type: 'player', x: 150, y: 200, label: 'P1', color: '#3498db' },
          { type: 'player', x: 300, y: 100, label: 'P2', color: '#3498db' },
          { type: 'player', x: 450, y: 200, label: 'P3', color: '#3498db' },
          { type: 'ball', x: 150, y: 200 },
          { type: 'arrow', x: 150, y: 200, endX: 300, endY: 100, color: '#e74c3c' },
          { type: 'arrow', x: 300, y: 100, endX: 450, endY: 200, color: '#e74c3c' },
          { type: 'arrow', x: 450, y: 200, endX: 150, endY: 200, color: '#e74c3c' },
          { type: 'cone', x: 150, y: 200, color: '#f39c12' },
          { type: 'cone', x: 300, y: 100, color: '#f39c12' },
          { type: 'cone', x: 450, y: 200, color: '#f39c12' },
        ],
      },
    },
  });

  const drill2 = await prisma.drill.create({
    data: {
      userId: user.id,
      title: '1v1 Attacking',
      objective: 'Develop dribbling skills and 1v1 attacking confidence',
      ageGroup: 'U14',
      durationMinutes: 20,
      notes: 'Attacker starts with ball. Defender must stay behind cone until attacker touches ball. Score by dribbling through mini goals.',
      tags: ['dribbling', '1v1', 'attacking'],
      diagramJson: {
        background: 'blank',
        objects: [
          { type: 'player', x: 200, y: 200, label: 'A', color: '#e74c3c' },
          { type: 'player', x: 400, y: 200, label: 'D', color: '#3498db' },
          { type: 'ball', x: 200, y: 200 },
          { type: 'goal', x: 500, y: 150 },
          { type: 'goal', x: 500, y: 250 },
          { type: 'cone', x: 350, y: 200, color: '#f39c12' },
          { type: 'arrow', x: 200, y: 200, endX: 500, endY: 180, color: '#2ecc71', dashed: true },
          { type: 'zone', x: 450, y: 120, width: 100, height: 180, color: 'rgba(46, 204, 113, 0.2)', strokeColor: '#27ae60' },
        ],
      },
    },
  });

  const drill3 = await prisma.drill.create({
    data: {
      userId: user.id,
      title: 'Small-Sided Game 4v4',
      objective: 'Apply skills in game situation, improve decision making',
      ageGroup: 'U16',
      durationMinutes: 25,
      notes: 'Two teams of 4. Regular rules. Encourage quick transitions and communication.',
      tags: ['game', 'tactical', 'decision-making'],
      diagramJson: {
        background: 'half-pitch',
        objects: [
          { type: 'player', x: 100, y: 150, label: 'GK', color: '#f39c12' },
          { type: 'player', x: 200, y: 100, label: 'B1', color: '#3498db' },
          { type: 'player', x: 200, y: 200, label: 'B2', color: '#3498db' },
          { type: 'player', x: 300, y: 150, label: 'B3', color: '#3498db' },
          { type: 'player', x: 400, y: 100, label: 'R1', color: '#e74c3c' },
          { type: 'player', x: 400, y: 200, label: 'R2', color: '#e74c3c' },
          { type: 'player', x: 500, y: 150, label: 'R3', color: '#e74c3c' },
          { type: 'ball', x: 300, y: 150 },
        ],
      },
    },
  });

  console.log('✅ Created drills:', drill1.title, drill2.title, drill3.title);

  // Create a sample session
  const session = await prisma.session.create({
    data: {
      userId: user.id,
      title: 'Tuesday Training Session',
      date: new Date('2024-02-15'),
      team: 'U14 Boys',
      totalDuration: 90,
      theme: 'Attacking Play & 1v1 Situations',
      notes: 'Focus on building confidence in attacking situations. Keep energy high!',
    },
  });

  // Add drills to session
  await prisma.sessionDrill.createMany({
    data: [
      {
        sessionId: session.id,
        drillId: drill1.id,
        order: 0,
        durationOverride: 10,
        sessionNotes: 'Quick warm-up, keep it moving',
      },
      {
        sessionId: session.id,
        drillId: drill2.id,
        order: 1,
        sessionNotes: 'Main focus - encourage creativity',
      },
      {
        sessionId: session.id,
        drillId: drill3.id,
        order: 2,
        durationOverride: 30,
        sessionNotes: 'Apply what we practiced in game situation',
      },
    ],
  });

  console.log('✅ Created session:', session.title);
  console.log('\n🎉 Seeding complete!');
  console.log('\n📧 Login credentials:');
  console.log('   Email: coach@example.com');
  console.log('   Password: password123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
