        function addManualUnicode() {
            const inputEl = document.getElementById('inpUnicode');
            let val = inputEl.value.trim();
            if(!val) return showMessage('لطفا یک کاراکتر یا کد یونیکد وارد کنید.', 'warning');

            let hexStr = '';
            let char = '';

            const hexRegex = /^(?:uni|U\+|u\+)?([0-9A-Fa-f]{2,6})$/;
            const isLikelyHexCode = hexRegex.test(val);

            if (isLikelyHexCode && val.length > 1) {
                const match = val.match(hexRegex);
                hexStr = match[1].toUpperCase();
                try {
                    const codePoint = parseInt(hexStr, 16);
                    char = String.fromCodePoint(codePoint);
                    hexStr = hexStr.padStart(4, '0');
                } catch (e) {
                    return showMessage('کد هگز وارد شده نامعتبر است.', 'error');
                }
            } else {
                const chars = [...val]; 
                if (chars.length === 1) {
                    char = chars[0];
                    hexStr = char.codePointAt(0).toString(16).toUpperCase().padStart(4, '0');
                } else {
                    return showMessage('لطفاً فقط یک کاراکتر تکی یا یک کد هگز معتبر (مثل 06A4) وارد کنید.', 'error');
                }
            }

            try {
                const newRowData = {
                    'نام گلیف': 'U+' + hexStr,
                    'یادداشت': 'افزوده شده دستی',
                    'فرم منفرد': char, 'فرم ابتدایی': '-', 'فرم میانی': '-', 'فرم انتهایی': '-',
                    'تگ OpenType': 'دستی', 'درجه سختی': '-'
                };

                if (document.getElementById('inpAddPosition').value === 'bottom') currentData.push(newRowData);
                else currentData.unshift(newRowData);
                
                renderWorkbook(currentData);
                showMessage(`کاراکتر «${char}» (U+${hexStr}) اضافه شد.`);
                inputEl.value = '';
            } catch (e) {
                showMessage('خطا در افزودن سطر.', 'error');
            }
        }

        function openGlyphModal(boxIndex) {
            const dataObj = window.glyphBoxDataMap[boxIndex];
            if (!dataObj) return;

            window.currentActiveBoxIndex = boxIndex;
            const modal = document.getElementById('glyphModal');
            const modalContent = document.getElementById('glyphModalContent');
            const modalBody = document.getElementById('glyphModalBody');

            let allKeys = new Set(['نام گلیف', 'یادداشت', 'فرم منفرد', 'فرم ابتدایی', 'فرم میانی', 'فرم انتهایی', 'تگ OpenType', 'درجه سختی']);
            
            currentData.forEach(r => Object.keys(r).forEach(k => { 
                if (!k.endsWith('_type') && !k.startsWith('practice_text_') && !k.startsWith('نمونه متن ')) {
                    allKeys.add(k); 
                }
            }));

            let detailsHtml = '<div class="grid grid-cols-1 md:grid-cols-2 gap-4">';
            Array.from(allKeys).forEach(key => {
                let editValue = dataObj.row[key] || '';
                if (key.trim() === 'یادداشت') {
                    detailsHtml += `<div class="col-span-1 md:col-span-2"><label class="block text-xs font-bold mb-1">${key}</label><textarea data-field-key="${key}" class="modal-edit-input w-full border rounded px-3 py-2 text-sm">${editValue}</textarea></div>`;
                } else {
                    detailsHtml += `<div><label class="block text-xs font-bold mb-1">${key}</label><input type="text" data-field-key="${key}" value="${editValue}" class="modal-edit-input w-full border rounded px-2 py-1.5 text-sm"></div>`;
                }
            });
            detailsHtml += '</div>';

            modalBody.innerHTML = detailsHtml;
            modal.classList.remove('opacity-0', 'pointer-events-none');
            modalContent.classList.remove('scale-95');
            document.body.style.overflow = 'hidden';
        }

        function saveModalChanges() {
            if (window.currentActiveBoxIndex === undefined) return;
            const dataObj = window.glyphBoxDataMap[window.currentActiveBoxIndex];
            if (!dataObj) return;

            document.querySelectorAll('.modal-edit-input').forEach(input => {
                const key = input.getAttribute('data-field-key');
                if (key) dataObj.row[key] = input.value;
            });
            renderWorkbook(currentData);
            closeGlyphModal();
            showMessage('تغییرات ذخیره شد.');
        }

        function deleteFromModal() {
            if (window.currentActiveBoxIndex === undefined) return;
            const dataObj = window.glyphBoxDataMap[window.currentActiveBoxIndex];
            const dataIndex = currentData.indexOf(dataObj.row);
            if (dataIndex > -1) {
                deleteGlyphRow(dataIndex, dataObj.form.key);
                closeGlyphModal();
            }
        }

        function closeGlyphModal() {
            document.getElementById('glyphModal').classList.add('opacity-0', 'pointer-events-none');
            document.getElementById('glyphModalContent').classList.add('scale-95');
            document.body.style.overflow = 'auto';
        }

        function openPracticeModal(boxIndex) {
            window.currentActivePracticeBox = boxIndex;
            const dataObj = window.glyphBoxDataMap[boxIndex];
            if (!dataObj) return;

            const textKey = 'نمونه متن ' + dataObj.form.key;
            const currentText = dataObj.row[textKey] || dataObj.row['practice_text_' + dataObj.form.key] || '';

            const inputEl = document.getElementById('inpPracticeText');
            inputEl.value = currentText;
            
            const modal = document.getElementById('practiceModal');
            const modalContent = document.getElementById('practiceModalContent');
            modal.classList.remove('opacity-0', 'pointer-events-none');
            modalContent.classList.remove('scale-95');
            
            setTimeout(() => inputEl.focus(), 100);
        }

        function closePracticeModal() {
            document.getElementById('practiceModal').classList.add('opacity-0', 'pointer-events-none');
            document.getElementById('practiceModalContent').classList.add('scale-95');
        }

        function savePracticeText() {
            if (window.currentActivePracticeBox === undefined) return;
            const dataObj = window.glyphBoxDataMap[window.currentActivePracticeBox];
            if (!dataObj) return;

            const textKey = 'نمونه متن ' + dataObj.form.key;
            const newText = document.getElementById('inpPracticeText').value.trim();
            
            dataObj.row[textKey] = newText;
            
            closePracticeModal();
            renderWorkbook(currentData);
            if(newText) showMessage('الگوی تمرینی ثبت شد.');
        }

        function clearPracticeText() {
            if (window.currentActivePracticeBox === undefined) return;
            const dataObj = window.glyphBoxDataMap[window.currentActivePracticeBox];
            if (!dataObj) return;

            const textKey = 'نمونه متن ' + dataObj.form.key;
            dataObj.row[textKey] = '';
            
            closePracticeModal();
            renderWorkbook(currentData);
            showMessage('الگو حذف شد و شبکه‌بندی به حالت قبل بازگشت.', 'warning');
        }

        function openExportModal(boxIndex) {
            const dataObj = window.glyphBoxDataMap[boxIndex];
            if (!dataObj) return;
            
            const char = dataObj.form.glyph;
            if(!char || char === '-') return;

            let advWidth = currentUPM;
            const checkFont = parsedFont || defaultParsedFont;
            if (checkFont) {
                try {
                    const glyphs = checkFont.stringToGlyphs(char);
                    let totalAdv = 0;
                    glyphs.forEach(g => totalAdv += (g.advanceWidth || 0));
                    if (totalAdv > 0) advWidth = totalAdv;
                } catch(e) {}
            }

            const svgData = generatePrecisionSVG(char, advWidth);
            
            activeExportSVGString = svgData.svg;
            activeExportWidth = svgData.width;
            activeExportHeight = svgData.height;
            const uCode = Array.from(char).map(c => c.charCodeAt(0).toString(16).toUpperCase()).join('-');
            activeExportFileName = `Glyph_${dataObj.row['نام گلیف'].replace(/[\s\(\)]/g, '_')}_${dataObj.form.name}_U${uCode}`;

            document.getElementById('svgPreviewWrapper').innerHTML = activeExportSVGString;

            const modal = document.getElementById('exportModal');
            const modalContent = document.getElementById('exportModalContent');
            modal.classList.remove('opacity-0', 'pointer-events-none');
            modalContent.classList.remove('scale-95');
            document.body.style.overflow = 'hidden';
        }

        function closeExportModal() {
            document.getElementById('exportModal').classList.add('opacity-0', 'pointer-events-none');
            document.getElementById('exportModalContent').classList.add('scale-95');
            document.body.style.overflow = 'auto';
            document.getElementById('svgPreviewWrapper').innerHTML = '';
        }

