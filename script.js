document.addEventListener('DOMContentLoaded', function() {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const fileTree = document.getElementById('fileTree');
    const fileContent = document.getElementById('fileContent');
    let currentJar = null;

    // Handle drag and drop
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('highlight');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('highlight');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('highlight');
        
        if (e.dataTransfer.files.length) {
            handleFile(e.dataTransfer.files[0]);
        }
    });

    // Handle file input
    fileInput.addEventListener('change', (e) => {
        if (fileInput.files.length) {
            handleFile(fileInput.files[0]);
        }
    });

    function handleFile(file) {
        if (!file.name.endsWith('.jar') && !file.name.endsWith('.zip')) {
            alert('Please upload a JAR or ZIP file');
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                JSZip.loadAsync(e.target.result).then(function(zip) {
                    currentJar = zip;
                    displayFileTree(zip);
                });
            } catch (error) {
                alert('Error reading JAR file: ' + error.message);
            }
        };
        reader.readAsArrayBuffer(file);
    }

    function displayFileTree(zip) {
        fileTree.innerHTML = '';
        const files = [];
        
        zip.forEach(function(relativePath, file) {
            files.push({
                path: relativePath,
                isDirectory: file.dir,
                file: file
            });
        });

        // Sort directories first, then files
        files.sort((a, b) => {
            if (a.isDirectory && !b.isDirectory) return -1;
            if (!a.isDirectory && b.isDirectory) return 1;
            return a.path.localeCompare(b.path);
        });

        // Build the tree
        files.forEach(item => {
            const div = document.createElement('div');
            div.className = `tree-item ${item.isDirectory ? 'directory' : 'file'}`;
            div.textContent = item.path;
            div.addEventListener('click', () => displayFileContent(item));
            fileTree.appendChild(div);
        });
    }

    async function displayFileContent(item) {
        if (item.isDirectory) return;
        
        try {
            const content = await item.file.async('text');
            fileContent.textContent = content;
        } catch (error) {
            try {
                // Try binary data if text fails
                const content = await item.file.async('uint8array');
                fileContent.textContent = 'Binary file content:\n' + 
                    Array.from(content).map(b => b.toString(16).padStart(2, '0')).join(' ');
            } catch (e) {
                fileContent.textContent = `Could not display file content: ${error.message}`;
            }
        }
    }
});
