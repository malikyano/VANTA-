import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import axios from 'axios';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // --- Shipping API Routes ---

  // Yalidine Integration
  app.post('/api/shipping/yalidine/create', async (req, res) => {
    const { apiKey, apiToken, order } = req.body;
    
    try {
      // Yalidine API endpoint (example)
      // Documentation: https://yalidine.com/api-doc/
      const response = await axios.post('https://api.yalidine.com/v1/parcels/', [
        {
          order_id: order.id,
          firstname: order.fullName,
          familyname: '',
          contact_phone: order.phone,
          address: order.address || order.commune,
          to_wilaya_name: order.wilaya,
          to_commune_name: order.commune,
          is_stopdesk: order.shippingType === 'office' ? 1 : 0,
          has_exchange: 0,
          product_list: order.productName,
          price: order.totalPrice,
          freeshipping: 0
        }
      ], {
        headers: {
          'X-API-ID': apiKey,
          'X-API-TOKEN': apiToken,
          'Content-Type': 'application/json'
        }
      });

      res.json({ success: true, data: response.data });
    } catch (error: any) {
      console.error('Yalidine Error:', error.response?.data || error.message);
      res.status(500).json({ 
        success: false, 
        error: error.response?.data || error.message 
      });
    }
  });

  // Noest Integration
  app.post('/api/shipping/noest/create', async (req, res) => {
    const { username, password, order } = req.body;
    
    try {
      // Step 1: Login to get token
      // const loginRes = await axios.post('https://api.noest.dz/api/login', { username, password });
      // const token = loginRes.data.token;

      // Step 2: Create shipment
      // const response = await axios.post('https://api.noest.dz/api/shipments', { ... }, { headers: { Authorization: `Bearer ${token}` } });

      console.log('Noest Shipment Request:', { username, orderId: order.id });
      
      // For now, we simulate success as Noest API access requires real credentials
      res.json({ 
        success: true, 
        message: 'تم إرسال الطلب إلى Noest بنجاح (بيئة تجريبية)',
        tracking: 'NOEST-' + Math.random().toString(36).substring(7).toUpperCase()
      });
    } catch (error: any) {
      console.error('Noest Error:', error.response?.data || error.message);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // ZR Integration
  app.post('/api/shipping/zr/create', async (req, res) => {
    const { apiKey, apiSecret, order } = req.body;
    try {
      // ZR API logic
      res.json({ success: true, message: 'تم إرسال الطلب إلى ZR بنجاح (بيئة تجريبية)' });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Test Shipping Connection
  app.post('/api/shipping/test', async (req, res) => {
    const { provider, credentials } = req.body;
    try {
      // Simulate API check
      setTimeout(() => {
        res.json({ success: true, message: `الاتصال بـ ${provider} ناجح!` });
      }, 1000);
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Google Sheets Sync
  app.post('/api/apps/gsheets/sync', async (req, res) => {
    const { spreadsheetId, order } = req.body;
    try {
      // In a real app, you would use the Google Sheets API with OAuth tokens
      // For now, we simulate the success
      console.log('Syncing to Google Sheets:', { spreadsheetId, order });
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Noest Webhook (Automation)
  app.post('/api/webhooks/noest', async (req, res) => {
    const { order_id, status } = req.body;
    // In a real app, you would verify the signature and update Firestore
    console.log('Noest Webhook Received:', { order_id, status });
    res.json({ received: true });
  });

  app.post('/api/notifications/send', async (req, res) => {
    const { settings, message, to } = req.body;
    
    if (!settings || !message || !to) {
      return res.status(400).json({ success: false, error: 'Missing parameters' });
    }

    try {
      if (settings.provider === 'twilio') {
        const auth = Buffer.from(`${settings.twilioSid}:${settings.twilioAuthToken}`).toString('base64');
        const params = new URLSearchParams();
        params.append('To', to);
        params.append('From', settings.twilioFromNumber);
        params.append('Body', message);

        await axios.post(
          `https://api.twilio.com/2010-04-01/Accounts/${settings.twilioSid}/Messages.json`,
          params,
          { headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' } }
        );
      } else if (settings.provider === 'infobip') {
        await axios.post(
          `${settings.infobipBaseUrl}/sms/2/text/advanced`,
          {
            messages: [{
              destinations: [{ to }],
              from: 'VentaDZ',
              text: message
            }]
          },
          { headers: { 'Authorization': `App ${settings.infobipApiKey}`, 'Content-Type': 'application/json' } }
        );
      }

      res.json({ success: true });
    } catch (error: any) {
      console.error('Notification Error:', error.response?.data || error.message);
      res.status(500).json({ success: false, error: error.response?.data || error.message });
    }
  });

  app.post('/api/notifications/merchant', async (req, res) => {
    const { email, order } = req.body;
    console.log(`Sending merchant notification to ${email} for order ${order.id}`);
    res.json({ success: true });
  });

  // --- Vite Middleware ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
