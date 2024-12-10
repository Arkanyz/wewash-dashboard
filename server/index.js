import express from 'express';
import cors from 'cors';
import { chromium } from 'playwright';

const app = express();
app.use(cors());
app.use(express.json());

// Route simple pour tester que le serveur fonctionne
app.get('/', (req, res) => {
  res.json({ message: 'Server is running' });
});

app.post('/login', async (req, res) => {
  try {
    console.log('Received login request:', req.body);
    
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Username and password are required' 
      });
    }

    const browser = await chromium.launch({ 
      headless: false,
      args: ['--no-sandbox']
    });
    
    const context = await browser.newContext();
    const page = await context.newPage();

    console.log('Navigating to We-Line...');
    await page.goto('https://weline.fr/login');
    
    // Take screenshot before login
    await page.screenshot({ path: 'before-login.png' });
    
    console.log('Filling login form...');
    await page.fill('input[type="email"]', username);
    await page.fill('input[type="password"]', password);
    
    console.log('Submitting form...');
    await page.click('button[type="submit"]');
    
    // Wait for navigation and take screenshot after login
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'after-login.png' });
    
    // Check if login was successful
    const errorElement = await page.$('text="Identifiants incorrects"');
    if (errorElement) {
      await browser.close();
      return res.status(401).json({ 
        success: false, 
        error: 'Identifiants incorrects' 
      });
    }

    await browser.close();
    console.log('Login successful');
    
    res.json({ 
      success: true, 
      message: 'Login successful' 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error: ' + error.message 
    });
  }
});

const port = 3003;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log('Ready to handle login requests');
});
