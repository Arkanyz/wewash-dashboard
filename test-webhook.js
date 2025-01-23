const fetch = require('node-fetch');

const data = {
  "type": "call.transcript.ready",
  "id": "call_123456",
  "from": "+33123456789",
  "to": "your_service_number",
  "startTime": "2025-01-18T19:43:10+01:00",
  "endTime": "2025-01-18T19:45:10+01:00",
  "duration": 120,
  "status": "completed",
  "direction": "inbound",
  "transcript": "Bonjour, je vous appelle car la machine numéro 5 à la laverie de Paris ne démarre pas. J'ai inséré 8 euros mais rien ne se passe.",
  "recordingUrl": "https://api.rounded.com/recordings/123456"
};

fetch('https://wewash-dashboard-git-master-arkanyzs-projects.vercel.app/api/webhooks/rounded', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-rounded-signature': 'test-signature'
  },
  body: JSON.stringify(data)
})
.then(response => response.json())
.then(data => console.log('Success:', data))
.catch(error => console.error('Error:', error));
