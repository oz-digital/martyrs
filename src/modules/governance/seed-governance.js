import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../../../.env.production') });

// MongoDB connection
const DB_ADDRESS = process.env.DB_ADDRESS;

// Define schemas inline
const InitiativeSchema = new mongoose.Schema({
  title: String,
  name: String,
  description: String,
  status: String,
  client: String,
  date: mongoose.Schema.Types.Mixed,
  url: String,
  cover: mongoose.Schema.Types.Mixed,
  published: mongoose.Schema.Types.Mixed,
  structure: mongoose.Schema.Types.Mixed,
  team: mongoose.Schema.Types.Mixed,
  services: mongoose.Schema.Types.Mixed,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }]
}, { timestamps: true, strict: false, collection: 'initiatives' });

const MilestoneSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  status: {
    type: String,
    enum: ['not_started', 'in_progress', 'completed', 'blocked', 'cancelled'],
    default: 'not_started'
  },
  startDate: { type: Date, required: true },
  dueDate: { type: Date, required: true },
  completedDate: Date,
  progress: { type: Number, min: 0, max: 100, default: 0 },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  contributors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  initiative: { type: mongoose.Schema.Types.ObjectId, ref: 'Initiative', required: true },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  tags: [String],
  dependencies: [{
    milestone: { type: mongoose.Schema.Types.ObjectId, ref: 'Milestone' },
    type: { type: String, enum: ['blocks', 'blocked_by', 'related_to'], required: true }
  }],
  metadata: {
    estimatedHours: Number,
    actualHours: Number,
    budget: Number,
    actualCost: Number,
    notes: String
  }
}, { timestamps: true });

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  status: {
    type: String,
    enum: ['proposed', 'voting', 'not_started', 'in_progress', 'review', 'completed', 'blocked', 'cancelled'],
    default: 'not_started'
  },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  dueDate: Date,
  milestone: { type: mongoose.Schema.Types.ObjectId, ref: 'Milestone' },
  initiative: { type: mongoose.Schema.Types.ObjectId, ref: 'Initiative' },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  tags: [String],
  proposedByVoting: { type: mongoose.Schema.Types.ObjectId, ref: 'Voting' },
  completionVoting: { type: mongoose.Schema.Types.ObjectId, ref: 'Voting' },
  completedDate: Date
}, { timestamps: true });

const VotingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  type: {
    type: String,
    enum: ['create_task', 'approve_task', 'create_initiative', 'update_milestone', 'general'],
    default: 'general',
    required: true
  },
  targetModel: { type: String, enum: ['Task', 'Initiative', 'Milestone', null] },
  targetId: mongoose.Schema.Types.ObjectId,
  threshold: { type: Number, default: 51, min: 1, max: 100 },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  result: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  initiative: { type: mongoose.Schema.Types.ObjectId, ref: 'Initiative' },
  milestone: { type: mongoose.Schema.Types.ObjectId, ref: 'Milestone' },
  metadata: Object,
  startDate: { type: Date, default: Date.now },
  endDate: Date,
  status: { type: String, enum: ['pending', 'active', 'closed'], default: 'pending' },
  votes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Vote' }]
}, { timestamps: true });

const VoteSchema = new mongoose.Schema({
  value: { type: Number, required: true },
  voter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  voting: { type: mongoose.Schema.Types.ObjectId, ref: 'Voting', required: true },
  comment: String
}, { timestamps: true });

const UserSchema = new mongoose.Schema({
  name: String,
  email: String
}, { collection: 'users' });

// Models
const Initiative = mongoose.model('Initiative', InitiativeSchema);
const Milestone = mongoose.model('Milestone', MilestoneSchema);
const Task = mongoose.model('Task', TaskSchema);
const Voting = mongoose.model('Voting', VotingSchema);
const Vote = mongoose.model('Vote', VoteSchema);
const User = mongoose.model('User', UserSchema);

// Helper functions
function randomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function randomElements(array, count) {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, array.length));
}

function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

async function seedGovernance() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(DB_ADDRESS);
    console.log('✅ Connected to MongoDB');

    // Get existing data
    console.log('\n📊 Fetching existing data...');
    const initiatives = await Initiative.find({}).limit(10);
    const users = await User.find({}).limit(20);

    console.log(`📋 Found ${initiatives.length} initiatives`);
    console.log(`👥 Found ${users.length} users`);

    if (initiatives.length === 0) {
      console.log('❌ No initiatives found. Please create initiatives first.');
      process.exit(1);
    }

    if (users.length === 0) {
      console.log('❌ No users found. Please create users first.');
      process.exit(1);
    }

    let milestonesCreated = 0;
    let tasksCreated = 0;
    let votingsCreated = 0;
    let votesCreated = 0;

    // For each initiative
    for (const initiative of initiatives) {
      console.log(`\n🎯 Processing initiative: ${initiative.name || initiative.title}`);

      const initiativeOwner = randomElement(users);

      // Create 2-3 milestones
      const milestoneCount = Math.floor(Math.random() * 2) + 2; // 2-3
      const milestones = [];

      for (let i = 0; i < milestoneCount; i++) {
        const now = new Date();
        const startDate = new Date(now.getTime() - (90 - i * 30) * 24 * 60 * 60 * 1000); // 90, 60, 30 days ago
        const dueDate = new Date(now.getTime() + (30 + i * 30) * 24 * 60 * 60 * 1000); // 30, 60, 90 days from now

        let status, progress;
        if (i === 0) {
          status = 'completed';
          progress = 100;
        } else if (i === 1) {
          status = 'in_progress';
          progress = 60;
        } else {
          status = 'not_started';
          progress = 0;
        }

        const milestone = await Milestone.create({
          name: `Milestone ${i + 1} for ${initiative.name || initiative.title}`,
          description: `This is milestone ${i + 1} focusing on key deliverables`,
          status: status,
          startDate: startDate,
          dueDate: dueDate,
          completedDate: status === 'completed' ? new Date() : null,
          progress: progress,
          owner: randomElement(users)._id,
          contributors: randomElements(users, 3).map(u => u._id),
          initiative: initiative._id,
          priority: randomElement(['low', 'medium', 'high', 'urgent']),
          tags: [`Q${Math.floor(Math.random() * 4) + 1}-2025`, randomElement(['core', 'feature', 'improvement'])],
          metadata: {
            estimatedHours: Math.floor(Math.random() * 100) + 50,
            budget: Math.floor(Math.random() * 10000) + 5000
          }
        });

        milestones.push(milestone);
        milestonesCreated++;
        console.log(`  ✨ Created milestone: ${milestone.name}`);

        // Create 3-5 tasks for each milestone
        const taskCount = Math.floor(Math.random() * 3) + 3; // 3-5
        const tasks = [];

        for (let j = 0; j < taskCount; j++) {
          let taskStatus;
          let assignedTo = null;
          let completionVoting = null;

          // Distribute statuses
          if (j === 0 || j === 1) {
            taskStatus = 'completed';
          } else if (j === 2) {
            taskStatus = 'in_progress';
            assignedTo = randomElement(users)._id;
          } else if (j === 3 && taskCount > 3) {
            taskStatus = 'review';
            assignedTo = randomElement(users)._id;
          } else {
            taskStatus = 'not_started';
          }

          const task = await Task.create({
            title: `Task ${j + 1}: ${randomElement(['Implement', 'Design', 'Test', 'Deploy', 'Review'])} ${randomElement(['feature', 'component', 'API', 'integration', 'documentation'])}`,
            description: `Detailed description of task ${j + 1} for milestone ${milestone.name}`,
            status: taskStatus,
            assignedTo: assignedTo,
            dueDate: randomDate(new Date(), milestone.dueDate),
            milestone: milestone._id,
            initiative: initiative._id,
            priority: randomElement(['low', 'medium', 'high', 'urgent']),
            tags: [randomElement(['frontend', 'backend', 'design', 'testing']), randomElement(['urgent', 'bug', 'feature'])],
            completedDate: taskStatus === 'completed' ? new Date() : null
          });

          tasks.push(task);
          tasksCreated++;
          console.log(`    📝 Created task: ${task.title} (${task.status})`);

          // Create voting for tasks in review
          if (taskStatus === 'review') {
            const votingParticipants = randomElements(users, 5).map(u => u._id);

            const voting = await Voting.create({
              title: `Approve completion of: ${task.title}`,
              description: `Review and approve the completion of task "${task.title}"`,
              type: 'approve_task',
              targetModel: 'Task',
              targetId: task._id,
              threshold: 51,
              participants: votingParticipants,
              result: Math.random() > 0.5 ? 'approved' : 'pending',
              initiative: initiative._id,
              milestone: milestone._id,
              status: 'active'
            });

            task.completionVoting = voting._id;
            await task.save();

            votingsCreated++;
            console.log(`      🗳️  Created voting for task approval`);

            // Create votes for this voting
            for (const participantId of votingParticipants) {
              const voteValue = Math.random() > 0.3 ? 1 : 0; // 70% yes, 30% no

              await Vote.create({
                value: voteValue,
                voter: participantId,
                voting: voting._id,
                comment: voteValue === 1 ? 'Looks good!' : 'Needs more work'
              });

              votesCreated++;
            }
            console.log(`      ✅ Created ${votingParticipants.length} votes`);
          }
        }
      }

      // Create general voting for initiative
      const generalVoting = await Voting.create({
        title: `Should we expand scope of ${initiative.name || initiative.title}?`,
        description: 'Community voting on expanding the initiative scope and adding new features',
        type: 'general',
        targetModel: 'Initiative',
        targetId: initiative._id,
        threshold: 60,
        participants: randomElements(users, 7).map(u => u._id),
        result: randomElement(['pending', 'approved', 'rejected']),
        initiative: initiative._id,
        status: 'active'
      });

      votingsCreated++;
      console.log(`  🗳️  Created general voting: ${generalVoting.title}`);

      // Create votes for general voting
      for (const participantId of generalVoting.participants) {
        const voteValue = Math.random() > 0.4 ? 1 : 0; // 60% yes, 40% no

        await Vote.create({
          value: voteValue,
          voter: participantId,
          voting: generalVoting._id,
          comment: voteValue === 1 ? 'Great idea!' : 'Not sure about this'
        });

        votesCreated++;
      }
    }

    console.log('\n\n📊 Summary:');
    console.log(`✅ Milestones created: ${milestonesCreated}`);
    console.log(`✅ Tasks created: ${tasksCreated}`);
    console.log(`✅ Votings created: ${votingsCreated}`);
    console.log(`✅ Votes created: ${votesCreated}`);

    console.log('\n🎉 Seeding completed successfully!');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run seed
seedGovernance();
