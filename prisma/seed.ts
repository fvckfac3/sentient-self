import { PrismaClient } from '@prisma/client'
import exerciseData from '../docs/exercises_database_final_634_clean.json'
import frameworkData from '../docs/frameworks_final_13_edited.json'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Clear existing exercises
  await prisma.exercise.deleteMany()

  // Parse the exercises from the JSON structure
  const jsonData = exerciseData as { metadata: any; exercises: any[] }

  // Map the JSON fields to Prisma Exercise model fields
  const exercises = jsonData.exercises.map((exercise: any) => ({
    id: exercise.id,
    title: exercise.title || 'Untitled Exercise',
    framework: exercise.framework_used || 'General',
    topic: exercise.topic || null, // Handle optional topic field
    aspect: exercise.specific_aspect || 'General',
    aiPrompt: exercise.ai_prompt || ''
  }))

  console.log(`📚 Seeding ${exercises.length} exercises from database...`)
  console.log(`   Metadata version: ${jsonData.metadata.version}`)
  console.log(`   Last updated: ${jsonData.metadata.last_updated}`)

  // Batch create exercises for better performance
  await prisma.exercise.createMany({
    data: exercises,
    skipDuplicates: true
  })

  console.log('✅ Database seeded successfully!')
  console.log(`   Total exercises seeded: ${exercises.length}`)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })