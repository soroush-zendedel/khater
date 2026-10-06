        function applyMetricsFromUI() {
            fontMetrics.ascender = parseInt(document.getElementById('inpAscender').value) || 0;
            fontMetrics.capHeight = parseInt(document.getElementById('inpCapHeight').value) || 0;
            fontMetrics.xHeight = parseInt(document.getElementById('inpXHeight').value) || 0;
            fontMetrics.descender = Math.abs(parseInt(document.getElementById('inpDescender').value) || 0);
            
            currentUPM = parseInt(document.getElementById('upmSelect').value) || 1000;

            metricVisibility.upm = document.getElementById('chkShowUpm').checked;
            metricVisibility.ascender = document.getElementById('chkShowAscender').checked;
            metricVisibility.capHeight = document.getElementById('chkShowCapHeight').checked;
            metricVisibility.xHeight = document.getElementById('chkShowXHeight').checked;
            metricVisibility.descender = document.getElementById('chkShowDescender').checked;
            metricVisibility.kerning = document.getElementById('chkShowKerning').checked;
            metricVisibility.charColors = document.getElementById('chkShowCharColors').checked; 
            
            // تغییر متن دکمه مودال رنگ بر اساس وضعیت تفکیک رنگی
            const btnColorModalText = document.getElementById('btnColorModalText');
            if (btnColorModalText) {
                btnColorModalText.innerText = metricVisibility.charColors ? 'تنظیم رنگ‌بندی حروف' : 'تنظیم شفافیت متن';
            }
        }

        function autoApplyMetrics() {
            applyMetricsFromUI();
            renderWorkbook(currentData);
        }

        let metricsDebounceTimer;
        
        function debouncedAutoApplyMetrics() {
            clearTimeout(metricsDebounceTimer);
            metricsDebounceTimer = setTimeout(() => {
                autoApplyMetrics();
            }, 400); 
        }

        document.getElementById('upmSelect').addEventListener('change', (e) => {
            const newUPM = parseInt(e.target.value);
            const scaleRatio = newUPM / currentUPM;

            fontMetrics.ascender = Math.round(fontMetrics.ascender * scaleRatio);
            fontMetrics.capHeight = Math.round(fontMetrics.capHeight * scaleRatio);
            fontMetrics.xHeight = Math.round(fontMetrics.xHeight * scaleRatio);
            fontMetrics.descender = Math.round(fontMetrics.descender * scaleRatio);

            document.getElementById('inpAscender').value = fontMetrics.ascender;
            document.getElementById('inpCapHeight').value = fontMetrics.capHeight;
            document.getElementById('inpXHeight').value = fontMetrics.xHeight;
            document.getElementById('inpDescender').value = fontMetrics.descender;

            currentUPM = newUPM;
            autoApplyMetrics(); // اعمال همه تغییرات
        });

        document.getElementById('btnApplyMetrics').addEventListener('click', () => {
            autoApplyMetrics();
            showMessage('تنظیمات متریک اعمال و رسم شد.');
        });

        window.processFontBuffer = function(buffer, displayName) {
            const fontName = 'CustomFont_' + Date.now();
            activeCustomFontName = fontName;
            
            const blob = new Blob([buffer], { type: 'font/ttf' });
            const fontUrl = URL.createObjectURL(blob);
            const customFont = new FontFace(fontName, `url(${fontUrl})`);
            
            customFont.load().then((loadedFont) => {
                document.fonts.add(loadedFont);
                document.documentElement.style.setProperty('--custom-font', `"${fontName}"`);
                
                const shortName = displayName.length > 20 ? displayName.substring(0, 20) + '...' : displayName;
                document.getElementById('fontUploadText').innerText = `فونت: ${shortName}`;
                
                try {
                    parsedFont = opentype.parse(buffer);
                    
                    const fontData = new Uint8Array(buffer);
                    let binary = '';
                    for (let i = 0; i < fontData.byteLength; i++) {
                        binary += String.fromCharCode(fontData[i]);
                    }
                    activeCustomFontBase64 = 'data:font/truetype;charset=utf-8;base64,' + window.btoa(binary);

                    let autoUpdated = false;
                    if (parsedFont.unitsPerEm) {
                        currentUPM = parsedFont.unitsPerEm;
                        const upmSelect = document.getElementById('upmSelect');
                        if(!Array.from(upmSelect.options).some(opt => opt.value == currentUPM)) {
                            upmSelect.add(new Option(currentUPM, currentUPM));
                        }
                        upmSelect.value = currentUPM;
                        autoUpdated = true;
                    }
                    if (parsedFont.ascender !== undefined) {
                        fontMetrics.ascender = parsedFont.ascender;
                        document.getElementById('inpAscender').value = fontMetrics.ascender;
                        autoUpdated = true;
                    }
                    
                    if (parsedFont.tables && parsedFont.tables.os2 && parsedFont.tables.os2.sCapHeight) {
                        fontMetrics.capHeight = parsedFont.tables.os2.sCapHeight;
                        document.getElementById('inpCapHeight').value = fontMetrics.capHeight;
                        autoUpdated = true;
                    } else {
                        fontMetrics.capHeight = Math.round(currentUPM * 0.7);
                        document.getElementById('inpCapHeight').value = fontMetrics.capHeight;
                    }

                    if (parsedFont.descender !== undefined) {
                        fontMetrics.descender = Math.abs(parsedFont.descender);
                        document.getElementById('inpDescender').value = fontMetrics.descender;
                        autoUpdated = true;
                    }
                    if (parsedFont.tables && parsedFont.tables.os2 && parsedFont.tables.os2.sxHeight) {
                        fontMetrics.xHeight = parsedFont.tables.os2.sxHeight;
                        document.getElementById('inpXHeight').value = fontMetrics.xHeight;
                        autoUpdated = true;
                    }

                    if(autoUpdated) {
                        const badge = document.getElementById('autoMetricsInfo');
                        badge.classList.remove('hidden');
                        setTimeout(() => badge.classList.add('hidden'), 5000);
                    }

                    showMessage(`فونت ${shortName} لود شد و اطلاعات آن استخراج گردید.`);
                    autoApplyMetrics();
                } catch (err) {
                    console.error(err);
                    showMessage('فونت ظاهری اعمال شد اما خواندن متادیتا ممکن نبود.', 'error');
                    autoApplyMetrics();
                }
            }).catch(() => showMessage('خطا در پردازش و نمایش فایل فونت.', 'error'));
        };

        window.localFontsMap = {};
        window.serverFontsMap = {};

        window.scanServerFontsFolder = async function(showMsg = false) {
            // لیستی از فونت‌هایی که در پوشه fonts در گیت‌هاب آپلود کرده‌اید را اینجا بنویسید
            const defaultFonts = [
                { name: 'NotoSans', url: './fonts/NotoSansArabic-Regular.ttf' },
                { name: 'Vazirmatn-Regular', url: './fonts/Vazirmatn-Regular.ttf' },
                { name: 'Vazirmatn-Bold', url: './fonts/Vazirmatn-Bold.ttf' },
                { name: 'Lalezar', url: './fonts/Lalezar-Regular.ttf' },
                { name: 'IRNazanin', url: './fonts/IRNazanin.ttf' },
                { name: 'IRAban', url: './fonts/IRAban.ttf' },
                { name: 'Samim', url: './fonts/Samim.ttf' },
                { name: 'Shabnam', url: './fonts/Shabnam.ttf' },
                // فونت‌های بیشتر را به همین شکل اضافه کنید
            ];

            try {
                const selectEl = document.getElementById('scannedFontSelect');
                
                let serverGroup = selectEl.querySelector('optgroup[label="فونت‌های سرور (پیش‌فرض)"]');
                if(!serverGroup) {
                    const defaultOpt = selectEl.querySelector('option[value=""]');
                    if(defaultOpt && (defaultOpt.innerText.includes('خالی') || defaultOpt.innerText.includes('لیست'))) {
                        defaultOpt.innerText = 'انتخاب فونت...';
                    }
                    serverGroup = document.createElement('optgroup');
                    serverGroup.label = "فونت‌های سرور (پیش‌فرض)";
                    selectEl.appendChild(serverGroup);
                } else {
                    serverGroup.innerHTML = '';
                }

                defaultFonts.forEach(font => {
                    window.serverFontsMap[font.name] = font.url;
                    const opt = document.createElement('option');
                    opt.value = 'server:' + font.name;
                    opt.text = font.name;
                    serverGroup.appendChild(opt);
                });

                if (showMsg && defaultFonts.length > 0) {
                    showMessage(`${defaultFonts.length} فونت پیش‌فرض بارگذاری شد.`, 'success');
                }
            } catch (err) {
                console.error('Error loading default fonts:', err);
                if (showMsg) showMessage('خطا در بارگذاری فونت‌های پیش‌فرض.', 'error');
            }
        };

        window.scanFontsFolder = async function() {
            try {
                const dirHandle = await window.showDirectoryPicker();
                
                const selectEl = document.getElementById('scannedFontSelect');
                window.localFontsMap = {};
                
                let localGroup = selectEl.querySelector('optgroup[label="پوشه محلی"]');
                if(localGroup) localGroup.remove();
                
                localGroup = document.createElement('optgroup');
                localGroup.label = "پوشه محلی";
                
                let foundCount = 0;
                
                for await (const entry of dirHandle.values()) {
                    if (entry.kind === 'file' && entry.name.match(/\.(ttf|otf|woff|woff2)$/i)) {
                        const file = await entry.getFile();
                        window.localFontsMap[entry.name] = file;
                        
                        const opt = document.createElement('option');
                        opt.value = entry.name;
                        opt.text = entry.name;
                        localGroup.appendChild(opt);
                        
                        foundCount++;
                    }
                }
                
                if (foundCount > 0) {
                    selectEl.appendChild(localGroup);
                    const defaultOpt = selectEl.querySelector('option[value=""]');
                    if(defaultOpt && (defaultOpt.innerText.includes('خالی') || defaultOpt.innerText.includes('لیست'))) {
                        defaultOpt.innerText = 'انتخاب فونت...';
                    }
                    showMessage(`${foundCount} فونت در پوشه پیدا شد.`, 'success');
                } else {
                    showMessage('هیچ فونتی با فرمت مجاز در این پوشه یافت نشد.', 'warning');
                }
                
            } catch (err) {
                console.error(err);
                if (err.name !== 'AbortError') {
                    showMessage('مرورگر شما از قابلیت اسکن پوشه پشتیبانی نمی‌کند یا دسترسی داده نشد.', 'error');
                }
            }
        };

        window.loadScannedFont = async function(selectEl) {
            const val = selectEl.value;
            if (!val) return;
            
            if (val.startsWith('server:')) {
                const fileName = val.replace('server:', '');
                const fileUrl = window.serverFontsMap[fileName];
                if (!fileUrl) return;
                
                try {
                    showMessage(`در حال دریافت ${fileName} از سرور...`, 'success');
                    const response = await fetch(fileUrl);
                    if (!response.ok) throw new Error('Network error');
                    const buffer = await response.arrayBuffer();
                    processFontBuffer(buffer, fileName);
                } catch(e) {
                    console.error(e);
                    showMessage('خطا در دریافت فونت از سرور.', 'error');
                }
            } else {
                const file = window.localFontsMap[val];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(evt) {
                        processFontBuffer(evt.target.result, val);
                    };
                    reader.readAsArrayBuffer(file);
                }
            }
        };

        document.getElementById('fontUpload').addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (!file) return;

            const selectEl = document.getElementById('scannedFontSelect');
            if (selectEl) selectEl.value = "";

            const reader = new FileReader();
            reader.onload = function(evt) {
                processFontBuffer(evt.target.result, file.name);
            };
            reader.readAsArrayBuffer(file);
        });

