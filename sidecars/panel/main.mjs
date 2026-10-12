import { existsSync, readdirSync, statSync, readFileSync } from 'node:fs';
import { dirname, join, resolve, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Response, SidecarApp } from 'sidecar_sdk';

const HERE = dirname(fileURLToPath(import.meta.url));
const app = new SidecarApp();

const readLocal = (name) => readFileSync(join(HERE, name), 'utf8');

// Servir archivos estáticos del frontend
app.page('/', () => readLocal('index.html'));
app.page('/app.js', () => readLocal('app.js'));
app.api('/styles.css', () => new Response(readLocal('styles.css'), { contentType: 'text/css' }), 'GET');

function getTypeDescription(isDirectory, ext) {
  if (isDirectory) return 'Carpeta de archivos';
  switch (ext) {
    case '.txt': return 'Documento de texto';
    case '.md': return 'Documento Markdown';
    case '.json': return 'Archivo JSON';
    case '.js':
    case '.mjs':
    case '.cjs': return 'Archivo JavaScript';
    case '.ts':
    case '.tsx': return 'Archivo TypeScript';
    case '.jsx': return 'Archivo React JSX';
    case '.html':
    case '.htm': return 'Documento HTML';
    case '.css':
    case '.scss':
    case '.sass': return 'Hoja de estilos CSS';
    case '.py': return 'Secuencia de comandos Python';
    case '.svg': return 'Imagen vectorial SVG';
    case '.png': return 'Imagen PNG';
    case '.jpg':
    case '.jpeg': return 'Imagen JPEG';
    case '.gif': return 'Imagen GIF';
    case '.webp': return 'Imagen WebP';
    case '.pdf': return 'Documento PDF';
    case '.zip':
    case '.tar':
    case '.gz':
    case '.7z':
    case '.rar': return 'Archivo comprimido';
    case '.xml':
    case '.yaml':
    case '.yml':
    case '.toml':
    case '.env': return 'Archivo de configuración';
    case '.sh':
    case '.bash': return 'Script de Shell';
    case '.bat':
    case '.cmd': return 'Archivo por lotes de Windows';
    case '.ps1': return 'Script de PowerShell';
    default:
      return ext ? `Archivo ${ext.slice(1).toUpperCase()}` : 'Archivo';
  }
}

// Endpoint para listar el contenido del directorio actual (estilo ventana de Windows, no recursivo)
app.api('/api/files', (data) => {
  let target = (data && data.folderPath) ? String(data.folderPath).trim() : '';

  if (target.startsWith('file://')) {
    try {
      target = fileURLToPath(target);
    } catch {
      target = target.replace(/^file:\/\/\/?/, '');
    }
  }

  if (!target) {
    target = process.cwd();
  }

  const resolved = resolve(target);

  if (!existsSync(resolved)) {
    return {
      success: false,
      error: `La carpeta no existe: ${resolved}`,
      currentPath: resolved,
      parentPath: null,
      items: []
    };
  }

  try {
    const parent = dirname(resolved) !== resolved ? dirname(resolved) : null;
    const entries = readdirSync(resolved, { withFileTypes: true });

    // Ordenamiento nativo de Windows: Carpetas primero, luego archivos, ambos alfabéticos
    entries.sort((a, b) => {
      if (a.isDirectory() && !b.isDirectory()) return -1;
      if (!a.isDirectory() && b.isDirectory()) return 1;
      return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
    });

    const items = [];
    const showHidden = Boolean(data?.showHidden);

    for (const entry of entries) {
      if (!showHidden && entry.name.startsWith('.') && entry.name !== '.gitignore' && entry.name !== '.env') {
        continue;
      }

      const fullPath = join(resolved, entry.name);
      const isDir = entry.isDirectory();
      const ext = isDir ? '' : extname(entry.name).toLowerCase();
      let size = 0;
      let modified = null;

      try {
        const st = statSync(fullPath);
        size = isDir ? 0 : st.size;
        modified = st.mtime.toISOString();
      } catch {}

      items.push({
        name: entry.name,
        fullPath,
        isDirectory: isDir,
        extension: ext,
        type: getTypeDescription(isDir, ext),
        size,
        modified
      });
    }

    return {
      success: true,
      currentPath: resolved,
      parentPath: parent,
      count: items.length,
      items
    };
  } catch (err) {
    return {
      success: false,
      error: err.message,
      currentPath: resolved,
      parentPath: null,
      items: []
    };
  }
});

app.run();
