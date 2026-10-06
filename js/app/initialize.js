        function initializeApp() {
            loadDefaultFont();
            scanServerFontsFolder();
            
            // اعمال مقادیر اولیه روی رابط کاربری
            document.getElementById('inpAlphaDefault').value = charColorSettings.alphaDefault;
            previewColorSettings();
            
            currentData = defaultData;
            renderWorkbook(currentData);
        }

        if (document.readyState === 'complete') {
            initializeApp();
        } else {
            window.addEventListener('load', initializeApp, { once: true });
        }
