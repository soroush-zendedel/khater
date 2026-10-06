        function generatePrecisionSVG(char, advanceWidth) {
            const upm = currentUPM;
            const asc = fontMetrics.ascender;
            const cap = fontMetrics.capHeight; 
            const xh = fontMetrics.xHeight;
            const desc = fontMetrics.descender; 
            
            const padTop = Math.max(Math.round(upm * 0.15), Math.round((upm * 0.85) - asc));
            const padBottom = Math.round(upm * 0.35); 
            
            const width = Math.max(upm + Math.round(upm * 0.2), advanceWidth + Math.round(upm * 0.2)); 
            const height = padTop + asc + desc + padBottom;

            const yAsc = padTop;
            const yBase = padTop + asc;
            const yCap = yBase - cap; 
            const yX = yBase - xh;
            const yDesc = yBase + desc;

            let fontDefs = `@import url('./css/vazirmatn.css');`;
            let fontFamilyText = 'Vazirmatn, sans-serif';

            if (activeCustomFontBase64 && activeCustomFontName) {
                fontDefs += `\n                @font-face {\n                    font-family: '${activeCustomFontName}';\n                    src: url('${activeCustomFontBase64}') format('truetype');\n                }`;
                fontFamilyText = `'${activeCustomFontName}', Vazirmatn, sans-serif`;
            }

            let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" dir="ltr" style="background-color: white; direction: ltr;">`;
            svg += `<defs><style>${fontDefs}</style></defs>`;
            
            const uiFont = "monospace";
            const fSize = Math.round(upm * 0.035);
            const textX = Math.max(20, Math.round(width * 0.02)); 

            const cols = 10;
            for(let i = 1; i < cols; i++) {
                let x = (width / cols) * i;
                svg += `<line x1="${x}" y1="0" x2="${x}" y2="${height - Math.round(padBottom*0.8)}" stroke="#f1f5f9" stroke-width="${Math.max(1, Math.round(upm*0.002))}"/>`;
            }

            const strokeW = Math.max(1, Math.round(upm * 0.003));
            const thickW = Math.max(2, Math.round(upm * 0.006));
            
            if (metricVisibility.upm) {
                const upmBoxX = (width - upm) / 2;
                const upmBoxY = yBase - Math.round(upm * 0.8);
                svg += `<rect x="${upmBoxX}" y="${upmBoxY}" width="${upm}" height="${upm}" fill="rgba(15, 23, 42, 0.015)" stroke="#0f172a" stroke-width="${thickW * 1.5}"/>`;
                svg += `<text x="${upmBoxX}" y="${upmBoxY - Math.round(upm * 0.015)}" font-family="${uiFont}" font-size="${fSize * 0.85}" fill="#0f172a" font-weight="bold" text-anchor="start">UPM Square (${upm} × ${upm})</text>`;
            }

            if (metricVisibility.ascender) {
                svg += `<line x1="0" y1="${yAsc}" x2="${width}" y2="${yAsc}" stroke="#cbd5e1" stroke-width="${strokeW}" stroke-dasharray="${upm*0.015},${upm*0.015}"/>`;
                svg += `<text x="${textX}" y="${yAsc - fSize + (upm*0.01)}" font-family="${uiFont}" font-size="${fSize}" fill="#94a3b8" text-anchor="start">Ascender: ${asc}</text>`;
            }

            if (metricVisibility.capHeight) {
                svg += `<line x1="0" y1="${yCap}" x2="${width}" y2="${yCap}" stroke="#ffa502" stroke-width="${strokeW}" stroke-dasharray="${upm*0.01},${upm*0.01}"/>`;
                svg += `<text x="${textX}" y="${yCap - (upm*0.01)}" font-family="${uiFont}" font-size="${fSize}" fill="#ffa502" text-anchor="start">Cap Height: ${cap}</text>`;
            }

            if (metricVisibility.xHeight) {
                svg += `<line x1="0" y1="${yX}" x2="${width}" y2="${yX}" stroke="#74b9ff" stroke-width="${strokeW}"/>`;
                svg += `<text x="${textX}" y="${yX - (upm*0.01)}" font-family="${uiFont}" font-size="${fSize}" fill="#74b9ff" text-anchor="start">x-Height: ${xh}</text>`;
            }

            if (metricVisibility.baseline) {
                svg += `<line x1="0" y1="${yBase}" x2="${width}" y2="${yBase}" stroke="#1e293b" stroke-width="${thickW}"/>`;
                svg += `<text x="${textX}" y="${yBase - (upm*0.01)}" font-family="${uiFont}" font-size="${fSize}" fill="#1e293b" text-anchor="start">Baseline (0)</text>`;
            }

            if (metricVisibility.descender) {
                svg += `<line x1="0" y1="${yDesc}" x2="${width}" y2="${yDesc}" stroke="#ff7675" stroke-width="${strokeW}" stroke-dasharray="${upm*0.015},${upm*0.015}"/>`;
                svg += `<text x="${textX}" y="${yDesc - (upm*0.01)}" font-family="${uiFont}" font-size="${fSize}" fill="#ff7675" text-anchor="start">Descender: -${desc}</text>`;
            }

            const yWidthInd = height - Math.round(padBottom * 0.4);
            const wIndHeight = upm * 0.03;
            const startX = (width - advanceWidth) / 2;
            const endX = startX + advanceWidth;

            svg += `<line x1="${startX}" y1="${yWidthInd}" x2="${endX}" y2="${yWidthInd}" stroke="#8e44ad" stroke-width="${thickW}"/>`;
            
            const step = upm >= 2000 ? 100 : 50;
            for(let w = 0; w <= advanceWidth; w += step) {
                let xPos = startX + w;
                let tickH = (w % (step * 2) === 0) ? wIndHeight : wIndHeight * 0.6;
                svg += `<line x1="${xPos}" y1="${yWidthInd - tickH}" x2="${xPos}" y2="${yWidthInd}" stroke="#8e44ad" stroke-width="${Math.max(1, thickW/2)}"/>`;
                
                if (w % (step * 2) === 0) {
                    svg += `<text x="${xPos}" y="${yWidthInd + upm*0.025}" font-family="${uiFont}" font-size="${fSize*0.7}" fill="#8e44ad" text-anchor="middle">${w}</text>`;
                }
            }

            if (advanceWidth % step !== 0) {
                svg += `<line x1="${endX}" y1="${yWidthInd - wIndHeight}" x2="${endX}" y2="${yWidthInd}" stroke="#8e44ad" stroke-width="${thickW/1.5}"/>`;
            }

            svg += `<text x="${width/2}" y="${yWidthInd - (upm*0.045)}" font-family="${uiFont}"  font-size="${fSize*0.85}" fill="#8e44ad" font-weight="bold" text-anchor="middle">Advance Width: ${advanceWidth}</text>`;

            let pathSvg = `<text x="${width/2}" y="${yBase}" font-family="${fontFamilyText}" font-size="${upm}" text-anchor="middle" fill="#0f172a">${char}</text>`;

            svg += pathSvg;
            svg += `</svg>`;

            return { svg: svg, width: width, height: height };
        }

        document.getElementById('btnDownloadSVG').addEventListener('click', () => {
            if(!activeExportSVGString) return;
            const blob = new Blob([activeExportSVGString], {type: 'image/svg+xml;charset=utf-8'});
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = activeExportFileName + '.svg';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            showMessage('فایل SVG با موفقیت ساخته و دانلود شد.');
        });

        document.getElementById('btnDownloadPNG').addEventListener('click', () => {
            if(!activeExportSVGString) return;
            
            const canvas = document.createElement('canvas');
            canvas.width = activeExportWidth;
            canvas.height = activeExportHeight;
            const ctx = canvas.getContext('2d');
            
            const img = new Image();
            const svg64 = btoa(unescape(encodeURIComponent(activeExportSVGString)));
            img.onload = function() {
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0);
                
                const pngUrl = canvas.toDataURL("image/png");
                const a = document.createElement('a');
                a.href = pngUrl;
                a.download = activeExportFileName + '.png';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                showMessage('فایل PNG با موفقیت ساخته و دانلود شد.');
            };
            img.src = 'data:image/svg+xml;base64,' + svg64;
        });

