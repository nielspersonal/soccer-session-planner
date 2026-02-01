import { Injectable } from '@nestjs/common';
import { chromium } from 'playwright';
import { SessionsService } from '../sessions/sessions.service';

@Injectable()
export class ExportService {
  constructor(private sessionsService: SessionsService) {}

  async generateSessionPDF(sessionId: number, userId: number): Promise<Buffer> {
    const session = await this.sessionsService.findOne(sessionId, userId);

    const html = this.generateSessionHTML(session);

    const browser = await chromium.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle' });

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm',
      },
    });

    await browser.close();

    return Buffer.from(pdf);
  }

  generateSessionHTML(session: any): string {
    const drillsHTML = (session.sessionDrills && session.sessionDrills.length > 0)
      ? session.sessionDrills
          .map((sd: any) => {
            const duration = sd.durationOverride || sd.drill.durationMinutes;
            const diagramSVG = this.generateDiagramSVG(sd.drill.diagramJson);

            return `
              <div class="drill" style="page-break-inside: avoid; margin-bottom: 30px; border: 1px solid #ddd; padding: 15px; border-radius: 8px;">
                <h2 style="margin: 0 0 10px 0; color: #2c3e50;">${sd.drill.title}</h2>
                <div style="display: flex; gap: 10px; margin-bottom: 10px;">
                  <span style="background: #3498db; color: white; padding: 4px 12px; border-radius: 4px; font-size: 14px;">
                    ${duration} min
                  </span>
                  ${sd.drill.ageGroup ? `<span style="background: #9b59b6; color: white; padding: 4px 12px; border-radius: 4px; font-size: 14px;">${sd.drill.ageGroup}</span>` : ''}
                </div>
                ${sd.drill.objective ? `<p style="margin: 10px 0;"><strong>Objective:</strong> ${sd.drill.objective}</p>` : ''}
                ${sd.drill.notes ? `<p style="margin: 10px 0;"><strong>Notes:</strong> ${sd.drill.notes}</p>` : ''}
                ${sd.sessionNotes ? `<p style="margin: 10px 0; background: #fff3cd; padding: 10px; border-radius: 4px;"><strong>Session Notes:</strong> ${sd.sessionNotes}</p>` : ''}
                ${diagramSVG ? `<div style="margin-top: 15px; text-align: center;">${diagramSVG}</div>` : ''}
              </div>
            `;
          })
          .join('')
      : '<div style="padding: 40px; text-align: center; color: #999;"><p>No drills added to this session yet.</p></div>';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 0;
            color: #333;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            margin-bottom: 30px;
          }
          .header h1 {
            margin: 0 0 15px 0;
            font-size: 32px;
          }
          .header-info {
            display: flex;
            gap: 20px;
            flex-wrap: wrap;
          }
          .header-info div {
            background: rgba(255,255,255,0.2);
            padding: 8px 15px;
            border-radius: 4px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${session.title}</h1>
          <div class="header-info">
            ${session.date ? `<div>📅 ${new Date(session.date).toLocaleDateString()}</div>` : ''}
            ${session.team ? `<div>👥 ${session.team}</div>` : ''}
            <div>⏱️ ${session.totalDuration} minutes</div>
            ${session.theme ? `<div>🎯 ${session.theme}</div>` : ''}
          </div>
          ${session.notes ? `<p style="margin-top: 15px; font-size: 16px;">${session.notes}</p>` : ''}
        </div>
        <div style="padding: 0 30px;">
          ${drillsHTML}
        </div>
      </body>
      </html>
    `;
  }

  private generateDiagramSVG(diagramJson: any): string {
    if (!diagramJson || !diagramJson.objects) {
      return '';
    }

    const width = 600;
    const height = 400;

    let elements = '';

    // Render background
    if (diagramJson.background === 'full-pitch') {
      elements += this.renderFullPitch(width, height);
    } else if (diagramJson.background === 'half-pitch') {
      elements += this.renderHalfPitch(width, height);
    } else {
      elements += `<rect width="${width}" height="${height}" fill="#2ecc71" stroke="#27ae60" stroke-width="2"/>`;
    }

    // Render objects
    diagramJson.objects.forEach((obj: any) => {
      elements += this.renderObject(obj);
    });

    return `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" style="border: 2px solid #34495e; border-radius: 4px;">
        ${elements}
      </svg>
    `;
  }

  private renderFullPitch(width: number, height: number): string {
    return `
      <rect width="${width}" height="${height}" fill="#2ecc71"/>
      <line x1="${width / 2}" y1="0" x2="${width / 2}" y2="${height}" stroke="white" stroke-width="2"/>
      <circle cx="${width / 2}" cy="${height / 2}" r="50" fill="none" stroke="white" stroke-width="2"/>
      <rect x="0" y="${height / 2 - 80}" width="60" height="160" fill="none" stroke="white" stroke-width="2"/>
      <rect x="${width - 60}" y="${height / 2 - 80}" width="60" height="160" fill="none" stroke="white" stroke-width="2"/>
    `;
  }

  private renderHalfPitch(width: number, height: number): string {
    const pitchWidth = width - 100;
    const pitchHeight = height - 100;
    
    // Penalty area dimensions (18-yard box)
    const penaltyWidth = pitchWidth * 0.5; // 50% of pitch width
    const penaltyHeight = pitchHeight * 0.35; // 35% of pitch height
    
    // Goal area dimensions (6-yard box)
    const goalWidth = pitchWidth * 0.25; // 25% of pitch width
    const goalHeight = pitchHeight * 0.15; // 15% of pitch height
    
    return `
      <rect width="${width}" height="${height}" fill="#7cb342"/>
      
      <!-- Pitch outline -->
      <rect x="50" y="50" width="${pitchWidth}" height="${pitchHeight}" fill="none" stroke="white" stroke-width="3"/>
      
      <!-- Center circle (at bottom for half pitch) -->
      <circle cx="${width / 2}" cy="${height - 50}" r="50" fill="none" stroke="white" stroke-width="3"/>
      
      <!-- Penalty area (18-yard box) -->
      <rect x="${width / 2 - penaltyWidth / 2}" y="50" width="${penaltyWidth}" height="${penaltyHeight}" fill="none" stroke="white" stroke-width="3"/>
      
      <!-- Goal area (6-yard box) -->
      <rect x="${width / 2 - goalWidth / 2}" y="50" width="${goalWidth}" height="${goalHeight}" fill="none" stroke="white" stroke-width="3"/>
      
      <!-- Penalty spot -->
      <circle cx="${width / 2}" cy="${50 + penaltyHeight * 0.65}" r="3" fill="white"/>
    `;
  }

  private renderObject(obj: any): string {
    // Handle Konva.js Group objects (players)
    if (obj.type === 'Group' && obj.children) {
      const hasCircle = obj.children.some((child: any) => child.className === 'Circle');
      const hasText = obj.children.some((child: any) => child.className === 'Text');
      
      if (hasCircle && hasText) {
        return `<circle cx="${obj.x}" cy="${obj.y}" r="15" fill="#3498db" stroke="white" stroke-width="2"/>
                <text x="${obj.x}" y="${obj.y + 5}" text-anchor="middle" fill="white" font-size="12" font-weight="bold">P</text>`;
      }
      return '';
    }
    
    // Handle Konva.js Arrow objects with points array
    if (obj.type === 'Arrow' && obj.points && obj.points.length >= 4) {
      const x1 = obj.points[0];
      const y1 = obj.points[1];
      const x2 = obj.points[2];
      const y2 = obj.points[3];
      
      const dx = x2 - x1;
      const dy = y2 - y1;
      const angle = Math.atan2(dy, dx);
      const arrowSize = 10;
      const arrowX1 = x2 - arrowSize * Math.cos(angle - Math.PI / 6);
      const arrowY1 = y2 - arrowSize * Math.sin(angle - Math.PI / 6);
      const arrowX2 = x2 - arrowSize * Math.cos(angle + Math.PI / 6);
      const arrowY2 = y2 - arrowSize * Math.sin(angle + Math.PI / 6);
      
      const color = obj.stroke || obj.fill || '#e74c3c';
      return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="3"/>
              <polygon points="${x2},${y2} ${arrowX1},${arrowY1} ${arrowX2},${arrowY2}" fill="${color}"/>`;
    }
    
    switch (obj.type) {
      case 'player':
        return `<circle cx="${obj.x}" cy="${obj.y}" r="15" fill="${obj.color || '#3498db'}" stroke="white" stroke-width="2"/>
                <text x="${obj.x}" y="${obj.y + 5}" text-anchor="middle" fill="white" font-size="12" font-weight="bold">${obj.label || 'P'}</text>`;
      
      case 'cone':
        return `<polygon points="${obj.x},${obj.y - 12} ${obj.x - 8},${obj.y + 8} ${obj.x + 8},${obj.y + 8}" fill="${obj.color || '#f39c12'}" stroke="#d68910" stroke-width="1"/>`;
      
      case 'ball':
        return `<circle cx="${obj.x}" cy="${obj.y}" r="10" fill="white" stroke="black" stroke-width="2"/>
                <circle cx="${obj.x}" cy="${obj.y}" r="3" fill="black"/>`;
      
      case 'goal':
        return `<rect x="${obj.x - 30}" y="${obj.y - 10}" width="60" height="20" fill="none" stroke="white" stroke-width="3"/>`;
      
      case 'arrow':
        const dx = obj.endX - obj.x;
        const dy = obj.endY - obj.y;
        const angle = Math.atan2(dy, dx);
        const arrowSize = 10;
        const arrowX1 = obj.endX - arrowSize * Math.cos(angle - Math.PI / 6);
        const arrowY1 = obj.endY - arrowSize * Math.sin(angle - Math.PI / 6);
        const arrowX2 = obj.endX - arrowSize * Math.cos(angle + Math.PI / 6);
        const arrowY2 = obj.endY - arrowSize * Math.sin(angle + Math.PI / 6);
        
        return `<line x1="${obj.x}" y1="${obj.y}" x2="${obj.endX}" y2="${obj.endY}" stroke="${obj.color || '#e74c3c'}" stroke-width="3" stroke-dasharray="${obj.dashed ? '5,5' : 'none'}"/>
                <polygon points="${obj.endX},${obj.endY} ${arrowX1},${arrowY1} ${arrowX2},${arrowY2}" fill="${obj.color || '#e74c3c'}"/>`;
      
      case 'zone':
        return `<rect x="${obj.x}" y="${obj.y}" width="${obj.width || 100}" height="${obj.height || 100}" fill="${obj.color || 'rgba(52, 152, 219, 0.3)'}" stroke="${obj.strokeColor || '#3498db'}" stroke-width="2" stroke-dasharray="5,5"/>`;
      
      default:
        return '';
    }
  }
}
