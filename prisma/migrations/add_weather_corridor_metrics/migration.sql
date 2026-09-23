ALTER TABLE "weather_cache" ADD COLUMN "maxSwellM" DOUBLE PRECISION;
ALTER TABLE "weather_cache" ADD COLUMN "maxCurrentKt" DOUBLE PRECISION;
ALTER TABLE "weather_cache" ADD COLUMN "worstSegment" TEXT;
ALTER TABLE "weather_cache" ADD COLUMN "affectedSegments" JSONB;
ALTER TABLE "weather_cache" ADD COLUMN "riskScore" DOUBLE PRECISION;
