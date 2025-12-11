# Syntalys CRM - Build de Aplicación de Escritorio

Este proyecto usa **Tauri v2** para generar instaladores de escritorio para Windows.

## Requisitos

- Node.js 18+
- Rust (rustc y cargo)
- Visual Studio Build Tools (para Windows)

## Estructura

```
src-tauri/
├── Cargo.toml          # Configuración de Rust
├── tauri.conf.json     # Configuración de Tauri
├── icons/              # Iconos de la aplicación
│   ├── icon.ico        # Icono principal (Windows)
│   ├── icon.png        # Icono PNG 256x256
│   ├── 32x32.png
│   ├── 64x64.png
│   ├── 128x128.png
│   └── ...
└── src/
    ├── main.rs
    └── lib.rs
```

## Comandos

### Desarrollo
```bash
npm run tauri:dev
```
Inicia Next.js en modo desarrollo y abre la ventana de Tauri apuntando a `localhost:3000`.

### Build de producción
```bash
npm run tauri:build
```
Genera los instaladores en `src-tauri/target/release/bundle/`:
- `nsis/Syntalys CRM_X.X.X_x64-setup.exe` - Instalador NSIS
- `msi/Syntalys CRM_X.X.X_x64_en-US.msi` - Instalador MSI

## Configuración (tauri.conf.json)

### URL de la aplicación
La app carga una URL externa en producción:
```json
"app": {
  "windows": [{
    "url": "https://syntalys-crm.vercel.app",
    "width": 1400,
    "height": 900
  }]
}
```

Para cambiar la URL, editar `src-tauri/tauri.conf.json` línea 14.

### Versión
Cambiar en `src-tauri/tauri.conf.json`:
```json
"version": "0.1.0"
```

### Iconos
Los iconos están en `src-tauri/icons/`. Para regenerarlos desde el logo original:
```bash
node scripts/generate-rounded-icon.js
```

Esto usa `public/logos/syntalys-desktop-icon.png` como fuente y genera todos los tamaños necesarios con fondo blanco.

## Generación de Iconos

Si necesitas cambiar el icono:

1. Coloca el nuevo icono en `public/logos/syntalys-desktop-icon.png`
2. Ejecuta:
```bash
node scripts/generate-rounded-icon.js
```
3. Reconstruye:
```bash
npm run tauri:build
```

El script genera:
- `icon.ico` - Para Windows (múltiples tamaños embebidos)
- `icon.png` - PNG 256x256
- Varios tamaños para Windows Store
- Iconos con fondo blanco sólido

## Solución de Problemas

### El icono no aparece en el escritorio
1. Desinstalar la aplicación completamente
2. Limpiar caché de iconos de Windows (PowerShell):
```powershell
Remove-Item "$env:LOCALAPPDATA\IconCache.db" -Force -ErrorAction SilentlyContinue
Remove-Item "$env:LOCALAPPDATA\Microsoft\Windows\Explorer\iconcache*" -Force -ErrorAction SilentlyContinue
Stop-Process -Name explorer -Force; Start-Process explorer
```
3. Reinstalar la aplicación

### Error "Acceso denegado" al hacer build
Cerrar cualquier instancia de Syntalys CRM antes de hacer build.

### Build limpio (si hay problemas)
```bash
# Limpiar caché de Rust
cargo clean --manifest-path src-tauri/Cargo.toml

# Rebuild completo
npm run tauri:build
```

## Tamaño del Instalador

- **NSIS**: ~2 MB
- **MSI**: ~2 MB

Tauri es mucho más ligero que Electron (~160 MB) porque usa WebView2 nativo de Windows.

## Notas

- La aplicación requiere conexión a internet ya que carga la web de Vercel
- WebView2 viene preinstalado en Windows 10/11
- Los instaladores no están firmados digitalmente (puede mostrar advertencia de Windows)
