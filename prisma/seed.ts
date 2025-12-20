import { PrismaClient } from '@prisma/client'
import exerciseData from '../docs/exercises_database_final_634_clean.json'
import frameworkData from '../docs/frameworks_final_13_edited.json'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Clear existing exercises
  await prisma.exercise.deleteMany()

  // Seed exercises from the JSON data
  const exercises = Object.entries(exerciseData).map(([id, exercise]: [string, any]) => ({
    id,
    title: exercise.title,
    framework: exercise.framework,
    topic: exercise.topic,
    aspect: exercise.aspect,
    aiPrompt: exercise.ai_prompt
  }))

  console.log(`📚 Seeding ${exercises.length} exercises...`)
  
  for (const exercise of exercises) {
    await prisma.exercise.create({
      data: exercise
    })
  }

  console.log('✅ Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })