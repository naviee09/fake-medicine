import fetch from 'node-fetch';

(async () => {
  try {
    const response = await fetch('http://localhost:4000/api/medicine/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Aspirin' }),
    });
    const text = await response.text();
    console.log('status', response.status, text);
  } catch (error) {
    console.error('error', error);
  }
})();