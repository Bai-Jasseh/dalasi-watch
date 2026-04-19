-- Seed price_history for the 10 commodities currently missing data.
-- Realistic GMD base prices per unit, with regional multipliers and small daily noise.

WITH commodities(commodity_id, base_price) AS (
  VALUES
    ('eggs',          325),  -- crate of 30
    ('onion-local',    45),  -- per kg
    ('onion-holland',  60),  -- per kg
    ('potato',         55),  -- per kg
    ('tomato',         70),  -- per kg
    ('bitter-tomato',  50),  -- per kg
    ('pepper',         90),  -- per kg
    ('charcoal',      550),  -- large bag
    ('firewood',      150),  -- bundle
    ('gas-12',       1450)   -- 12.5kg cylinder
),
regions(region_id, mult) AS (
  VALUES
    ('banjul',     1.00),
    ('kanifing',   1.02),
    ('brikama',    0.97),
    ('soma',       1.05),
    ('farafenni',  1.06),
    ('bansang',    1.10),
    ('basse',      1.12)
),
days AS (
  SELECT generate_series('2026-03-21'::date, '2026-04-19'::date, '1 day')::date AS point_date
)
INSERT INTO public.price_history (commodity_id, region_id, point_date, price)
SELECT
  c.commodity_id,
  r.region_id,
  d.point_date,
  GREATEST(
    1,
    ROUND(
      c.base_price * r.mult
      * (1 + (((extract(epoch from d.point_date)::int + length(c.commodity_id) + length(r.region_id)) % 11) - 5) / 100.0)
    )
  ) AS price
FROM commodities c
CROSS JOIN regions r
CROSS JOIN days d;