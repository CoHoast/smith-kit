import { NextResponse } from 'next/server';
import https from 'https';
import { TLSSocket } from 'tls';

export async function POST(request: Request) {
  try {
    const { url } = await request.json();
    
    if (!url) {
      return NextResponse.json({ error: 'URL required' }, { status: 400 });
    }

    // Parse URL
    let hostname: string;
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== 'https:') {
        return NextResponse.json({ 
          ssl: false, 
          error: 'Not an HTTPS URL' 
        });
      }
      hostname = parsed.hostname;
    } catch {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }

    // Check SSL certificate
    const sslInfo = await checkSSL(hostname);
    return NextResponse.json(sslInfo);
    
  } catch (error) {
    console.error('SSL check error:', error);
    return NextResponse.json({ 
      ssl: false, 
      error: 'Failed to check SSL' 
    });
  }
}

function checkSSL(hostname: string): Promise<{
  ssl: boolean;
  valid: boolean;
  issuer?: string;
  validFrom?: string;
  validTo?: string;
  daysLeft?: number;
  error?: string;
}> {
  return new Promise((resolve) => {
    const options = {
      hostname,
      port: 443,
      method: 'GET',
      rejectUnauthorized: false, // We want to inspect even invalid certs
      timeout: 10000,
    };

    const req = https.request(options, (res) => {
      const socket = res.socket as TLSSocket;
      const cert = socket.getPeerCertificate();
      
      if (!cert || Object.keys(cert).length === 0) {
        resolve({ ssl: false, valid: false, error: 'No certificate found' });
        return;
      }

      const validFrom = new Date(cert.valid_from);
      const validTo = new Date(cert.valid_to);
      const now = new Date();
      const daysLeft = Math.floor((validTo.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      const isValid = socket.authorized && validFrom <= now && validTo >= now;

      resolve({
        ssl: true,
        valid: isValid,
        issuer: cert.issuer?.O || cert.issuer?.CN || 'Unknown',
        validFrom: validFrom.toISOString(),
        validTo: validTo.toISOString(),
        daysLeft,
      });
    });

    req.on('error', (error) => {
      resolve({ 
        ssl: false, 
        valid: false, 
        error: error.message 
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ 
        ssl: false, 
        valid: false, 
        error: 'Connection timeout' 
      });
    });

    req.end();
  });
}
