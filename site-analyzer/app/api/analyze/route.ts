import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Set max execution time if deploying to Vercel/etc.

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Launch puppeteer
    const browser = await puppeteer.launch({
      headless: true, // run in the background
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    
    const page = await browser.newPage();
    // Emulate a realistic user agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    // Go to the URL and wait for DOM and initial network requests
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    
    const html = await page.content();
    const $ = cheerio.load(html);
    
    // 1. CTA & Buttons Analysis
    const buttons = $('button');
    const links = $('a[href]');
    
    let workingLinks = 0;
    const brokenLinkUrls: string[] = [];
    let totalLinks = links.length;
    
    links.each((_, el) => {
      const href = $(el).attr('href');
      if (href && href !== '#' && !href.startsWith('javascript:')) {
        workingLinks++;
      } else if (href && (href === '#' || href.startsWith('javascript:'))) {
        // Not technically broken but not crawlable useful links
      } else {
        brokenLinkUrls.push(href || 'empty-href');
      }
    });

    const brokenLinks = totalLinks - workingLinks - brokenLinkUrls.length; // accounting for hash links
    // Si queremos ser estrictos:
    // working = reales. broken = vacios o mal formados.

    // 2. Forms & Security (reCAPTCHA & Thank You Pages)
    const forms = $('form');
    const hasRecaptcha = html.includes('g-recaptcha') || html.includes('recaptcha/api.js') || html.includes('\'.recaptcha-v3\'') || $('iframe[src*="recaptcha"]').length > 0;
    
    const formDetails: any[] = [];
    forms.each((_, el) => {
      const action = $(el).attr('action') || 'none';
      const method = $(el).attr('method') || 'GET';
      const hasThankYouPage = action.toLowerCase().includes('gracias') || action.toLowerCase().includes('success') || action.toLowerCase().includes('thank-you') || action.toLowerCase().includes('completado');

      formDetails.push({
        action,
        method,
        hasThankYouPage,
        inputs: $(el).find('input').length,
      });
    });

    // 3. Vulnerabilidades (Security Headers)
    const response = await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    const headers = response ? response.headers() : {};
    
    const vulnerabilities = {
      missingHSTS: !headers['strict-transport-security'],
      missingCSP: !headers['content-security-policy'],
      missingXFrame: !headers['x-frame-options'],
      missingContentTypeOptions: !headers['x-content-type-options'],
      serverExposed: !!headers['server'],
      usesHttp: url.startsWith('http://')
    };
    
    // Calcular "Security Score" basado en las vulnerabilidades pasivas
    let securityScore = 100;
    if (vulnerabilities.usesHttp) securityScore -= 40;
    if (vulnerabilities.missingHSTS) securityScore -= 10;
    if (vulnerabilities.missingCSP) securityScore -= 10;
    if (vulnerabilities.missingXFrame) securityScore -= 10;
    if (vulnerabilities.missingContentTypeOptions) securityScore -= 5;
    if (vulnerabilities.serverExposed) securityScore -= 5;

    // 4. SEO Data & Open Graph
    const title = $('title').text() || '';
    const description = $('meta[name="description"]').attr('content') || '';
    
    const ogTitle = $('meta[property="og:title"]').attr('content') || title;
    const ogDescription = $('meta[property="og:description"]').attr('content') || description;
    const ogImage = $('meta[property="og:image"]').attr('content') || '';

    // 5. Plugins / Tech Stack / Analytics / Heatmaps / Security
    const plugins = [];
    // Core Tech
    if (html.includes('wp-content')) plugins.push('WordPress');
    if ($('script[src*="react"]').length > 0 || html.includes('data-reactroot')) plugins.push('React');
    if (html.includes('_next/static')) plugins.push('Next.js');
    if (html.includes('cdn.shopify.com')) plugins.push('Shopify');
    
    // Analytics & Heatmaps
    if (html.includes('GoogleAnalyticsObject') || html.includes('gtag(') || html.includes('google-analytics.com')) plugins.push('Google Analytics (Visitas)');
    if (html.includes('fbevents.js')) plugins.push('Meta Pixel (Visitas)');
    if (html.includes('hotjar.com') || html.includes('hj(')) plugins.push('Hotjar (Mapa de Calor)');
    if (html.includes('crazyegg.com')) plugins.push('CrazyEgg (Mapa de Calor)');
    if (html.includes('matomo.js') || html.includes('piwik')) plugins.push('Matomo Analytics');
    if (html.includes('clarity.ms')) plugins.push('Microsoft Clarity (Mapa de Calor)');

    // Security & Backup Plugins
    if (html.includes('wordfence')) plugins.push('Wordfence Security');
    if (headers['server']?.toLowerCase().includes('cloudflare') || headers['cf-ray']) plugins.push('Cloudflare (WAF/CDN)');
    if (html.includes('sucuri')) plugins.push('Sucuri Security');
    if (html.includes('updraftplus') || html.includes('updraft_')) plugins.push('UpdraftPlus (Backup)');
    if (html.includes('ithemes-security')) plugins.push('iThemes Security');

    // 6. Page Speed
    const performanceTiming: string = await page.evaluate(() => {
      try {
        const [nav] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
        if (nav && nav.loadEventEnd > 0) {
          return (nav.loadEventEnd / 1000).toFixed(2) + 's';
        }
        // Fallback for when loadEvent is not finished yet
        return ((performance.now() ?? 0) / 1000).toFixed(2) + 's (Aprox)';
      } catch (e) {
        return 'Calculando...';
      }
    });

    // --- PHASE 7: AUTOMATIC SCREENSHOTS ---
    let websiteScreenshot = null;
    try {
      const buf = await page.screenshot({ type: 'jpeg', quality: 60 });
      websiteScreenshot = `data:image/jpeg;base64,${buf.toString('base64')}`;
    } catch(e) { console.error('Website screenshot error'); }

    let googleScreenshot = null;
    try {
      const googlePage = await browser.newPage();
      await googlePage.goto(`https://www.google.com/search?q=site:${new URL(url).hostname}&hl=es`, { waitUntil: 'domcontentloaded', timeout: 10000 });
      await new Promise(r => setTimeout(r, 1000));
      const gBuf = await googlePage.screenshot({ type: 'jpeg', quality: 50 });
      googleScreenshot = `data:image/jpeg;base64,${gBuf.toString('base64')}`;
      await googlePage.close();
    } catch(e) { console.error('Google screenshot error'); }

    await browser.close();

    // 7. Sitemap Check
    let hasSitemap = false;
    try {
      const parsedUrl = new URL(url);
      const sitemapUrl = `${parsedUrl.protocol}//${parsedUrl.host}/sitemap.xml`;
      const sitemapRes = await fetch(sitemapUrl, { method: 'HEAD' });
      if (sitemapRes.ok) hasSitemap = true;
    } catch(e) {}

    const result = {
      url: url,
      speed: performanceTiming,
      ctas: { total: totalLinks + buttons.length, working: workingLinks + buttons.length, broken: brokenLinks, brokenUrls: brokenLinkUrls },
      forms: { count: forms.length, details: formDetails },
      security: { 
        hasRecaptcha, 
        score: securityScore,
        vulnerabilities
      },
      seo: { title, description, ogTitle, ogDescription, ogImage, hasSitemap },
      plugins: plugins.length > 0 ? plugins : ['Standard HTML'],
      screenshots: {
        website: websiteScreenshot,
        google: googleScreenshot
      }
    };

    return NextResponse.json(result);

  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to analyze URL. It might be unreachable.', details: error.message }, { status: 500 });
  }
}
