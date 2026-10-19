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
      const runtimeFiles = ['Persian_Font_Design_Workbook.xlsx', 'sitemap.xml', 'robots.txt'];

      for (const directory of runtimeDirectories) {
        cpSync(resolve(projectRoot, directory), resolve(outputDirectory, directory), {
          recursive: true,
        });
      }

      cpSync(resolve(projectRoot, 'favicon'), resolve(outputDirectory, 'favicon'), {
        recursive: true,
        filter: (source) => source !== resolve(projectRoot, 'favicon', 'site.webmanifest'),
      });

      mkdirSync(outputDirectory, { recursive: true });
      for (const file of runtimeFiles) {
        cpSync(resolve(projectRoot, file), resolve(outputDirectory, file));
      }
    },
  };
}

const siteRootUrl = 'https://soroush-zendedel.github.io/';
const projectUrl = 'https://soroush-zendedel.github.io/khater/';

function structuredNavigation() {
  const pages = {
    'about.html': {
      language: 'fa',
      currentLabel: 'دربارهٔ خط‌ِر',
      rootLabel: 'سروش زنده‌دل',
      homeLabel: 'خط‌ِر',
      homePath: projectUrl,
      currentUrl: `${projectUrl}about.html`,
    },
    'en/about.html': {
      language: 'en',
      currentLabel: 'About KhAter',
      rootLabel: 'Soroush Zendedel',
      homeLabel: 'KhAter',
      homePath: `${projectUrl}en/`,
      currentUrl: `${projectUrl}en/about.html`,
    },
  };

  return {
    name: 'shared-structured-navigation',
    transformIndexHtml: {
      order: 'post',
      handler(html, context) {
        const pagePath = context.filename.replaceAll('\\', '/');
        const page = pages[pagePath.endsWith('/en/about.html') ? 'en/about.html' : pagePath.endsWith('/about.html') ? 'about.html' : ''];
        html = html.replace(/<script\s+type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi, '');
        if (!page) return html;

        const items = [
          { name: page.rootLabel, url: siteRootUrl },
          { name: page.homeLabel, url: page.homePath },
          { name: page.currentLabel, url: page.currentUrl },
        ];
        const jsonLd = {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            ...(index < items.length - 1 ? { item: item.url } : {}),
          })),
        };
        const breadcrumb = `<nav class="seo-breadcrumb public-container" aria-label="${page.language === 'fa' ? 'مسیر صفحه' : 'Breadcrumb'}" dir="${page.language === 'fa' ? 'rtl' : 'ltr'}"><ol>${items.map((item, index) => `<li>${index < items.length - 1 ? `<a href="${item.url}">${item.name}</a>` : `<span aria-current="page">${item.name}</span>`}</li>`).join('')}</ol></nav><script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`;
        return html.replace('</main>', `</main>\n  ${breadcrumb}`);
      },
    },
  };
}

export default defineConfig({
  base: './',
  plugins: [structuredNavigation(), copyRuntimeData()],
  build: {
    rollupOptions: {
      input: {
        landing: resolve(projectRoot, 'index.html'),
        about: resolve(projectRoot, 'about.html'),
        englishLanding: resolve(projectRoot, 'en/index.html'),
        englishAbout: resolve(projectRoot, 'en/about.html'),
        app: resolve(projectRoot, 'app.html'),
      },
    },
  },
});
