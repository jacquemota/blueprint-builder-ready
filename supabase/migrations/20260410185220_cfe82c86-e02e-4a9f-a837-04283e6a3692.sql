
-- Insert admin role for existing admin user
INSERT INTO public.user_roles (user_id, role)
VALUES ('ca591731-f1fc-4c99-a469-00c3e5126e24', 'admin')
ON CONFLICT DO NOTHING;

-- Create trigger for new user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create triggers for updated_at
CREATE OR REPLACE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER update_familias_updated_at
  BEFORE UPDATE ON public.familias
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER update_atendimentos_updated_at
  BEFORE UPDATE ON public.atendimentos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER update_atividades_updated_at
  BEFORE UPDATE ON public.atividades
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for 30-day cesta validation
CREATE OR REPLACE TRIGGER check_cesta_30_dias_trigger
  BEFORE INSERT OR UPDATE ON public.entregas_cestas
  FOR EACH ROW
  EXECUTE FUNCTION public.check_cesta_30_dias();
