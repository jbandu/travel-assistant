/**
 * Script to check and diagnose RLS (Row Level Security) issues
 * Run with: tsx scripts/check-rls.ts
 */

import { prisma } from '../lib/prisma';

async function checkRLS() {
  console.log('🔍 Checking RLS configuration...\n');

  try {
    // Test 1: Try to query users table directly
    console.log('Test 1: Querying users table...');
    const users = await prisma.$queryRaw`
      SELECT * FROM users LIMIT 1;
    `;
    console.log('✅ Users table query successful');
    console.log('Users found:', users);

    // Test 2: Check if RLS is enabled on users table
    console.log('\nTest 2: Checking RLS status on users table...');
    const rlsStatus = await prisma.$queryRaw`
      SELECT tablename, rowsecurity
      FROM pg_tables
      WHERE schemaname = 'public'
      AND tablename = 'users';
    `;
    console.log('RLS Status:', rlsStatus);

    // Test 3: Check existing policies
    console.log('\nTest 3: Checking RLS policies...');
    const policies = await prisma.$queryRaw`
      SELECT
        schemaname,
        tablename,
        policyname,
        permissive,
        roles,
        cmd,
        qual,
        with_check
      FROM pg_policies
      WHERE tablename = 'users';
    `;
    console.log('Policies:', policies);

    // Test 4: Try login-like query
    console.log('\nTest 4: Simulating login query...');
    const testEmail = 'admin@example.com'; // Change to actual test email
    const user = await prisma.user.findUnique({
      where: { email: testEmail }
    });
    console.log('✅ Login query successful');
    console.log('User found:', user ? 'Yes' : 'No');

  } catch (error) {
    console.error('❌ Error:', error);
    console.error('\nThis error suggests RLS might be blocking queries.');
    console.error('Run the fix script to resolve this issue.');
  } finally {
    await prisma.$disconnect();
  }
}

checkRLS();
