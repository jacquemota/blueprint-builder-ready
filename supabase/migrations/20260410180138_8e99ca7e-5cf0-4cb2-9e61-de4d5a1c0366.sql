
-- Triggers for updated_at (use IF NOT EXISTS pattern via DROP IF EXISTS + CREATE)
DROP TRIGGER IF EXISTS update_familias_updated_at ON public.familias;
CREATE TRIGGER update_familias_updated_at
  BEFORE UPDATE ON public.familias
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_atendimentos_updated_at ON public.atendimentos;
CREATE TRIGGER update_atendimentos_updated_at
  BEFORE UPDATE ON public.atendimentos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_atividades_updated_at ON public.atividades;
CREATE TRIGGER update_atividades_updated_at
  BEFORE UPDATE ON public.atividades
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS check_cesta_30_dias_trigger ON public.entregas_cestas;
CREATE TRIGGER check_cesta_30_dias_trigger
  BEFORE INSERT OR UPDATE ON public.entregas_cestas
  FOR EACH ROW
  EXECUTE FUNCTION public.check_cesta_30_dias();
