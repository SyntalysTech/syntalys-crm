-- Script para crear la tabla clients en Supabase
-- Ejecuta esto en el SQL Editor de Supabase

-- Primero, eliminar la tabla si existe (opcional, solo si quieres empezar de cero)
DROP TABLE IF EXISTS public.clients CASCADE;

-- Crear la tabla clients
CREATE TABLE public.clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    contact_name TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_clients_user_id ON public.clients(user_id);
CREATE INDEX idx_clients_company_name ON public.clients(company_name);
CREATE INDEX idx_clients_status ON public.clients(status);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios solo pueden ver sus propios clientes
CREATE POLICY "Users can view their own clients"
    ON public.clients
    FOR SELECT
    USING (auth.uid() = public.clients.user_id);

-- Política: Los usuarios solo pueden insertar sus propios clientes
CREATE POLICY "Users can insert their own clients"
    ON public.clients
    FOR INSERT
    WITH CHECK (auth.uid() = public.clients.user_id);

-- Política: Los usuarios solo pueden actualizar sus propios clientes
CREATE POLICY "Users can update their own clients"
    ON public.clients
    FOR UPDATE
    USING (auth.uid() = public.clients.user_id)
    WITH CHECK (auth.uid() = public.clients.user_id);

-- Política: Los usuarios solo pueden eliminar sus propios clientes
CREATE POLICY "Users can delete their own clients"
    ON public.clients
    FOR DELETE
    USING (auth.uid() = public.clients.user_id);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.clients
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Comentario en la tabla
COMMENT ON TABLE public.clients IS 'Tabla de clientes del CRM';
