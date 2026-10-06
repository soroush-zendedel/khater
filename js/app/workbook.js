        document.getElementById('excelUpload').addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, {type: 'array'});
                    const json_data = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
                    
                    if(json_data.length > 0) {
                        currentData = json_data;
                        renderWorkbook(currentData);
                        showMessage('دیتا با موفقیت بارگذاری شد.');
                        document.getElementById('excelUploadText').innerText = `دیتا: ${file.name.substring(0, 15)}...`;
                    } else showMessage('فایل اکسل خالی است.', 'error');
                } catch(error) { showMessage('خطا در خواندن فایل.', 'error'); }
            };
            reader.readAsArrayBuffer(file);
        });

        window.loadDefaultExcel = async function() {
            try {
                showMessage('در حال واکشی فایل از سرور...', 'warning');
                const response = await fetch('Persian_Font_Design_Workbook.xlsx');
                
                if (!response.ok) {
                    throw new Error('فایل یافت نشد');
                }
                
                const arrayBuffer = await response.arrayBuffer();
                const data = new Uint8Array(arrayBuffer);
                const workbook = XLSX.read(data, {type: 'array'});
                const json_data = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
                
                if(json_data.length > 0) {
                    currentData = json_data;
                    renderWorkbook(currentData);
                    showMessage('فایل پیش‌فرض با موفقیت بارگیری و رندر شد.');
                } else {
                    throw new Error('فایل خالی است');
                }
            } catch(error) {
                console.warn("Excel fetch failed, falling back to defaultData object.", error);
                // استفاده از دیتای هاردکد شده داخلی در صورت شکست ریکوئست
                currentData = defaultData;
                renderWorkbook(currentData);
                showMessage('فایل اکسل یافت نشد. دیتای داخلی بارگذاری شد.', 'warning');
            }
        };
        let microGridsHTML = '';
        for (let j = 1; j < 5; j++) microGridsHTML += `<div class="micro-grid" style="right: ${j * 20}%;"></div>`;
        let practiceColsHTML = '';
        for (let i = 0; i < 5; i++) practiceColsHTML += `<div class="practice-col">${microGridsHTML}</div>`;

        window.exportToExcel = function() {
            if (!currentData || currentData.length === 0) {
                showMessage('دیتایی برای خروجی گرفتن وجود ندارد.', 'warning');
                return;
            }
            try {
                const standardHeaders = [
                    'دسته بندی', 'شناسه', 'نام گلیف', 'یونیکد', 'خانواده اسکلت', 
                    'تگ OpenType', 'فرم منفرد', 'فرم ابتدایی', 'فرم میانی', 'فرم انتهایی', 
                    'نمونه اتصال راست', 'نمونه اتصال چپ', 'درجه سختی', 'یادداشت', 
                    'نمونه متن فرم منفرد', 'نمونه متن فرم ابتدایی', 'نمونه متن فرم میانی', 'نمونه متن فرم انتهایی'
                ];

                const extraKeys = new Set();
                currentData.forEach(row => {
                    Object.keys(row).forEach(key => {
                        if (!standardHeaders.includes(key) && !key.endsWith('_type') && !key.startsWith('practice_text_')) {
                            extraKeys.add(key);
                        }
                    });
                });
                
                const allHeaders = [...standardHeaders, ...Array.from(extraKeys)];

                const cleanData = currentData.map(row => {
                    let cleanRow = {};
                    allHeaders.forEach(header => {
                        if (header.startsWith('نمونه متن ')) {
                            const formKey = header.replace('نمونه متن ', '');
                            cleanRow[header] = row[header] || row['practice_text_' + formKey] || '';
                        } else {
                            cleanRow[header] = row[header] !== undefined ? row[header] : '';
                        }
                    });
                    return cleanRow;
                });

                const ws = XLSX.utils.json_to_sheet(cleanData, { header: allHeaders });
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
                
                XLSX.writeFile(wb, "Persian_Font_Design_Workbook_Export.xlsx");
                showMessage('فایل اکسل با موفقیت ذخیره و دانلود شد.');
            } catch (err) {
                showMessage('خطا در ایجاد فایل اکسل.', 'error');
                console.error(err);
            }
        };

        window.deleteGlyphRow = function(dataIndex, formKey) {
            if(currentData[dataIndex]) {
                currentData[dataIndex][formKey] = '-'; 
                renderWorkbook(currentData);
                showMessage('سطر مورد نظر حذف شد.', 'warning');
            }
        };



        function renderWorkbook(data) {
            const container = document.getElementById('rows-container');
            container.innerHTML = '';
            let allRowsHtml = ''; // متغیر برای جمع‌آوری کل کدهای HTML
            window.glyphBoxDataMap = [];
            let boxIndexCounter = 0;
            let isFirstRow = true;

            const font_size_pt = 44; 
            const pt_to_mm = 0.352778;
            const unit_to_mm = (font_size_pt / currentUPM) * pt_to_mm;
            
            const h_top_pad = 5;
            const h_bottom_pad = 5;
            
            const ascender_mm = fontMetrics.ascender * unit_to_mm;
            const capheight_mm = fontMetrics.capHeight * unit_to_mm; 
            const xheight_mm = fontMetrics.xHeight * unit_to_mm;
            const descender_mm = fontMetrics.descender * unit_to_mm;
            
            const line_ascender_stop = h_top_pad;
            const line_cap_height_stop = h_top_pad + (ascender_mm - capheight_mm);
            const line_x_height_stop = h_top_pad + (ascender_mm - xheight_mm);
            const line_baseline_stop = h_top_pad + ascender_mm;
            const line_descender_stop = h_top_pad + ascender_mm + descender_mm;
            const total_height = line_descender_stop + h_bottom_pad;

            const hideAsc = metricVisibility.ascender ? '' : 'hidden';
            const hideCap = metricVisibility.capHeight ? '' : 'hidden';
            const hideX = metricVisibility.xHeight ? '' : 'hidden';
            const hideBase = metricVisibility.baseline ? '' : 'hidden';
            const hideDesc = metricVisibility.descender ? '' : 'hidden';

            data.forEach((row, dataIndex) => {
                // گرفتن مقادیر خام برای پردازش‌های جاوااسکریپتی
                const rawBaseChar = row['نام گلیف'] || 'نامشخص';
                const rawNoteText = row['یادداشت'] || '';
                
                // خنثی‌سازی (Escape) برای تزریق امن به HTML
                const baseChar = escapeHTML(rawBaseChar);
                const noteText = escapeHTML(rawNoteText);
                
                // نام فرم‌ها و گلیف‌ها را در آبجکت نگه‌می‌داریم تا بعداً برای نمایش خنثی شوند
                const forms = [
                    { name: row['فرم منفرد_type'] || 'منفرد', glyph: row['فرم منفرد'], key: 'فرم منفرد' },
                    { name: row['فرم ابتدایی_type'] || 'ابتدایی', glyph: row['فرم ابتدایی'], key: 'فرم ابتدایی' },
                    { name: row['فرم میانی_type'] || 'میانی', glyph: row['فرم میانی'], key: 'فرم میانی' },
                    { name: row['فرم انتهایی_type'] || 'انتهایی', glyph: row['فرم انتهایی'], key: 'فرم انتهایی' }
                ];

                forms.forEach(form => {
                    if (form.glyph && form.glyph.trim() !== '-' && form.glyph.trim() !== '') {
                        // ذخیره مقادیر کاملاً خام در نقشه تا سایر توابع (مثل مدال‌ها و خروجی SVG) درست کار کنند
                        window.glyphBoxDataMap[boxIndexCounter] = { row: row, form: form };

                        const escapedGlyph = escapeHTML(form.glyph);
                        const escapedFormName = escapeHTML(form.name);

                        const lblAsc = isFirstRow ? `<span class="line-label">Ascender (${fontMetrics.ascender})</span>` : '';
                        const lblCap = isFirstRow ? `<span class="line-label">Cap Height (${fontMetrics.capHeight})</span>` : ''; 
                        const lblX = isFirstRow ? `<span class="line-label">x-Height (${fontMetrics.xHeight})</span>` : '';
                        const lblBase = isFirstRow ? `<span class="line-label">Baseline (0)</span>` : '';
                        const lblDesc = isFirstRow ? `<span class="line-label">Descender (-${fontMetrics.descender})</span>` : '';
                        const noteHtml = noteText && noteText.trim() !== '-' ? `<div class="glyph-note">${noteText}</div>` : '';

                        let advanceWidthHtml = '';
                        const checkFont = parsedFont || defaultParsedFont; 
                        
                        // پردازش‌های OpenType با مقدار خام فرم (form.glyph)
                        if (checkFont) {
                            try {
                                const glyphs = checkFont.stringToGlyphs(form.glyph);
                                let totalAdvanceWidth = 0;
                                glyphs.forEach(g => totalAdvanceWidth += (g.advanceWidth || 0));
                                
                                if (totalAdvanceWidth > 0) {
                                    const physicalWidthMm = totalAdvanceWidth * unit_to_mm;
                                    const tickY = line_baseline_stop;
                                    advanceWidthHtml = `
                                        <div class="advance-tick" style="left: calc(50% - ${physicalWidthMm / 2}mm); top: ${tickY}mm;" title="شروع گلیف"></div>
                                        <div class="advance-tick" style="left: calc(50% + ${physicalWidthMm / 2}mm); top: ${tickY}mm;" title="پایان گلیف"></div>
                                    `;
                                }
                            } catch(e) { }
                        }

                        const exportIconOverlay = `
                            <div class="export-icon-overlay" title="دریافت فایل خروجی SVG دقیق">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                </svg>
                            </div>
                        `;

                        // فرم کلید همیشه رشته ثابت ماست (مثل "فرم منفرد") پس خطر XSS ندارد
                        const deleteBtnHtml = `
                            <button class="no-print absolute top-2 left-2 z-20 bg-rose-500/90 hover:bg-rose-600 text-white rounded p-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-sm flex items-center justify-center cursor-pointer scale-95 hover:scale-100" 
                                    onclick="event.stopPropagation(); deleteGlyphRow(${dataIndex}, '${form.key}')" title="حذف این سطر از لیست">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                        `;

                        const textKey = 'نمونه متن ' + form.key;
                        const practiceText = row[textKey] || row['practice_text_' + form.key] || '';
                        const isContinuousMode = practiceText ? 'continuous-mode' : '';
                        
                        let practiceTextHtml = '';
                        if (practiceText) {
                            
                            const isLTR = /[a-zA-Z]/.test(practiceText);
                            let kerningTicksHtml = '';

                            // پردازش Kerning با رشته خام (practiceText)
                            if (metricVisibility.kerning && checkFont) {
                                try {
                                    const glyphs = checkFont.stringToGlyphs(practiceText);
                                    let currentPosMm = 0; 
                                    
                                    kerningTicksHtml += `<div class="kerning-tick" style="${isLTR ? 'left' : 'right'}: 0mm;" title="شروع"></div>`;

                                    glyphs.forEach((glyph, index) => {
                                        let advance = glyph.advanceWidth || 0;
                                        let kerning = 0;
                                        
                                        if (index < glyphs.length - 1) {
                                            if (isLTR) {
                                                kerning = checkFont.getKerningValue(glyph, glyphs[index + 1]) || 0;
                                            } else {
                                                kerning = checkFont.getKerningValue(glyphs[index + 1], glyph) || 0;
                                            }
                                        }

                                        const advanceMm = (advance + kerning) * unit_to_mm;
                                        currentPosMm += advanceMm;

                                        if (glyph.unicode !== 32) {
                                            kerningTicksHtml += `
                                                <div class="kerning-tick" 
                                                    style="${isLTR ? 'left' : 'right'}: ${currentPosMm}mm;" 
                                                    title="عرض: ${advance} | Kerning: ${kerning}">
                                                </div>`;
                                        }
                                    });
                                } catch (e) {
                                    console.warn("Could not calculate kerning data", e);
                                }
                            }

                            // ----------------------------------------------------
                            // پردازش تفکیک رنگی حروف و اِعمال escapeHTML به صورت همزمان
                            // ----------------------------------------------------
                            let formattedPracticeText = '';
                            let colorsEnabledClass = '';
                            
                            if (metricVisibility.charColors) {
                                const chars = [...practiceText];
                                let charIndexCounter = -1;
                                
                                const ignoreRegex = /[\u064B-\u065F\u0670\u200C\u200D\u0640]/;
                                
                                formattedPracticeText = chars.map((char) => {
                                    if (char.trim() !== '' && !ignoreRegex.test(char)) {
                                        charIndexCounter++;
                                    }
                                    const actualIndex = Math.max(0, charIndexCounter);
                                    const colorClass = (actualIndex % 2 === 0) ? 'char-color-1' : 'char-color-2';
                                    
                                    // خنثی‌سازی هر کاراکتر در لحظه تزریق
                                    return `<span class="${colorClass} transition-colors duration-200">${escapeHTML(char)}</span>`;
                                }).join('');
                                
                                colorsEnabledClass = 'colors-enabled'; 
                            } else {
                                // خنثی‌سازی کل متن یک‌جا اگر رنگ‌ها غیرفعال باشند
                                formattedPracticeText = escapeHTML(practiceText); 
                            }

                            practiceTextHtml = `
                                <div class="practice-text-overlay ${colorsEnabledClass}" style="height: ${line_baseline_stop}mm; direction: ${isLTR ? 'ltr' : 'rtl'}; justify-content: flex-start;">
                                    <div class="relative" style="margin-${isLTR ? 'left' : 'right'}: 3mm;">
                                        <span class="practice-text-string">${formattedPracticeText}</span>
                                        <div class="absolute inset-y-0" style="${isLTR ? 'left' : 'right'}: 0; width: 100%;">
                                            ${kerningTicksHtml}
                                        </div>
                                    </div>
                                </div>
                            `;
                        }

                        const practiceHoverOverlay = `
                            <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover/practice:opacity-100 transition-opacity duration-300 pointer-events-none z-20 no-print">
                                <div class="bg-indigo-50/95 text-indigo-600 text-xs px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1.5 border border-indigo-200 backdrop-blur-sm font-medium">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                    تغییر کلمه تمرین
                                </div>
                            </div>
                        `;

                        // استفاده از مقادیر escaped (خنثی شده) برای تگ‌های HTML
                        const rowHtml = `
                            <div class="row-container group" style="height: ${total_height}mm;">
                                ${deleteBtnHtml}
                                <div class="meta-box" onclick="openGlyphModal(${boxIndexCounter})">
                                    <div class="glyph-name">${baseChar}</div>
                                    <div class="glyph-type">${escapedFormName}</div>
                                    ${noteHtml}
                                </div>

                                <div class="h-line line-asc ${hideAsc}" style="top: ${line_ascender_stop}mm;">${lblAsc}</div>
                                <div class="h-line line-cap ${hideCap}" style="top: ${line_cap_height_stop}mm;">${lblCap}</div>
                                <div class="h-line line-x ${hideX}" style="top: ${line_x_height_stop}mm;">${lblX}</div>
                                <div class="h-line line-base ${hideBase}" style="top: ${line_baseline_stop}mm;">${lblBase}</div>
                                <div class="h-line line-desc ${hideDesc}" style="top: ${line_descender_stop}mm;">${lblDesc}</div>

                                <div class="reference-box" onclick="openExportModal(${boxIndexCounter})" title="خروجی گرفتن از این گلیف">
                                    ${exportIconOverlay}
                                    <div class="glyph-baseline-container" style="height: ${line_baseline_stop}mm;">
                                        <div class="glyph-display">${escapedGlyph}</div>
                                    </div>
                                    ${advanceWidthHtml}
                                </div>
                                
                                <div class="practice-area ${isContinuousMode} group/practice" onclick="openPracticeModal(${boxIndexCounter})" title="ویرایش کلمه یا جمله تمرینی">
                                    ${practiceHoverOverlay}
                                    ${practiceTextHtml}
                                    ${practiceColsHTML}
                                </div>
                            </div>
                        `;
                        
                        allRowsHtml += rowHtml;
                        boxIndexCounter++;
                        isFirstRow = false;
                    }
                });
            });
            
            container.innerHTML = allRowsHtml;
            
            // همگام‌سازی استایل‌های کاستوم روی المان‌های جدید
            previewColorSettings();
        }

