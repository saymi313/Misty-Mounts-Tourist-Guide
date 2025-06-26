const fetch = require('node-fetch');

async function testLogin() {
  try {
    console.log('Testing login functionality...');
    
    const response = await fetch('http://localhost:5000/api/user/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        email: 'test@example.com', 
        password: 'password123' 
      }),
    });

    console.log('Response status:', response.status);
    const data = await response.json();
    console.log('Response data:', data);
    
    if (response.ok) {
      console.log('✅ Login test successful!');
    } else {
      console.log('❌ Login test failed:', data.message);
    }
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

testLogin(); 