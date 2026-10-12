const sidecar = window.sidecar;

const $ = (id) => document.getElementById(id);

let currentPath = '';
let parentPath = null;
let historyStack = [];
let historyIndex = -1;
let currentItems = [];
let selectedItem = null;

let sortColumn = 'name';
let sortDirection = 'asc';

// Mapeo de iconos estilo Windows
function getItemIcon(item) {
  if (item.isDirectory) return '📁';
  const ext = (item.extension || '').toLowerCase();
  switch (ext) {
    case '.js':
    case '.mjs':
    case '.cjs':
    case '.ts':
    case '.tsx':
    case '.jsx':
      return '📜';
    case '.json':
    case '.yaml':
    case '.yml':
    case '.toml':
    case '.env':
    case '.xml':
      return '⚙️';
    case '.md':
    case '.txt':
    case '.log':
      return '📝';
    case '.html':
    case '.htm':
      return '🌐';
    case '.css':
    case '.scss':
    case '.sass':
    case '.less':
      return '🎨';
    case '.png':
    case '.jpg':
    case '.jpeg':
    case '.gif':
    case '.svg':
    case '.webp':
    case '.ico':
      return '🖼️';
    case '.py':
      return '🐍';
    case '.sh':
    case '.bash':
    case '.bat':
    case '.cmd':
    case '.ps1':
      return '💻';
    case '.zip':
    case '.tar':
    case '.gz':
    case '.7z':
    case '.rar':
      return '📦';
    case '.pdf':
      return '📕';
    default:
      return '📄';
  }
}

// Formateo de fecha estilo Windows: DD/MM/AAAA HH:MM
function formatDate(isoStr) {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  if (isNaN(d.getTime())) return '';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

// Formateo de tamaño de archivo estilo Windows (en KB o MB)
function formatSize(bytes, isDirectory) {
  if (isDirectory) return '';
  if (bytes === 0) return '0 KB';
  if (!bytes) return '';
  const kb = Math.ceil(bytes / 1024);
  if (kb < 1024) {
    return `${kb.toLocaleString()} KB`;
  }
  const mb = (bytes / (1024 * 1024)).toFixed(1);
  return `${mb} MB`;
}

let toastTimer;
function showToast(message, isError = false) {
  const el = $('toast');
  el.textContent = message;
  el.className = isError ? 'toast error' : 'toast';
  el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.hidden = true; }, 3000);
}

// Navegar a una carpeta
async function navigateTo(targetPath, pushToHistory = true) {
  $('loadingIndicator').hidden = false;
  $('emptyMessage').hidden = true;
  $('itemList').innerHTML = '';
  selectedItem = null;
  updateStatusBar();

  try {
    const res = await sidecar.fetch('/api/files', {
      method: 'POST',
      body: JSON.stringify({ folderPath: targetPath || '' })
    });

    const data = await res.json();
    $('loadingIndicator').hidden = true;

    if (!data.success) {
      showToast(data.error || 'No se pudo abrir la carpeta', true);
      $('emptyMessage').hidden = false;
      $('emptyText').textContent = data.error || 'Ruta inaccesible.';
      return;
    }

    currentPath = data.currentPath;
    parentPath = data.parentPath;
    currentItems = data.items || [];

    $('addressInput').value = currentPath;
    $('btnUp').disabled = !parentPath;

    if (pushToHistory) {
      if (historyIndex < historyStack.length - 1) {
        historyStack = historyStack.slice(0, historyIndex + 1);
      }
      historyStack.push(currentPath);
      historyIndex = historyStack.length - 1;
    }

    $('btnBack').disabled = (historyIndex <= 0);

    renderItems();
  } catch (err) {
    $('loadingIndicator').hidden = true;
    $('emptyMessage').hidden = false;
    showToast(`Error de conexión: ${err.message}`, true);
  }
}

// Ordenar elementos
function getSortedItems(items) {
  const sorted = [...items];
  const query = $('searchInput').value.trim().toLowerCase();

  const filtered = query
    ? sorted.filter(item => item.name.toLowerCase().includes(query))
    : sorted;

  filtered.sort((a, b) => {
    // Windows siempre mantiene las carpetas agrupadas al principio
    if (a.isDirectory && !b.isDirectory) return -1;
    if (!a.isDirectory && b.isDirectory) return 1;

    let valA, valB;
    switch (sortColumn) {
      case 'date':
        valA = a.modified ? new Date(a.modified).getTime() : 0;
        valB = b.modified ? new Date(b.modified).getTime() : 0;
        break;
      case 'type':
        valA = a.type || '';
        valB = b.type || '';
        break;
      case 'size':
        valA = a.size || 0;
        valB = b.size || 0;
        break;
      case 'name':
      default:
        valA = a.name.toLowerCase();
        valB = b.name.toLowerCase();
        break;
    }

    if (typeof valA === 'string') {
      return sortDirection === 'asc'
        ? valA.localeCompare(valB, undefined, { numeric: true, sensitivity: 'base' })
        : valB.localeCompare(valA, undefined, { numeric: true, sensitivity: 'base' });
    }

    return sortDirection === 'asc' ? (valA - valB) : (valB - valA);
  });

  return filtered;
}

// Renderizar filas de la tabla
function renderItems() {
  const items = getSortedItems(currentItems);
  const listEl = $('itemList');
  listEl.innerHTML = '';

  if (items.length === 0) {
    $('emptyMessage').hidden = false;
    $('emptyText').textContent = $('searchInput').value.trim()
      ? 'No se encontraron coincidencias.'
      : 'Esta carpeta está vacía.';
    updateStatusBar();
    return;
  }

  $('emptyMessage').hidden = true;
  const fragment = document.createDocumentFragment();

  for (const item of items) {
    const row = document.createElement('li');
    row.className = `file-row ${item.isDirectory ? 'is-folder' : 'is-file'}`;
    if (selectedItem && selectedItem.fullPath === item.fullPath) {
      row.classList.add('selected');
    }

    // Columna Nombre
    const colName = document.createElement('div');
    colName.className = 'col col-name';

    const icon = document.createElement('span');
    icon.className = 'item-icon';
    icon.textContent = getItemIcon(item);

    const nameText = document.createElement('span');
    nameText.className = 'item-title';
    nameText.textContent = item.name;

    colName.appendChild(icon);
    colName.appendChild(nameText);

    // Columna Fecha
    const colDate = document.createElement('div');
    colDate.className = 'col col-date';
    colDate.textContent = formatDate(item.modified);

    // Columna Tipo
    const colType = document.createElement('div');
    colType.className = 'col col-type';
    colType.textContent = item.type;

    // Columna Tamaño
    const colSize = document.createElement('div');
    colSize.className = 'col col-size';
    colSize.textContent = formatSize(item.size, item.isDirectory);

    row.appendChild(colName);
    row.appendChild(colDate);
    row.appendChild(colType);
    row.appendChild(colSize);

    // Selección simple (un clic)
    row.addEventListener('click', (e) => {
      e.stopPropagation();
      document.querySelectorAll('.file-row.selected').forEach(el => el.classList.remove('selected'));
      row.classList.add('selected');
      selectedItem = item;
      updateStatusBar();
    });

    // Abrir carpeta (doble clic o clic en carpeta)
    if (item.isDirectory) {
      row.addEventListener('dblclick', () => {
        navigateTo(item.fullPath);
      });
    }

    fragment.appendChild(row);
  }

  listEl.appendChild(fragment);
  updateStatusBar();
}

// Barra de estado
function updateStatusBar() {
  const dirs = currentItems.filter(i => i.isDirectory).length;
  const files = currentItems.filter(i => !i.isDirectory).length;
  $('statusCount').textContent = `${currentItems.length} elementos (${dirs} ${dirs === 1 ? 'carpeta' : 'carpetas'}, ${files} ${files === 1 ? 'archivo' : 'archivos'})`;

  if (selectedItem) {
    if (selectedItem.isDirectory) {
      $('statusSelected').textContent = `1 carpeta seleccionada: ${selectedItem.name}`;
    } else {
      $('statusSelected').textContent = `1 elemento seleccionado: ${selectedItem.name} (${formatSize(selectedItem.size, false)})`;
    }
  } else {
    $('statusSelected').textContent = '';
  }
}

// Configurar ordenación en columnas
function setSort(column) {
  if (sortColumn === column) {
    sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
  } else {
    sortColumn = column;
    sortDirection = 'asc';
  }

  const icons = {
    name: $('sortNameIcon'),
    date: $('sortDateIcon'),
    type: $('sortTypeIcon'),
    size: $('sortSizeIcon')
  };

  for (const [key, iconEl] of Object.entries(icons)) {
    if (key === sortColumn) {
      iconEl.textContent = sortDirection === 'asc' ? '▲' : '▼';
    } else {
      iconEl.textContent = '';
    }
  }

  renderItems();
}

function init() {
  if (!sidecar) {
    showToast('Inicia Antigravity para usar esta extensión', true);
    return;
  }

  // Botón Atrás
  $('btnBack').addEventListener('click', () => {
    if (historyIndex > 0) {
      historyIndex--;
      const prevPath = historyStack[historyIndex];
      navigateTo(prevPath, false);
      $('btnBack').disabled = (historyIndex <= 0);
    }
  });

  // Botón Subir nivel
  $('btnUp').addEventListener('click', () => {
    if (parentPath) {
      navigateTo(parentPath);
    }
  });

  // Botón Refrescar
  $('btnRefresh').addEventListener('click', () => {
    navigateTo(currentPath, false);
  });

  // Barra de dirección (presionar Enter o hacer clic en botón Ir)
  $('addressInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      navigateTo($('addressInput').value.trim());
    }
  });

  $('btnGo').addEventListener('click', () => {
    navigateTo($('addressInput').value.trim());
  });

  // Búsqueda en tiempo real
  $('searchInput').addEventListener('input', renderItems);

  // Deseleccionar al hacer clic en fondo vacío
  $('fileView').addEventListener('click', () => {
    document.querySelectorAll('.file-row.selected').forEach(el => el.classList.remove('selected'));
    selectedItem = null;
    updateStatusBar();
  });

  // Columnas ordenables
  $('sortName').addEventListener('click', () => setSort('name'));
  $('sortDate').addEventListener('click', () => setSort('date'));
  $('sortType').addEventListener('click', () => setSort('type'));
  $('sortSize').addEventListener('click', () => setSort('size'));

  // Cargar ruta inicial del workspace
  if (typeof sidecar.getWorkspaceUris === 'function') {
    sidecar.getWorkspaceUris().then(uris => {
      if (uris && uris.length > 0) {
        navigateTo(uris[0]);
      } else {
        navigateTo('');
      }
    }).catch(() => {
      navigateTo('');
    });
  } else {
    navigateTo('');
  }
}

init();
