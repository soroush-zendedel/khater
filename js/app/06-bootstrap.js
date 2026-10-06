        window.onload = function() {
            loadDefaultFont();
            scanServerFontsFolder();
            
            // اعمال مقادیر اولیه روی رابط کاربری
            document.getElementById('inpAlphaDefault').value = charColorSettings.alphaDefault;
            previewColorSettings();
            
            currentData = defaultData;
            renderWorkbook(currentData);
        };
