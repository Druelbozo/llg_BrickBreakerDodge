/**
 * Simple CORS Proxy Server
 * Run with: node cors-proxy.js
 * 
 * This proxy server allows your local frontend to make API calls
 * without CORS issues by forwarding requests to the actual API.
 */

const http = require('http');
const https = require('https');
const { URL } = require('url');

// Allow port to be specified via command-line argument or environment variable
// Defaults to 3001 if not specified
const PORT = process.argv[2] ? parseInt(process.argv[2], 10) : (process.env.PORT ? parseInt(process.env.PORT, 10) : 3001);

// API Configuration - Update config.js or set API_BASE_URL environment variable
const API_BASE_URL = process.env.API_BASE_URL || 'https://kmz1ixsmv6.execute-api.us-east-1.amazonaws.com/staging';

const TARGET_API_BASE_URL = API_BASE_URL;

/** Path prefixes → forward to Novalink (SDK uses hardcoded https origins; local client rewrites to these paths). */
const NOVALINK_PROD_PREFIX = '/__novalink-prod__';
const NOVALINK_STAGE_PREFIX = '/__novalink-stage__';
const NOVALINK_PROD_ORIGIN = 'https://api.novalink.gg';
const NOVALINK_STAGE_ORIGIN = 'https://stageapi.novalink.gg';

console.log('📋 API Base URL: ' + TARGET_API_BASE_URL);
console.log('💡 Novalink: ' + NOVALINK_PROD_PREFIX + ' → ' + NOVALINK_PROD_ORIGIN + ', ' + NOVALINK_STAGE_PREFIX + ' → ' + NOVALINK_STAGE_ORIGIN);
console.log('💡 To update: Edit config.js or set API_BASE_URL environment variable\n');

function mergeCorsHeaders(upstreamHeaders) {
    const out = { ...upstreamHeaders };
    out['access-control-allow-origin'] = '*';
    out['access-control-allow-methods'] = 'GET, POST, PUT, DELETE, PATCH, OPTIONS';
    out['access-control-allow-headers'] =
        upstreamHeaders['access-control-allow-headers'] ||
        'Content-Type, Authorization, X-Requested-With, Accept';
    return out;
}

function resolveTargetUrl(reqUrl) {
    const q = reqUrl.indexOf('?');
    const pathname = q >= 0 ? reqUrl.slice(0, q) : reqUrl;
    const search = q >= 0 ? reqUrl.slice(q) : '';

    if (pathname.startsWith(NOVALINK_PROD_PREFIX)) {
        const rest = pathname.slice(NOVALINK_PROD_PREFIX.length) || '/';
        return NOVALINK_PROD_ORIGIN + rest + search;
    }
    if (pathname.startsWith(NOVALINK_STAGE_PREFIX)) {
        const rest = pathname.slice(NOVALINK_STAGE_PREFIX.length) || '/';
        return NOVALINK_STAGE_ORIGIN + rest + search;
    }

    const targetPath = reqUrl.startsWith('/') ? reqUrl.slice(1) : reqUrl;
    return `${TARGET_API_BASE_URL}/${targetPath}`;
}

const server = http.createServer((req, res) => {
    // Enable CORS for all requests
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');

    // Handle preflight OPTIONS requests
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    const targetUrl = resolveTargetUrl(req.url);

    console.log(`[CORS Proxy] ${req.method} ${targetUrl}`);

    // Parse the target URL
    const url = new URL(targetUrl);
    const options = {
        hostname: url.hostname,
        port: url.port || (url.protocol === 'https:' ? 443 : 80),
        path: url.pathname + url.search,
        method: req.method,
        headers: {
            ...req.headers,
            host: url.hostname
        }
    };

    // Choose the appropriate module (http or https)
    const httpModule = url.protocol === 'https:' ? https : http;

    // Forward the request
    const proxyReq = httpModule.request(options, (proxyRes) => {
        const headers = mergeCorsHeaders(proxyRes.headers);
        res.writeHead(proxyRes.statusCode, headers);
        proxyRes.pipe(res);
    });

    proxyReq.on('error', (error) => {
        console.error(`[CORS Proxy Error]`, error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Proxy error: ' + error.message }));
    });

    // Forward the request body if present
    if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
        req.pipe(proxyReq);
    } else {
        proxyReq.end();
    }
});

server.listen(PORT, () => {
    console.log(`🚀 CORS Proxy Server running on http://localhost:${PORT}`);
    console.log(`📡 Proxying to: ${TARGET_API_BASE_URL}`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
    console.log('Shutting down CORS proxy server...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

