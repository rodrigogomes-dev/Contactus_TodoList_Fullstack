<?php

return [
    'allowed_origins' => [
        'http://localhost:4200',      // Angular dev
        'http://127.0.0.1:4200',      // Fallback localhost
        'http://localhost:3000',      // Vite dev port
        'http://127.0.0.1:3000',
        // 'https://dominio.com',    // Futuro domínio de produção
    ],

    'allowed_methods' => ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    'allowed_headers' => ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
    'allow_credentials' => true,     // Para cookies/tokens
    'max_age' => 3600,               // 1 hora - cache de preflight
];