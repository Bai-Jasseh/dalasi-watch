-- Citizen reports table
CREATE TABLE public.citizen_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  commodity_id TEXT NOT NULL,
  region_id TEXT NOT NULL,
  market TEXT NOT NULL,
  price NUMERIC NOT NULL CHECK (price > 0),
  reporter TEXT,
  report_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_citizen_reports_lookup ON public.citizen_reports (commodity_id, region_id, lower(market));
CREATE INDEX idx_citizen_reports_created ON public.citizen_reports (created_at DESC);

ALTER TABLE public.citizen_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view citizen reports"
  ON public.citizen_reports FOR SELECT
  USING (true);

CREATE POLICY "Anyone can submit a citizen report"
  ON public.citizen_reports FOR INSERT
  WITH CHECK (
    price > 0
    AND length(market) BETWEEN 1 AND 120
    AND length(commodity_id) BETWEEN 1 AND 60
    AND length(region_id) BETWEEN 1 AND 60
    AND (reporter IS NULL OR length(reporter) <= 80)
  );

-- Price history table
CREATE TABLE public.price_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  commodity_id TEXT NOT NULL,
  region_id TEXT NOT NULL,
  price NUMERIC NOT NULL CHECK (price > 0),
  point_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (commodity_id, region_id, point_date)
);

CREATE INDEX idx_price_history_commodity_region ON public.price_history (commodity_id, region_id, point_date);

ALTER TABLE public.price_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view price history"
  ON public.price_history FOR SELECT
  USING (true);

CREATE POLICY "Anyone can add price history points"
  ON public.price_history FOR INSERT
  WITH CHECK (
    price > 0
    AND length(commodity_id) BETWEEN 1 AND 60
    AND length(region_id) BETWEEN 1 AND 60
  );