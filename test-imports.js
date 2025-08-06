console.log('Testing basic imports...');

try {
  console.log('Testing Prisma import...');
  const { PrismaClient } = require('@prisma/client');
  console.log('✓ Prisma imported successfully');
  
  console.log('Testing Next.js imports...');
  const next = require('next');
  console.log('✓ Next.js imported successfully');
  
  console.log('Testing React imports...');
  const react = require('react');
  console.log('✓ React imported successfully');
  
  console.log('Testing Socket.io imports...');
  const socketio = require('socket.io');
  console.log('✓ Socket.io imported successfully');
  
  console.log('All basic imports successful!');
} catch (error) {
  console.error('Import test failed:', error);
}