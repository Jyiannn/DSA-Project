import { copyFileSync, cpSync, rmSync } from 'node:fs';

// This folder is both the Vite source root and Apache's doc root, so the build must be installed here.
rmSync('assets', { recursive: true, force: true });
copyFileSync('dist/index.html', 'index.html');
copyFileSync('dist/.htaccess', '.htaccess');
cpSync('dist/assets', 'assets', { recursive: true });
