# Syntalys CRM

Este será el CRM de Syntalys.

## Stack Tecnológico

- **Framework**: Next.js 15 con TypeScript
- **Estilos**: Tailwind CSS
- **Base de datos**: Supabase
- **Deploy**: Vercel

## Colores de Marca

- Azul Syntalys: `#03366d`
- Fondo: Blanco
- Textos: Negro

## Configuración

1. Instalar dependencias:
```bash
npm install
```

2. Configurar variables de entorno:
Crear archivo `.env.local` con las credenciales de Supabase.

3. Ejecutar en desarrollo:
```bash
npm run dev
```

## Estructura del Proyecto

```
/app          # Páginas y rutas de Next.js
/components   # Componentes reutilizables (incluye sidebar)
/lib          # Utilidades y configuraciones (Supabase client)
/public       # Archivos estáticos
/logos        # Logos de Syntalys
```
