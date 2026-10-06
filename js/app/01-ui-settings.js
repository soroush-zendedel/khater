        function showMessage(msg, type = 'success') {
            const msgBox = document.getElementById('messageBox');
            msgBox.innerText = msg;
            
            if (type === 'error') {
                msgBox.className = 'fixed bottom-6 right-6 px-6 py-3 rounded-lg shadow-xl text-white font-medium z-50 bg-red-500 show';
            } else if (type === 'warning') {
                msgBox.className = 'fixed bottom-6 right-6 px-6 py-3 rounded-lg shadow-xl text-slate-800 font-medium z-50 bg-yellow-400 show';
            } else {
                msgBox.className = 'fixed bottom-6 right-6 px-6 py-3 rounded-lg shadow-xl text-white font-medium z-50 bg-emerald-500 show';
            }
            
            setTimeout(() => {
                msgBox.classList.remove('show');
                msgBox.classList.add('opacity-0');
            }, 3000);
        }

        // تبدیل هگز به شیء حاوی اعداد رنگی (جهت پشتیبانی از متغیرهای CSS به صورت تفکیک‌شده)
        function hexToRgb(hex) {
            let r = parseInt(hex.slice(1, 3), 16),
                g = parseInt(hex.slice(3, 5), 16),
                b = parseInt(hex.slice(5, 7), 16);
            return {r, g, b};
        }

        function openColorSettingsModal() {
            document.getElementById('inpColor1').value = charColorSettings.color1;
            document.getElementById('inpAlpha1').value = charColorSettings.alpha1;
            document.getElementById('inpColor2').value = charColorSettings.color2;
            document.getElementById('inpAlpha2').value = charColorSettings.alpha2;
            document.getElementById('inpAlphaDefault').value = charColorSettings.alphaDefault;
            
            document.getElementById('lblAlpha1').innerText = Math.round(charColorSettings.alpha1 * 100) + '%';
            document.getElementById('lblAlpha2').innerText = Math.round(charColorSettings.alpha2 * 100) + '%';
            document.getElementById('lblAlphaDefault').innerText = Math.round(charColorSettings.alphaDefault * 100) + '%';

            // نمایش هوشمند پنل‌ها بر اساس وضعیت تفکیک رنگی
            if (metricVisibility.charColors) {
                document.getElementById('alternatingColorsSettings').style.display = 'block';
                document.getElementById('defaultOpacitySettings').style.display = 'none';
                document.getElementById('colorModalDesc').innerText = 'رنگ و میزان شفافیت را برای تشخیص بهتر مرز حروف در جملات تمرینی تغییر دهید.';
            } else {
                document.getElementById('alternatingColorsSettings').style.display = 'none';
                document.getElementById('defaultOpacitySettings').style.display = 'block';
                document.getElementById('colorModalDesc').innerText = 'میزان شفافیت (Opacity) متن تمرین را در حالت یکپارچه تنظیم کنید.';
            }

            const modal = document.getElementById('colorSettingsModal');
            const modalContent = document.getElementById('colorSettingsModalContent');
            modal.classList.remove('opacity-0', 'pointer-events-none');
            modalContent.classList.remove('scale-95');
        }

        function previewColorSettings() {
            charColorSettings.color1 = document.getElementById('inpColor1').value;
            charColorSettings.alpha1 = parseFloat(document.getElementById('inpAlpha1').value);
            charColorSettings.color2 = document.getElementById('inpColor2').value;
            charColorSettings.alpha2 = parseFloat(document.getElementById('inpAlpha2').value);
            charColorSettings.alphaDefault = parseFloat(document.getElementById('inpAlphaDefault').value);

            document.getElementById('lblAlpha1').innerText = Math.round(charColorSettings.alpha1 * 100) + '%';
            document.getElementById('lblAlpha2').innerText = Math.round(charColorSettings.alpha2 * 100) + '%';
            document.getElementById('lblAlphaDefault').innerText = Math.round(charColorSettings.alphaDefault * 100) + '%';

            // تبدیل هگز به RGB برای به‌روزرسانی متغیرهای CSS
            const c1 = hexToRgb(charColorSettings.color1);
            const c2 = hexToRgb(charColorSettings.color2);

            // آپدیت سریع متغیرهای CSS به صورت زنده
            document.documentElement.style.setProperty('--c1-r', c1.r);
            document.documentElement.style.setProperty('--c1-g', c1.g);
            document.documentElement.style.setProperty('--c1-b', c1.b);
            document.documentElement.style.setProperty('--alpha-1', charColorSettings.alpha1);
            
            document.documentElement.style.setProperty('--c2-r', c2.r);
            document.documentElement.style.setProperty('--c2-g', c2.g);
            document.documentElement.style.setProperty('--c2-b', c2.b);
            document.documentElement.style.setProperty('--alpha-2', charColorSettings.alpha2);
            
            document.documentElement.style.setProperty('--alpha-default', charColorSettings.alphaDefault);
        }

        function resetColorSettings() {
            document.getElementById('inpColor1').value = '#0f172a';
            document.getElementById('inpAlpha1').value = 0.35;
            document.getElementById('inpColor2').value = '#0f172a';
            document.getElementById('inpAlpha2').value = 0.08;
            document.getElementById('inpAlphaDefault').value = 0.18;
            previewColorSettings();
        }

        function closeColorSettingsModal() {
            document.getElementById('colorSettingsModal').classList.add('opacity-0', 'pointer-events-none');
            document.getElementById('colorSettingsModalContent').classList.add('scale-95');
        }

        async function loadDefaultFont() {
            
            const fontUrl = './fonts/Vazirmatn-Regular.ttf';
            
            try {
                const response = await fetch(fontUrl);
                // اگر سرور چیزی غیر از 200 برگرداند، خطا تولید کن
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                
                const buffer = await response.arrayBuffer();
                defaultParsedFont = opentype.parse(buffer);
                
            } catch (err) {
                console.error("خطا در بارگذاری فونت پیش‌فرض:", err);
            }
        }

        function togglePrintMode() {
            isBwModeActive = !isBwModeActive;
            const pdfContent = document.getElementById('pdf-content');
            const btnText = document.getElementById('bwBtnText');
            const toggleBtn = document.getElementById('toggleBwBtn');
            
            if (isBwModeActive) {
                pdfContent.classList.add('bw-mode');
                btnText.innerText = 'چاپ: سیاه و سفید';
                toggleBtn.classList.replace('bg-slate-800', 'bg-zinc-800');
                toggleBtn.classList.replace('hover:bg-slate-700', 'hover:bg-zinc-700');
            } else {
                pdfContent.classList.remove('bw-mode');
                btnText.innerText = 'چاپ: رنگی';
                toggleBtn.classList.replace('bg-zinc-800', 'bg-slate-800');
                toggleBtn.classList.replace('hover:bg-zinc-700', 'hover:bg-slate-700');
            }
        }

