import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    if (!data.results) {
      return NextResponse.json({ error: 'Results data is required' }, { status: 400 });
    }

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    
    const page = await browser.newPage();
    
    // Create a beautiful HTML string for the advanced PDF report.
    const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Analysis Report: ${data.results.url}</title>
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; margin: 0; padding: 40px; }
        .header { text-align: center; border-bottom: 2px solid #6366f1; padding-bottom: 20px; margin-bottom: 30px; }
        .header h1 { color: #4f46e5; margin: 0; font-size: 28px; }
        .header p { color: #6b7280; font-size: 14px; margin-top: 5px; }
        
        .score-box { background: #f3f4f6; border-radius: 8px; padding: 15px; margin-bottom: 20px; text-align: center; }
        .score-box h3 { margin: 0; font-size: 16px; color: #4b5563; }
        .score-box .score { font-size: 32px; font-weight: bold; margin-top: 5px; color: ${data.results.security?.score > 70 ? 'green' : data.results.security?.score > 40 ? 'orange' : 'red'}; }

        .section { margin-bottom: 25px; padding: 20px; background: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb; }
        .section-title { font-size: 18px; color: #111827; margin-top: 0; border-bottom: 1px solid #d1d5db; padding-bottom: 10px; margin-bottom: 15px; }
        .row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; border-bottom: 1px dashed #e5e7eb; padding-bottom: 5px;}
        .row:last-child { border-bottom: none; }
        .row .label { font-weight: bold; color: #4b5563; }
        .row .value { color: #1f2937; }
        .tags { display: flex; flex-wrap: wrap; gap: 8px; }
        .tag { background: #e0e7ff; color: #4338ca; padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 500; }
        .image-container { text-align: center; margin-top: 10px; }
        .image-container img { max-width: 100%; border-radius: 8px; border: 1px solid #e5e7eb; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
        .text-block { background: #f9fafb; padding: 12px; border-radius: 6px; font-size: 13px; color: #374151; white-space: pre-wrap; margin-top: 5px; border-left: 4px solid #3b82f6;}
        .table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
        .table th { background: #1e3a8a; color: white; padding: 8px; text-align: left; }
        .table td { padding: 8px; border-bottom: 1px solid #e5e7eb; }
        .footer { text-align: center; font-size: 12px; color: #9ca3af; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px; }
      </style>
    </head>
    <body>
      <div class="header">
        ${data.reportData?.clientLogo ? `<img src="${data.reportData.clientLogo}" alt="Client Logo" style="max-height: 60px; margin-bottom: 10px;" />` : ''}
        <h1>Advanced Agency Report: ${data.results.url}</h1>
        <p>Generado el ${new Date().toLocaleString()}</p>
      </div>

      <div class="section">
        <h2 class="section-title">1. Resumen Técnico</h2>
        <div class="row"><span class="label">Plugins Revisados</span><span class="value">${data.reportData?.totalPluginsRevisados || 0}</span></div>
        <div class="row"><span class="label">Plugins Actualizados</span><span class="value">${data.reportData?.pluginsActualizados || 0}</span></div>
        <div class="row"><span class="label">Riesgos Críticos</span><span class="value">${data.reportData?.riesgosCriticos || 0}</span></div>
        <div class="row"><span class="label">Velocidad de Carga</span><span class="value">${data.reportData?.speedScore || data.results.speed || 'N/A'}</span></div>
        ${data.reportData?.performanceActions ? `<div class="text-block" style="margin-top:10px;">${data.reportData.performanceActions}</div>` : ''}
      </div>

      ${data.reportData?.plugins && data.reportData.plugins.length > 0 ? `
      <div class="section">
        <h2 class="section-title">Actualización de Componentes / Plugins</h2>
        <table class="table">
          <thead><tr><th>Plugin</th><th>Versión Anterior</th><th>Versión Actual</th><th>Impacto</th></tr></thead>
          <tbody>
            ${data.reportData.plugins.filter((p:any)=>p.plugin).map((p:any) => `<tr><td>${p.plugin}</td><td>${p.versionPrev}</td><td style="color:green;font-weight:bold;">${p.versionNew}</td><td>${p.impact}</td></tr>`).join('')}
          </tbody>
        </table>
      </div>
      ` : ''}

      <div class="section">
        <h2 class="section-title">2. Seguridad y Respaldo</h2>
        <div class="row"><span class="label">Escaneo de Malware</span><span class="value">${data.reportData?.malwareScan || 'N/A'}</span></div>
        <div class="row"><span class="label">Backups Generados</span><span class="value">${data.reportData?.backups || 'N/A'}</span></div>
        <div class="row"><span class="label">Certificado SSL</span><span class="value" style="${data.reportData?.sslStatus?.toLowerCase().includes('vigente') ? 'color:green' : 'color:red'}">${data.reportData?.sslStatus || 'N/A'}</span></div>
      </div>

      ${data.reportData?.elementsStatus && data.reportData.elementsStatus.length > 0 ? `
      <div class="section">
        <h2 class="section-title">Elementos de Conversión Analizados</h2>
        <table class="table">
          <thead><tr><th>Elemento</th><th>Estado</th><th>Notas / Destino</th></tr></thead>
          <tbody>
            ${data.reportData.elementsStatus.filter((e:any)=>e.element).map((e:any) => `<tr><td>${e.element}</td><td>${e.status ? '<span style="color:green">✅ OK</span>' : '<span style="color:red">❌ Fallo</span>'}</td><td>${e.notes}</td></tr>`).join('')}
          </tbody>
        </table>
      </div>
      ` : ''}

      <div class="section">
        <h2 class="section-title">3. Rendimiento SEO</h2>
        <div class="row"><span class="label">Título SEO</span><span class="value">${data.reportData?.seoTitle || 'N/A'}</span></div>
        <div class="row"><span class="label">Descripción SEO</span><span class="value">${data.reportData?.seoDesc || 'N/A'}</span></div>
        
        <div style="margin-top:20px;">
          <strong>Evolución Orgánica (Mes vs Mes)</strong>
          <table class="table" style="margin-top:10px;">
            <thead><tr><th>Métrica</th><th>Mes Anterior</th><th>Mes Actual</th></tr></thead>
            <tbody>
              <tr><td>Impresiones</td><td>${data.reportData?.evoPrev?.impressions || '-'}</td><td style="font-weight:bold">${data.reportData?.evoCurr?.impressions || '-'}</td></tr>
              <tr><td>Clics</td><td>${data.reportData?.evoPrev?.clicks || '-'}</td><td style="font-weight:bold">${data.reportData?.evoCurr?.clicks || '-'}</td></tr>
              <tr><td>CTR</td><td>${data.reportData?.evoPrev?.ctr || '-'}</td><td style="font-weight:bold">${data.reportData?.evoCurr?.ctr || '-'}</td></tr>
              <tr><td>Posición Media</td><td>${data.reportData?.evoPrev?.position || '-'}</td><td style="font-weight:bold">${data.reportData?.evoCurr?.position || '-'}</td></tr>
            </tbody>
          </table>
        </div>
        ${data.reportData?.conclusionOrganica ? `<div class="text-block" style="margin-top:10px; border-left-color:#10b981;"><b>Conclusión:</b> ${data.reportData.conclusionOrganica}</div>` : ''}
      </div>

      ${data.reportData?.horasInvertidas && data.reportData.horasInvertidas.filter((h:any) => h.task).length > 0 ? `
      <div class="section" style="page-break-inside: avoid;">
        <h2 class="section-title">4. Ajustes Realizados y Horas Invertidas</h2>
        <p style="font-size:13px; margin:0 0 10px 0; font-weight:bold">Total Horas Mes: ${data.reportData?.totalHoras || 0}</p>
        <table class="table">
          <thead>
            <tr><th>Fecha</th><th>Responsable</th><th>Horas</th><th>Tarea</th><th>Descripción</th></tr>
          </thead>
          <tbody>
            ${data.reportData.horasInvertidas.filter((h:any) => h.task).map((h:any) => `<tr><td>${h.date}</td><td>${h.responsable}</td><td>${h.hours}</td><td>${h.task}</td><td>${h.desc}</td></tr>`).join('')}
          </tbody>
        </table>
      </div>
      ` : ''}

      ${data.reportData?.recomendaciones && data.reportData.recomendaciones.filter((r:any)=>r.text).length > 0 ? `
      <div class="section" style="page-break-inside: avoid;">
        <h2 class="section-title">5. Recomendaciones Estratégicas (Próximo Mes)</h2>
        <ul style="font-size:13px; padding-left:20px; color:#111827; line-height: 1.6;">
          ${data.reportData.recomendaciones.filter((r:any)=>r.text).map((r:any) => `<li>${r.text}</li>`).join('')}
        </ul>
      </div>
      ` : ''}

      ${(data.reportData?.imgSearchConsole || data.reportData?.imgGooglePos || data.reportData?.imgHeatMap) ? `
      <div class="section" style="break-before: page; page-break-before: always;">
        <h2 class="section-title">6. Evidencias Visuales</h2>
        
        ${data.reportData?.imgSearchConsole ? `
        <div style="margin-bottom: 20px;">
          <div class="label" style="font-size:14px; font-weight:bold; margin-bottom:5px;">🔍 Análisis / Home</div>
          <div class="image-container">
            <img src="${data.reportData.imgSearchConsole}" alt="Home Screenshot" />
          </div>
        </div>
        ` : ''}

        ${data.reportData?.imgGooglePos ? `
        <div style="margin-bottom: 20px;">
          <div class="label" style="font-size:14px; font-weight:bold; margin-bottom:5px;">🌐 Posicionamiento en Buscadores</div>
          <div class="image-container">
            <img src="${data.reportData.imgGooglePos}" alt="Google Search" />
          </div>
        </div>
        ` : ''}

        ${data.reportData?.imgHeatMap ? `
        <div style="margin-bottom: 20px;">
          <div class="label" style="font-size:14px; font-weight:bold; margin-bottom:5px;">🔥 Mapa de Calor</div>
          <div class="image-container">
            <img src="${data.reportData.imgHeatMap}" alt="Heatmap" />
          </div>
        </div>
        ` : ''}
      </div>
      ` : ''}

      <div class="footer">
        Reporte generado vía Dashboard Híbrido Automático (Clon Estilo A4R) | Site Analyzer Pro
      </div>
    </body>
    </html>
    `;

    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
    // Generate PDF buffer
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' },
    });

    await browser.close();

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="analysis-report.pdf"'
      }
    });

  } catch (error: any) {
    console.error('PDF Generation Error:', error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}
