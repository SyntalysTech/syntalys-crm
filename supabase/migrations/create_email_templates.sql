-- Email Templates Table
-- Stores email templates for various purposes

-- Create template category enum
CREATE TYPE template_category AS ENUM (
  'sales',           -- Sales outreach
  'follow_up',       -- Follow-up emails
  'onboarding',      -- Client onboarding
  'support',         -- Customer support
  'invoice',         -- Invoice related
  'reminder',        -- Payment/meeting reminders
  'newsletter',      -- Newsletter templates
  'other'            -- Other templates
);

-- Create the templates table
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Basic info
  name VARCHAR(255) NOT NULL,
  name_fr VARCHAR(255),
  subject VARCHAR(500) NOT NULL,
  subject_fr VARCHAR(500),
  body TEXT NOT NULL,
  body_fr TEXT,

  -- Categorization
  category template_category NOT NULL DEFAULT 'other',

  -- Variables/placeholders info
  variables TEXT[],                    -- Array of variable names like {client_name}, {company}

  -- Metadata
  is_active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES profiles(id),

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_templates_category ON email_templates(category);
CREATE INDEX idx_templates_is_active ON email_templates(is_active);
CREATE INDEX idx_templates_created_by ON email_templates(created_by);

-- RLS Policies
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can view templates
CREATE POLICY "Users can view templates"
  ON email_templates FOR SELECT
  TO authenticated
  USING (true);

-- Only super_admin and admin can insert/update/delete
CREATE POLICY "Admins can manage templates"
  ON email_templates FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('super_admin', 'admin')
    )
  );

-- Insert example templates (Spanish as main, French as translation)
INSERT INTO email_templates (name, name_fr, subject, subject_fr, body, body_fr, category, variables) VALUES

-- Sales templates
('Primer Contacto', 'Premier contact',
 'Presentacion de los servicios de Syntalys',
 'Presentation des services Syntalys',
 'Estimado/a {nombre_cliente},

Espero que este mensaje le encuentre bien. Mi nombre es {nombre_remitente} de Syntalys.

Me pongo en contacto para presentarle nuestros servicios que podrian ayudar a {nombre_empresa} a alcanzar sus objetivos de transformacion digital.

Estamos especializados en:
- Soluciones de IA y automatizacion
- Desarrollo de software a medida
- Aplicaciones web y moviles
- Ciberseguridad

Estaria disponible para una breve llamada esta semana para hablar de como podemos ayudarle?

Un cordial saludo,
{nombre_remitente}
Syntalys',
 'Cher/Chere {nombre_cliente},

J''espere que ce message vous trouve bien. Je suis {nombre_remitente} de Syntalys.

Je souhaitais vous presenter nos services qui pourraient aider {nombre_empresa} a atteindre ses objectifs de transformation numerique.

Nous sommes specialises dans :
- Solutions IA et automatisation
- Developpement logiciel sur mesure
- Applications web et mobiles
- Cybersecurite

Seriez-vous disponible pour un bref appel cette semaine pour en discuter ?

Cordialement,
{nombre_remitente}
Syntalys',
 'sales',
 ARRAY['nombre_cliente', 'nombre_remitente', 'nombre_empresa']),

-- Follow-up template
('Seguimiento tras Reunion', 'Suivi apres reunion',
 'Seguimiento de nuestra conversacion',
 'Suite a notre conversation',
 'Hola {nombre_cliente},

Gracias por tomarse el tiempo de reunirse conmigo el {fecha_reunion}. Fue un placer conocer mas sobre {nombre_empresa} y sus necesidades.

Como comentamos, le adjunto {descripcion_adjunto} para su revision.

No dude en contactarme si tiene alguna pregunta o si desea programar una llamada de seguimiento.

Un cordial saludo,
{nombre_remitente}',
 'Bonjour {nombre_cliente},

Merci d''avoir pris le temps de me rencontrer le {fecha_reunion}. C''etait un plaisir d''en apprendre plus sur {nombre_empresa} et vos besoins.

Comme convenu, je vous joins {descripcion_adjunto} pour votre examen.

N''hesitez pas a me contacter si vous avez des questions ou si vous souhaitez planifier un appel de suivi.

Cordialement,
{nombre_remitente}',
 'follow_up',
 ARRAY['nombre_cliente', 'fecha_reunion', 'nombre_empresa', 'descripcion_adjunto', 'nombre_remitente']),

-- Onboarding template
('Bienvenida Nuevo Cliente', 'Bienvenue nouveau client',
 'Bienvenido a Syntalys - Primeros pasos',
 'Bienvenue chez Syntalys - Pour commencer',
 'Estimado/a {nombre_cliente},

Bienvenido a Syntalys! Estamos encantados de tener a {nombre_empresa} como nuevo cliente.

Su proyecto "{nombre_proyecto}" ya esta oficialmente en marcha. Estos son los proximos pasos:

1. Su gestor de proyecto dedicado, {nombre_gestor}, se pondra en contacto con usted en las proximas 24 horas
2. Programaremos una reunion de inicio para alinear objetivos y calendario
3. Recibira acceso a nuestro portal de clientes para el seguimiento del proyecto

Si tiene alguna pregunta inmediata, no dude en ponerse en contacto con nosotros.

Bienvenido a bordo!

El equipo de Syntalys',
 'Cher/Chere {nombre_cliente},

Bienvenue chez Syntalys ! Nous sommes ravis d''accueillir {nombre_empresa} parmi nos clients.

Votre projet "{nombre_proyecto}" est officiellement lance. Voici les prochaines etapes :

1. Votre chef de projet dedie, {nombre_gestor}, vous contactera dans les 24 heures
2. Nous planifierons une reunion de lancement pour aligner les objectifs et le calendrier
3. Vous recevrez un acces a notre portail client pour le suivi du projet

Si vous avez des questions immediates, n''hesitez pas a nous contacter.

Bienvenue a bord !

L''equipe Syntalys',
 'onboarding',
 ARRAY['nombre_cliente', 'nombre_empresa', 'nombre_proyecto', 'nombre_gestor']),

-- Invoice reminder
('Recordatorio de Pago', 'Rappel de paiement',
 'Factura #{numero_factura} - Recordatorio de pago',
 'Facture #{numero_factura} - Rappel de paiement',
 'Estimado/a {nombre_cliente},

Este es un recordatorio amable de que la factura #{numero_factura} por {importe} {moneda} vence el {fecha_vencimiento}.

Si ya ha realizado el pago, por favor ignore este mensaje.

Para su comodidad, puede pagar mediante:
- Transferencia bancaria (datos adjuntos)
- Tarjeta de credito a traves de nuestro portal de pagos

Si tiene alguna pregunta sobre esta factura, no dude en contactarnos.

Un cordial saludo,
Equipo de Finanzas de Syntalys',
 'Cher/Chere {nombre_cliente},

Ceci est un rappel amical que la facture #{numero_factura} d''un montant de {importe} {moneda} est due le {fecha_vencimiento}.

Si vous avez deja effectue le paiement, veuillez ignorer ce message.

Pour votre commodite, vous pouvez payer par :
- Virement bancaire (coordonnees jointes)
- Carte de credit via notre portail de paiement

Si vous avez des questions concernant cette facture, n''hesitez pas a nous contacter.

Cordialement,
L''equipe Finance Syntalys',
 'reminder',
 ARRAY['nombre_cliente', 'numero_factura', 'importe', 'moneda', 'fecha_vencimiento']),

-- Project update
('Actualizacion de Proyecto', 'Mise a jour du projet',
 'Actualizacion del proyecto: {nombre_proyecto}',
 'Mise a jour du projet : {nombre_proyecto}',
 'Hola {nombre_cliente},

Aqui tiene su actualizacion semanal sobre {nombre_proyecto}:

Progreso: {porcentaje_progreso}% completado

Completado esta semana:
{tareas_completadas}

Planificado para la proxima semana:
{tareas_planificadas}

{seccion_bloqueos}

Por favor, hagame saber si tiene alguna pregunta o inquietud.

Un cordial saludo,
{nombre_gestor}',
 'Bonjour {nombre_cliente},

Voici votre mise a jour hebdomadaire sur {nombre_proyecto} :

Progression : {porcentaje_progreso}% complete

Realise cette semaine :
{tareas_completadas}

Prevu pour la semaine prochaine :
{tareas_planificadas}

{seccion_bloqueos}

N''hesitez pas a me contacter si vous avez des questions ou preoccupations.

Cordialement,
{nombre_gestor}',
 'other',
 ARRAY['nombre_cliente', 'nombre_proyecto', 'porcentaje_progreso', 'tareas_completadas', 'tareas_planificadas', 'seccion_bloqueos', 'nombre_gestor']);

-- Create function to update updated_at
CREATE OR REPLACE FUNCTION update_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_email_templates_updated_at
  BEFORE UPDATE ON email_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_templates_updated_at();
