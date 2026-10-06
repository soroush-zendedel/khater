import { cpSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';

const projectRoot = fileURLToPath(new URL('.', import.meta.url));

function copyRuntimeData() {
  return {
    name: 'copy-runtime-data',
    writeBundle(outputOptions) {
      const outputDirectory = outputOptions.dir ?? resolve(projectRoot, 'dist');
      const runtimeDirectories = ['fonts', 'js'];
      const runtimeFiles = ['Persian_Font_Design_Workbook.xlsx'];

      for (const directory of runtimeDirectories) {
        cpSync(resolve(projectRoot, directory), resolve(outputDirectory, directory), {
          recursive: true,
        });
      }

      mkdirSync(outputDirectory, { recursive: true });
      for (const file of runtimeFiles) {
        cpSync(resolve(projectRoot, file), resolve(outputDirectory, file));
      }
    },
  };
}

export default defineConfig({
  base: './',
  plugins: [copyRuntimeData()],
  build: {
    rollupOptions: {
      input: {
        landing: resolve(projectRoot, 'index.html'),
        app: resolve(projectRoot, 'app.html'),
      },
    },
  },
});
