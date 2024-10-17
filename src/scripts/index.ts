// Check if window.DEVELOPMENT is set to true to enable live reloading.
// This variable is defined via he esbuild.config.mjs file.
// For more details, see the documentation: https://esbuild.github.io/api/#live-reload.
if ((<any>window).DEVELOPMENT) {
    new EventSource('/esbuild').addEventListener('change', () => location.reload());
}

import './ui/filter';
import './ui/creation';
