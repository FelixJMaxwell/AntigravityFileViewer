# Antigravity File Viewer (Visor de Archivos)

Extensión de interfaz de usuario (**UI Extension**) para Google Antigravity Agent que añade un panel lateral interactivo estilo **Explorador de Windows** para revisar archivos y carpetas del proyecto sin tener que abrirlos en el editor.

![Logo](assets/logo.svg)

## Características

- 📁 **Navegación tipo Explorador de Windows:** Explora carpetas haciendo doble clic sobre ellas y navega con los botones de *Atrás*, *Subir nivel* o *Actualizar*.
- 📍 **Barra de direcciones:** Visualiza y navega a cualquier ruta de tu disco de forma directa.
- 🔍 **Búsqueda instantánea:** Filtra archivos por nombre o extensión en tiempo real.
- 📊 **Detalles de archivos:** Muestra fecha de modificación, tipo de archivo y tamaño (KB / MB).
- 👁️ **Inspección sin abrir:** Al seleccionar cualquier archivo con un clic, la barra de estado inferior muestra sus metadatos sin abrir el archivo en el editor de código.
- 🎨 **Tema adaptativo:** Se integra con el modo oscuro y claro de Antigravity automáticamente.

---

## Estructura del repositorio

```text
AntigravityFileViewer/
├── LICENSE                   # Licencia MIT
├── README.md                 # Documentación e información legal
├── plugin.json               # Manifiesto del plugin
├── assets/
│   └── logo.svg              # Icono de la extensión
└── sidecars/
    └── panel/
        ├── sidecar.json      # Configuración del proceso auxiliar
        ├── package.json      # Configuración ES Module
        ├── main.mjs          # Servidor backend en Node.js
        ├── index.html        # Interfaz de usuario
        ├── app.js            # Lógica y navegación en el frontend
        └── styles.css        # Estilos del panel
```

---

## Instalación

No requiere ejecutar `npm install` ni compilar dependencias. Antigravity incluye su propio entorno Node.js y el SDK de sidecars.

### Opción 1: Instalación global (En tu computadora)

Clona este repositorio directamente en la carpeta de plugins de Antigravity:

**En Windows (PowerShell):**
```powershell
git clone https://github.com/<tu-usuario>/AntigravityFileViewer.git "$env:USERPROFILE\.gemini\config\plugins\project-files"
```

**En macOS o Linux:**
```bash
git clone https://github.com/<tu-usuario>/AntigravityFileViewer.git ~/.gemini/config/plugins/project-files
```

### Opción 2: Instalación por proyecto (Para compartir en un repositorio)

Copia esta carpeta dentro de la raíz de cualquier proyecto en la ruta `.agents/plugins/project-files`:

```text
mi-proyecto/
└── .agents/
    └── plugins/
        └── project-files/
```

---

## Cómo usarlo

1. Abre o reinicia Antigravity.
2. Ve a la página de **Customizations** en el menú izquierdo -> pestaña **Installed**.
3. Asegúrate de que el plugin **Visor de Archivos del Proyecto** esté activado.
4. En cualquier conversación, abre el menú de opciones **⋮** (tres puntos) en la esquina superior derecha y selecciona la extensión para abrirla en el panel lateral.

---

## 🔒 Privacidad y Seguridad

- **Sin telemetría ni recopilación de datos:** Esta extensión no recopila, envía ni almacena ningún tipo de información personal, historial de carpetas ni telemetría en servidores remotos.
- **Funcionamiento 100% local:** Toda la ejecución se procesa localmente en la máquina del usuario mediante el entorno Node.js provisto por Antigravity.
- **Ámbito de permisos:** La extensión opera con los permisos de lectura del usuario local en el sistema operativo.

---

## ⚖️ Aviso sobre Marcas Registradas (Trademark Disclaimer)

Este proyecto es un desarrollo independiente de código abierto y **no** está afiliado, respaldado, certificado, patrocinado ni mantenido por **Google LLC**, **Alphabet Inc.**, **Microsoft Corporation**, ni ninguna de sus filiales.

- **Google** y **Antigravity** (o *Google Antigravity Agent*) son marcas comerciales o registradas de Google LLC.
- **Windows**, **Windows Explorer** y **PowerShell** son marcas comerciales o registradas de Microsoft Corporation.
- **macOS** y **Apple** son marcas comerciales de Apple Inc.
- **Linux** es una marca comercial registrada de Linus Torvalds.

Todas las marcas registradas, logotipos y nombres comerciales utilizados en este repositorio se mencionan únicamente con fines descriptivos, informativos y de identificación de compatibilidad (*Nominative Fair Use*), sin que ello implique asociación, respaldo o patrocinio comercial alguno.

---

## 🛡️ Exclusión de Garantías y Responsabilidad (Warranty & Liability Disclaimer)

EL PRESENTE SOFTWARE SE SUMINISTRA "TAL CUAL" (*AS IS*), SIN GARANTÍA DE NINGÚN TIPO, YA SEA EXPRESA O IMPLÍCITA, INCLUYENDO, SIN LIMITACIÓN, LAS GARANTÍAS DE COMERCIABILIDAD, IDONEIDAD PARA UN PROPÓSITO ESPECÍFICO Y NO INFRACCIÓN.

EN NINGÚN CASO EL AUTOR O LOS TITULARES DE LOS DERECHOS DE AUTOR SERÁN RESPONSABLES POR DAÑOS DIRECTOS, INDIRECTOS, INCIDENTALES, ESPECIALES O CONSECUENTES (INCLUYENDO PÉRDIDA DE DATOS O INTERRUPCIÓN DEL NEGOCIO) DERIVADOS DEL USO O DE LA IMPOSIBILIDAD DE USO DE ESTE SOFTWARE.

---

## 📄 Licencia

Este proyecto está bajo la Licencia **MIT**. Consulta el archivo [LICENSE](LICENSE) para más detalles.
