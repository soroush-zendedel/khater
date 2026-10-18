import { loadClassicScripts } from './script-loader.js';

const compatibilityScripts = [
  '../js/xlsx.full.min.js',
  '../js/opentype.min.js',
  '../js/app/state.js',
  '../js/app/display-settings.js',
  '../js/app/glyph-editor.js',
  '../js/app/exports.js',
  '../js/app/font-manager.js',
  '../js/app/workbook.js',
  '../js/app/initialize.js',
].map((path) => new URL(path, import.meta.url).href);

try {
  await loadClassicScripts(compatibilityScripts);
} catch (error) {
  console.error('KhAter could not start.', error);
}
