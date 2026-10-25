insert into public.skills (slug, name) values
  ('python', 'Python'), ('sql', 'SQL'), ('rest-apis', 'REST APIs'),
  ('postgresql', 'PostgreSQL'), ('testing', 'Testing'), ('docker', 'Docker'),
  ('git', 'Git'), ('deployment', 'Deployment'), ('pandas', 'Pandas'),
  ('statistics', 'Statistics'), ('visualization', 'Visualization'),
  ('business-thinking', 'Business thinking'), ('ml-fundamentals', 'ML fundamentals'),
  ('evaluation', 'Evaluation'), ('apis', 'APIs')
on conflict (slug) do update set name = excluded.name;

insert into public.roles (id, slug, name, description) values
  ('00000000-0000-0000-0000-000000000001', 'backend', 'Backend / Software Engineer', 'Build reliable APIs, data systems, and services.'),
  ('00000000-0000-0000-0000-000000000002', 'analyst', 'Data Analyst', 'Turn messy business data into clear decisions.'),
  ('00000000-0000-0000-0000-000000000003', 'ml', 'AI / ML Engineer', 'Train, evaluate, and ship useful ML systems.')
on conflict (slug) do update set name = excluded.name, description = excluded.description;

insert into public.role_skill_requirements (role_id, skill_id, importance)
select '00000000-0000-0000-0000-000000000001', id, 3 from public.skills where slug in ('python','sql','rest-apis','postgresql','testing','docker','git','deployment')
on conflict (role_id, skill_id) do update set importance = excluded.importance;
insert into public.role_skill_requirements (role_id, skill_id, importance)
select '00000000-0000-0000-0000-000000000002', id, 3 from public.skills where slug in ('sql','python','pandas','statistics','visualization','business-thinking')
on conflict (role_id, skill_id) do update set importance = excluded.importance;
insert into public.role_skill_requirements (role_id, skill_id, importance)
select '00000000-0000-0000-0000-000000000003', id, 3 from public.skills where slug in ('python','pandas','ml-fundamentals','evaluation','apis','deployment','git')
on conflict (role_id, skill_id) do update set importance = excluded.importance;

insert into public.project_families (id, slug, name) values
  ('00000000-0000-0000-0001-000000000001', 'production-backend-system', 'Production Backend System'),
  ('00000000-0000-0000-0001-000000000002', 'business-analytics', 'Business Analytics Decision System'),
  ('00000000-0000-0000-0001-000000000003', 'ai-document-intelligence', 'AI Document Intelligence System')
on conflict (slug) do update set name = excluded.name;

insert into public.project_variants (id, family_id, slug, definition) values
  ('00000000-0000-0000-0002-000000000001', '00000000-0000-0000-0001-000000000001', 'logistics-backend', '{"title":"Logistics Order & Delivery Management Backend","domain":"logistics"}'),
  ('00000000-0000-0000-0002-000000000002', '00000000-0000-0000-0001-000000000001', 'ecommerce-backend', '{"title":"E-commerce Order Management Backend","domain":"e-commerce"}'),
  ('00000000-0000-0000-0002-000000000003', '00000000-0000-0000-0001-000000000002', 'retail-analytics', '{"title":"Retail Growth Decision System","domain":"retail"}'),
  ('00000000-0000-0000-0002-000000000004', '00000000-0000-0000-0001-000000000003', 'document-intelligence', '{"title":"College Policy Document Assistant","domain":"admissions"}')
on conflict (slug) do update set definition = excluded.definition;

insert into public.project_missions (variant_id, mission_number, definition)
select '00000000-0000-0000-0002-000000000001', n, jsonb_build_object('id', 'm' || n, 'title', case n
  when 1 then 'Understand the problem + setup' when 2 then 'Design the system and data model'
  when 3 then 'Authentication' when 4 then 'Core API implementation'
  when 5 then 'Business rules' when 6 then 'Testing' when 7 then 'Production concerns'
  when 8 then 'Docker' when 9 then 'Deployment' when 10 then 'Documentation'
  when 11 then 'Review' else 'Project viva preparation' end, 'free', n = 1)
from generate_series(1, 12) as n
on conflict (variant_id, mission_number) do update set definition = excluded.definition;
