-- Syntalys Services Table
-- Stores the catalog of services offered by Syntalys

-- Create service categories enum
CREATE TYPE service_category AS ENUM (
  'enterprise',      -- For enterprises/PME
  'pme'              -- For SMB/independents
);

-- Create service status enum
CREATE TYPE service_status AS ENUM (
  'available',       -- Currently available
  'coming_soon',     -- Coming soon
  'discontinued'     -- No longer offered
);

-- Create the services table
CREATE TABLE IF NOT EXISTS syntalys_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Basic info
  name VARCHAR(255) NOT NULL,
  name_fr VARCHAR(255),
  description TEXT,
  description_fr TEXT,
  icon VARCHAR(100),                    -- Icon identifier (e.g., 'robot', 'code', 'shield')

  -- Categorization
  category service_category NOT NULL DEFAULT 'pme',

  -- Pricing
  price_min DECIMAL(10, 2),             -- Minimum price
  price_max DECIMAL(10, 2),             -- Maximum price (for ranges)
  currency VARCHAR(3) DEFAULT 'CHF',
  price_type VARCHAR(50),               -- 'fixed', 'hourly', 'monthly', 'custom', 'from'
  price_note TEXT,                      -- Additional pricing notes
  price_note_fr TEXT,

  -- Commissions
  commission_percentage DECIMAL(5, 2),  -- Commission percentage for sales
  commission_notes TEXT,

  -- Availability
  status service_status DEFAULT 'available',
  delivery_time VARCHAR(100),           -- e.g., "2-4 weeks", "1 month"
  delivery_time_fr VARCHAR(100),

  -- Order and visibility
  display_order INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  is_visible BOOLEAN DEFAULT true,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_services_category ON syntalys_services(category);
CREATE INDEX idx_services_status ON syntalys_services(status);
CREATE INDEX idx_services_display_order ON syntalys_services(display_order);

-- RLS Policies
ALTER TABLE syntalys_services ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can view services
CREATE POLICY "Users can view services"
  ON syntalys_services FOR SELECT
  TO authenticated
  USING (true);

-- Only super_admin and admin can insert/update/delete
CREATE POLICY "Admins can manage services"
  ON syntalys_services FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('super_admin', 'admin')
    )
  );

-- Insert initial services data
INSERT INTO syntalys_services (name, name_fr, description, description_fr, icon, category, price_min, price_max, currency, price_type, commission_percentage, status, delivery_time, delivery_time_fr, display_order, is_featured) VALUES

-- Enterprise Services
('Artificial Intelligence', 'Intelligence artificielle', 'AI agents, applied intelligence, trend detection, automation and smart recommendations', 'Agents IA, intelligence appliquee, detection de tendances, automatisation et recommandations intelligentes', 'robot', 'enterprise', 5000, 50000, 'CHF', 'custom', 15, 'available', '4-8 weeks', '4-8 semaines', 1, true),

('Custom Development', 'Developpement sur mesure', 'Web platforms, mobile apps, internal software and seamless integrations with your existing tools', 'Plateformes web, applications mobiles, logiciels internes et integrations transparentes avec vos outils existants', 'code', 'enterprise', 10000, 100000, 'CHF', 'custom', 10, 'available', '2-6 months', '2-6 mois', 2, true),

('Cybersecurity', 'Cybersecurite', 'Active monitoring, targeted alerts, preventive audits and intelligent protection systems', 'Surveillance active, alertes ciblees, audits preventifs et systemes de protection intelligents', 'shield', 'enterprise', 3000, 25000, 'CHF', 'custom', 12, 'available', '2-4 weeks', '2-4 semaines', 3, false),

('Data & Analytics', 'Donnees & analytique', 'Predictive analytics, dashboards, decision support and data-driven forecasting', 'Analyses predictives, tableaux de bord, aide a la decision et previsions basees sur les donnees', 'chart', 'enterprise', 5000, 30000, 'CHF', 'custom', 12, 'available', '3-6 weeks', '3-6 semaines', 4, false),

('Digital Marketing', 'Marketing digital', 'SEO optimization, lead automation, marketing automation and performance tracking', 'Optimisation SEO, automatisation des leads, automatisation marketing et suivi des performances', 'bullhorn', 'enterprise', 2000, 15000, 'CHF', 'monthly', 15, 'available', '1-2 weeks', '1-2 semaines', 5, false),

('API & Integration', 'API & integration', 'RESTful APIs, third-party integrations and microservices architecture', 'API RESTful, integrations tierces et architecture microservices', 'plug', 'enterprise', 3000, 20000, 'CHF', 'custom', 10, 'available', '2-4 weeks', '2-4 semaines', 6, false),

-- PME/Independent Services
('Custom Bots', 'Bots sur mesure', 'WhatsApp, Telegram, Discord automation and customer service chatbots', 'Automatisation WhatsApp, Telegram, Discord et chatbots de service client', 'comments', 'pme', 500, 3000, 'CHF', 'fixed', 20, 'available', '1-2 weeks', '1-2 semaines', 1, true),

('Professional Websites', 'Sites web professionnels', 'Portfolios, company sites, landing pages and e-commerce platforms', 'Portfolios, sites d''entreprise, pages de destination et plateformes e-commerce', 'globe', 'pme', 800, 5000, 'CHF', 'fixed', 15, 'available', '2-4 weeks', '2-4 semaines', 2, true),

('Mobile Solutions', 'Solutions mobiles', 'Business apps, productivity tools and mobile-first solutions', 'Applications metier, outils de productivite et solutions mobile-first', 'mobile', 'pme', 2000, 10000, 'CHF', 'fixed', 12, 'available', '4-8 weeks', '4-8 semaines', 3, false),

('Business Automation', 'Automatisation metier', 'Workflow optimization, task automation and efficiency tools', 'Optimisation des flux de travail, automatisation des taches et outils d''efficacite', 'cogs', 'pme', 500, 3000, 'CHF', 'fixed', 18, 'available', '1-3 weeks', '1-3 semaines', 4, false),

('E-commerce', 'E-commerce', 'Online stores, payment integration and inventory management systems', 'Boutiques en ligne, integration de paiement et systemes de gestion des stocks', 'shopping-cart', 'pme', 1500, 8000, 'CHF', 'fixed', 12, 'available', '3-6 weeks', '3-6 semaines', 5, false),

('Creative Design', 'Design creatif', 'Logos, branding materials, marketing content and visual identity', 'Logos, supports de marque, contenus marketing et identite visuelle', 'paintbrush', 'pme', 300, 2000, 'CHF', 'fixed', 20, 'available', '1-2 weeks', '1-2 semaines', 6, false),

-- Additional services
('Call Center AI', 'Call Center IA', 'AI-powered call center solutions with voice bots and intelligent routing', 'Solutions de centre d''appels alimentees par l''IA avec voice bots et routage intelligent', 'headset', 'enterprise', 8000, 50000, 'CHF', 'custom', 15, 'available', '4-8 weeks', '4-8 semaines', 7, true),

('SEO', 'SEO', 'Search engine optimization, keyword research and organic traffic growth', 'Optimisation pour les moteurs de recherche, recherche de mots-cles et croissance du trafic organique', 'search', 'pme', 500, 2000, 'CHF', 'monthly', 20, 'available', 'Ongoing', 'En continu', 7, false);

-- Create function to update updated_at
CREATE OR REPLACE FUNCTION update_services_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_syntalys_services_updated_at
  BEFORE UPDATE ON syntalys_services
  FOR EACH ROW
  EXECUTE FUNCTION update_services_updated_at();
