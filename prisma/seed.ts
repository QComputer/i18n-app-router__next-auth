/**
 * Database Seed Script
 * 
 * This script seeds the database with initial data for testing and development.
 * Run with: npx tsx prisma/seed.ts
 */

import 'dotenv/config'
import { PrismaClient, OrganizationType, ThemeMode } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...\n')

  // Clean up existing data (in reverse order of dependencies)
  console.log('🧹 Cleaning up existing data...')
  
  await prisma.appointment.deleteMany()
  await prisma.holiday.deleteMany()
  await prisma.businessHours.deleteMany()
  await prisma.service.deleteMany()
  await prisma.staff.deleteMany()
  await prisma.session.deleteMany()
  await prisma.account.deleteMany()
  await prisma.verificationToken.deleteMany()
  await prisma.user.deleteMany()
  await prisma.organization.deleteMany()

  console.log('✅ Cleanup complete\n')

  // Create Admin User
  console.log('👤 Creating admin user...')
  const adminPassword = await bcrypt.hash('Admin@123!', 10)
  const adminUser = await prisma.user.create({
    data: {
      username: 'admin',
      email: 'admin@example.com',
      name: 'System Administrator',
      password: adminPassword,
      role: 'ADMIN',
      locale: 'en',
      themeMode: ThemeMode.SYSTEM,
    },
  })
  console.log(`   Created admin user: ${adminUser.username} (${adminUser.id})\n`)

  // Create Demo User
  console.log('👤 Creating demo user...')
  const demoPassword = await bcrypt.hash('Demo@123!', 10)
  const demoUser = await prisma.user.create({
    data: {
      username: 'demo',
      email: 'demo@example.com',
      name: 'Demo User',
      password: demoPassword,
      role: 'CLIENT',
      locale: 'en',
      themeMode: ThemeMode.SYSTEM,
    },
  })
  console.log(`   Created demo user: ${demoUser.username} (${demoUser.id})\n`)

  // Create Organization
  console.log('🏢 Creating sample organization...')
  const organization = await prisma.organization.create({
    data: {
      name: 'Demo Clinic',
      slug: 'demo-clinic',
      type: OrganizationType.DOCTOR,
      description: 'A demo medical clinic for testing the appointment system',
      website: 'https://democlinic.example.com',
      phone: '+98-21-12345678',
      email: 'info@democlinic.example.com',
      address: '123 Main Street, Tehran, Iran',
      timezone: 'Asia/Tehran',
      locale: 'fa',
      themeMode: ThemeMode.SYSTEM,
      primaryColor: '#0ea5e9',
      secondaryColor: '#64748b',
      isActive: true,
    },
  })
  console.log(`   Created organization: ${organization.name} (${organization.id})\n`)

  // Create Staff Members
  console.log('👨‍⚕️ Creating staff members...')
  
  // Create staff user for doctor
  const doctorPassword = await bcrypt.hash('Doctor@123!', 10)
  const doctorUser = await prisma.user.create({
    data: {
      username: 'doctor',
      email: 'doctor@democlinic.example.com',
      name: 'Dr. Ali Ahmadi',
      password: doctorPassword,
      role: 'STAFF',
      locale: 'fa',
      themeMode: ThemeMode.SYSTEM,
    },
  })

  const doctor = await prisma.staff.create({
    data: {
      userId: doctorUser.id,
      organizationId: organization.id,
      bio: 'General practitioner with 10 years of experience',
      isActive: true,
      isDefault: true,
    },
  })
  console.log(`   Created staff: ${doctorUser.name} (${doctor.id})\n`)

  // Create Another Staff Member
  const nursePassword = await bcrypt.hash('Nurse@123!', 10)
  const nurseUser = await prisma.user.create({
    data: {
      username: 'nurse',
      email: 'nurse@democlinic.example.com',
      name: 'Sara Hosseini',
      password: nursePassword,
      role: 'STAFF',
      locale: 'fa',
      themeMode: ThemeMode.SYSTEM,
    },
  })

  const nurse = await prisma.staff.create({
    data: {
      userId: nurseUser.id,
      organizationId: organization.id,
      bio: 'Registered nurse specializing in patient care',
      isActive: true,
      isDefault: false,
    },
  })
  console.log(`   Created staff: ${nurseUser.name} (${nurse.id})\n`)

  // Create Services
  console.log('💉 Creating services...')
  
  const services = await Promise.all([
    prisma.service.create({
      data: {
        name: 'General Consultation',
        description: 'General health consultation and checkup',
        duration: 30,
        price: 500000,
        currency: 'IRR',
        color: '#22c55e',
        slotInterval: 30,
        organizationId: organization.id,
      },
    }),
    prisma.service.create({
      data: {
        name: 'Specialist Visit',
        description: 'Visit with a specialist doctor',
        duration: 45,
        price: 750000,
        currency: 'IRR',
        color: '#3b82f6',
        slotInterval: 45,
        organizationId: organization.id,
      },
    }),
    prisma.service.create({
      data: {
        name: 'Lab Tests',
        description: 'Blood tests and laboratory analysis',
        duration: 15,
        price: 300000,
        currency: 'IRR',
        color: '#f59e0b',
        slotInterval: 15,
        organizationId: organization.id,
      },
    }),
    prisma.service.create({
      data: {
        name: 'Vaccination',
        description: 'Vaccination and immunization services',
        duration: 20,
        price: 250000,
        currency: 'IRR',
        color: '#ef4444',
        slotInterval: 20,
        organizationId: organization.id,
      },
    }),
    prisma.service.create({
      data: {
        name: 'Health Checkup Package',
        description: 'Comprehensive health checkup package',
        duration: 60,
        price: 1500000,
        currency: 'IRR',
        color: '#8b5cf6',
        slotInterval: 60,
        organizationId: organization.id,
      },
    }),
  ])
  
  services.forEach((service) => {
    console.log(`   Created service: ${service.name} - ${service.duration}min - ${service.price} ${service.currency}`)
  })
  console.log()

  // Create Business Hours
  console.log('🕐 Creating business hours...')
  
  const daysOfWeek = [
    { day: 0, name: 'Sunday' },
    { day: 1, name: 'Monday' },
    { day: 2, name: 'Tuesday' },
    { day: 3, name: 'Wednesday' },
    { day: 4, name: 'Thursday' },
    { day: 5, name: 'Friday' },
    { day: 6, name: 'Saturday' },
  ]

  // Friday is closed, others are open 9AM to 5PM
  for (const { day, name } of daysOfWeek) {
    if (day === 5) {
      // Friday - closed
      await prisma.businessHours.create({
        data: {
          dayOfWeek: day,
          startTime: '00:00',
          endTime: '00:00',
          isActive: false,
          organizationId: organization.id,
        },
      })
      console.log(`   ${name}: CLOSED`)
    } else {
      // Other days - open 9AM to 5PM
      await prisma.businessHours.create({
        data: {
          dayOfWeek: day,
          startTime: '09:00',
          endTime: '17:00',
          isActive: true,
          organizationId: organization.id,
        },
      })
      console.log(`   ${name}: 09:00 - 17:00`)
    }
  }
  console.log()

  // Create Sample Holidays
  console.log('🎄 Creating sample holidays...')
  
  const currentYear = new Date().getFullYear()
  const holidays = [
    { name: 'Nowruz (Persian New Year)', date: new Date(currentYear, 2, 21) },
    { name: 'Islamic Republic Day', date: new Date(currentYear, 2, 31) },
    { name: 'Yalda Night', date: new Date(currentYear, 11, 21) },
  ]

  for (const holiday of holidays) {
    await prisma.holiday.create({
      data: {
        date: holiday.date,
        name: holiday.name,
        isRecurring: true,
        organizationId: organization.id,
      },
    })
    console.log(`   ${holiday.name}: ${holiday.date.toLocaleDateString()}`)
  }
  console.log()

  // Create Sample Appointments
  console.log('📅 Creating sample appointments...')
  
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(10, 0, 0, 0)

  const appointment = await prisma.appointment.create({
    data: {
      startTime: tomorrow,
      endTime: new Date(tomorrow.getTime() + 30 * 60000),
      status: 'PENDING',
      clientName: 'John Doe',
      clientEmail: 'john.doe@example.com',
      clientPhone: '+98-912-1234567',
      notes: 'First time patient',
      organizationId: organization.id,
      serviceId: services[0].id,
      clientId: demoUser.id,
      staffId: doctor.id,
    },
  })
  console.log(`   Created appointment for ${appointment.clientName} on ${appointment.startTime.toLocaleString()}\n`)

  // Summary
  console.log('='.repeat(50))
  console.log('🎉 Database seeding completed successfully!\n')
  console.log('📋 Summary:')
  console.log(`   - Users: 3 (admin, demo, doctor, nurse)`)
  console.log(`   - Organizations: 1`)
  console.log(`   - Staff: 2`)
  console.log(`   - Services: ${services.length}`)
  console.log(`   - Business Hours: ${daysOfWeek.length}`)
  console.log(`   - Holidays: ${holidays.length}`)
  console.log(`   - Appointments: 1`)
  console.log('\n🔑 Login Credentials:')
  console.log('   Admin:  username: admin  |  password: Admin@123!')
  console.log('   Demo:   username: demo   |  password: Demo@123!')
  console.log('   Doctor: username: doctor  |  password: Doctor@123!')
  console.log('='.repeat(50))
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
