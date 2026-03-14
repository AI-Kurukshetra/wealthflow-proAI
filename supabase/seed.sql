-- WealthFlow Pro Seed Data
-- Run this after running the migration and creating at least one auth user.
-- Replace the advisor_id UUIDs below with real profile IDs from your auth.users table.

-- First, get the first user's ID to use as advisor
DO $$
DECLARE
  advisor1_id uuid;
BEGIN
  SELECT id INTO advisor1_id FROM public.profiles LIMIT 1;

  IF advisor1_id IS NULL THEN
    RAISE NOTICE 'No profiles found. Create a user first via Supabase Auth, then run this seed.';
    RETURN;
  END IF;

  -- ── Households ──
  INSERT INTO public.households (id, name, segment, advisor_id, total_aum, risk_profile, status, next_review_date, notes)
  VALUES
    ('a1000000-0000-0000-0000-000000000001', 'Patel Family Office', 'UHNI', advisor1_id, 92000000, 'Balanced Growth', 'active', '2026-03-28', 'Multi-generational family office based in Ahmedabad'),
    ('a1000000-0000-0000-0000-000000000002', 'Iyer Legacy Trust', 'UHNI', advisor1_id, 118000000, 'Capital Preservation', 'active', '2026-04-05', 'Trust established for succession planning'),
    ('a1000000-0000-0000-0000-000000000003', 'Mehta Entrepreneurs', 'HNI', advisor1_id, 54000000, 'Aggressive Growth', 'active', '2026-03-22', 'First-generation entrepreneurs diversifying'),
    ('a1000000-0000-0000-0000-000000000004', 'Khandelwal Advisory Desk', 'Advisory', advisor1_id, 62000000, 'Income Focused', 'active', '2026-04-10', 'Advisory branch operations in Pune'),
    ('a1000000-0000-0000-0000-000000000005', 'Sharma Retirement Fund', 'HNI', advisor1_id, 38000000, 'Conservative', 'active', '2026-04-15', 'Retirement planning for senior executives')
  ON CONFLICT (id) DO NOTHING;

  -- ── Clients ──
  INSERT INTO public.clients (id, household_id, owner_id, first_name, last_name, email, phone, city, onboarding_stage, kyc_status, pan_number)
  VALUES
    ('b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', advisor1_id, 'Rajesh', 'Patel', 'rajesh.patel@example.com', '+91 98765 43210', 'Ahmedabad', 'active', 'verified', 'ABCPD1234E'),
    ('b1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', advisor1_id, 'Meena', 'Patel', 'meena.patel@example.com', '+91 98765 43211', 'Ahmedabad', 'active', 'verified', 'ABCPD1235F'),
    ('b1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000002', advisor1_id, 'Venkatesh', 'Iyer', 'v.iyer@example.com', '+91 98765 43212', 'Chennai', 'active', 'verified', 'EFGHI2345J'),
    ('b1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000002', advisor1_id, 'Lakshmi', 'Iyer', 'l.iyer@example.com', '+91 98765 43213', 'Chennai', 'active', 'pending', 'EFGHI2346K'),
    ('b1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000003', advisor1_id, 'Anil', 'Mehta', 'anil.mehta@example.com', '+91 98765 43214', 'Mumbai', 'active', 'verified', 'KLMNO3456P'),
    ('b1000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000004', advisor1_id, 'Priya', 'Khandelwal', 'priya.k@example.com', '+91 98765 43215', 'Pune', 'prospect', 'pending', 'PQRST4567U'),
    ('b1000000-0000-0000-0000-000000000007', 'a1000000-0000-0000-0000-000000000005', advisor1_id, 'Deepak', 'Sharma', 'deepak.sharma@example.com', '+91 98765 43216', 'Delhi', 'active', 'verified', 'UVWXY5678Z'),
    ('b1000000-0000-0000-0000-000000000008', 'a1000000-0000-0000-0000-000000000005', advisor1_id, 'Sunita', 'Sharma', 'sunita.sharma@example.com', '+91 98765 43217', 'Delhi', 'active', 'expired', 'UVWXY5679A')
  ON CONFLICT (id) DO NOTHING;

  -- ── Portfolios ──
  INSERT INTO public.portfolios (id, household_id, name, base_currency, objective, benchmark, total_value, performance_ytd)
  VALUES
    ('c1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'Patel Growth Portfolio', 'INR', 'Long-term capital appreciation', 'Nifty 50', 58000000, 14.2),
    ('c1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 'Patel Fixed Income', 'INR', 'Stable income generation', 'CRISIL Composite Bond', 34000000, 8.5),
    ('c1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000002', 'Iyer Preservation Fund', 'INR', 'Capital preservation with modest growth', 'Nifty 100', 118000000, 6.8),
    ('c1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000003', 'Mehta High Growth', 'INR', 'Aggressive capital growth', 'Nifty Midcap 150', 54000000, 22.5),
    ('c1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000004', 'Khandelwal Income', 'INR', 'Regular income with capital safety', 'CRISIL Short Term Bond', 62000000, 9.2),
    ('c1000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000005', 'Sharma Retirement', 'INR', 'Retirement corpus building', 'Nifty 50', 38000000, 11.4)
  ON CONFLICT (id) DO NOTHING;

  -- ── Holdings ──
  INSERT INTO public.holdings (portfolio_id, symbol, security_name, asset_class, units, average_cost, market_price, market_value, weight)
  VALUES
    ('c1000000-0000-0000-0000-000000000001', 'RELIANCE', 'Reliance Industries Ltd', 'Large Cap Equity', 2000, 2400, 2680, 5360000, 9.24),
    ('c1000000-0000-0000-0000-000000000001', 'TCS', 'Tata Consultancy Services', 'Large Cap Equity', 1500, 3200, 3850, 5775000, 9.96),
    ('c1000000-0000-0000-0000-000000000001', 'HDFCBANK', 'HDFC Bank Ltd', 'Large Cap Equity', 3000, 1500, 1720, 5160000, 8.90),
    ('c1000000-0000-0000-0000-000000000001', 'INFY', 'Infosys Ltd', 'Large Cap Equity', 2500, 1400, 1580, 3950000, 6.81),
    ('c1000000-0000-0000-0000-000000000001', 'AXISGILTS', 'Axis Gilt Fund', 'Debt Mutual Fund', 50000, 22, 24.5, 1225000, 2.11),
    ('c1000000-0000-0000-0000-000000000002', 'HDFCSTBF', 'HDFC Short Term Debt Fund', 'Debt Mutual Fund', 100000, 28, 31.2, 3120000, 9.18),
    ('c1000000-0000-0000-0000-000000000002', 'ICICILAF', 'ICICI Pru Long Term Bond', 'Debt Mutual Fund', 80000, 35, 38.5, 3080000, 9.06),
    ('c1000000-0000-0000-0000-000000000003', 'GOLDBEES', 'Nippon Gold ETF', 'Gold', 10000, 48, 55.2, 552000, 0.47),
    ('c1000000-0000-0000-0000-000000000003', 'NIFTYBEES', 'Nippon Nifty 50 ETF', 'Index ETF', 200000, 240, 268, 53600000, 45.42),
    ('c1000000-0000-0000-0000-000000000004', 'TATAMOTORS', 'Tata Motors Ltd', 'Mid Cap Equity', 5000, 620, 780, 3900000, 7.22),
    ('c1000000-0000-0000-0000-000000000004', 'BAJFINANCE', 'Bajaj Finance Ltd', 'Large Cap Equity', 800, 6500, 7200, 5760000, 10.67),
    ('c1000000-0000-0000-0000-000000000005', 'SBILIQUID', 'SBI Liquid Fund', 'Liquid Fund', 150000, 38, 40.5, 6075000, 9.80),
    ('c1000000-0000-0000-0000-000000000006', 'PPFAS', 'PPFAS Flexi Cap Fund', 'Flexi Cap MF', 60000, 52, 64, 3840000, 10.11)
  ON CONFLICT DO NOTHING;

  -- ── Tasks ──
  INSERT INTO public.tasks (household_id, owner_id, title, description, status, priority, due_at, category)
  VALUES
    ('a1000000-0000-0000-0000-000000000001', advisor1_id, 'Complete KYC refresh for Patel Family Office', 'Annual KYC documents need to be collected and verified for all family members', 'todo', 'high', now() + interval '1 day', 'compliance'),
    ('a1000000-0000-0000-0000-000000000002', advisor1_id, 'Prepare proposal pack for Iyer Legacy Trust', 'Include succession planning options and alternative investment proposals', 'todo', 'high', now() + interval '3 days', 'advisory'),
    ('a1000000-0000-0000-0000-000000000003', advisor1_id, 'Schedule quarterly review for Mehta Entrepreneurs', 'Review portfolio performance and discuss new investment opportunities', 'todo', 'medium', now() + interval '5 days', 'review'),
    ('a1000000-0000-0000-0000-000000000004', advisor1_id, 'Upload signed mandate for Khandelwal Advisory Desk', 'Signed advisory mandate needs to be uploaded to document vault', 'in_progress', 'medium', now() + interval '4 days', 'documentation'),
    ('a1000000-0000-0000-0000-000000000005', advisor1_id, 'Review retirement corpus projection for Sharma', 'Update the retirement calculator with latest salary and expense data', 'todo', 'medium', now() + interval '7 days', 'planning'),
    (NULL, advisor1_id, 'Update market commentary for Q1 2026', 'Prepare quarterly market commentary for client newsletter', 'todo', 'low', now() + interval '10 days', 'marketing'),
    ('a1000000-0000-0000-0000-000000000001', advisor1_id, 'File SEBI disclosure for Patel advisory fees', 'Annual fee disclosure to be filed with regulator', 'blocked', 'high', now() + interval '2 days', 'compliance')
  ON CONFLICT DO NOTHING;

  -- ── Compliance Records ──
  INSERT INTO public.compliance_records (household_id, owner_id, record_type, status, due_at, finding)
  VALUES
    ('a1000000-0000-0000-0000-000000000001', advisor1_id, 'SEBI Suitability Questionnaire', 'pending', now()::date + 5, 'Patel Family Office has an expiring risk profile assessment'),
    ('a1000000-0000-0000-0000-000000000002', advisor1_id, 'KYC Document Review', 'in_review', now()::date + 10, 'Lakshmi Iyer KYC documents need re-verification'),
    ('a1000000-0000-0000-0000-000000000004', advisor1_id, 'Document Retention Audit', 'pending', now()::date + 7, '4 files in advisory workspace missing classification tags'),
    ('a1000000-0000-0000-0000-000000000003', advisor1_id, 'Fee Disclosure Confirmation', 'approved', now()::date + 15, 'Annual fee disclosure completed and acknowledged by client'),
    ('a1000000-0000-0000-0000-000000000005', advisor1_id, 'Annual Risk Assessment', 'pending', now()::date + 20, 'Sharma retirement fund risk assessment needs updating'),
    ('a1000000-0000-0000-0000-000000000001', advisor1_id, 'Anti-Money Laundering Check', 'approved', now()::date - 30, 'AML screening completed successfully'),
    ('a1000000-0000-0000-0000-000000000002', advisor1_id, 'Investment Suitability Review', 'flagged', now()::date + 3, 'Portfolio concentration exceeds 40% in single sector')
  ON CONFLICT DO NOTHING;

  -- ── Opportunities ──
  INSERT INTO public.opportunities (household_id, owner_id, title, stage, expected_value, probability, target_close_date, notes)
  VALUES
    (NULL, advisor1_id, 'Nexus Family Wealth Mandate', 'qualifying', 32000000, 35, '2026-03-29', 'Prospect from Bengaluru referral network'),
    (NULL, advisor1_id, 'Pune Medical Partners Advisory', 'qualifying', 27000000, 30, '2026-04-02', 'Founders looking for succession planning'),
    ('a1000000-0000-0000-0000-000000000002', advisor1_id, 'Iyer Legacy Expansion', 'proposal', 41000000, 62, '2026-03-21', 'Alternative investments mandate add-on'),
    ('a1000000-0000-0000-0000-000000000004', advisor1_id, 'Khandelwal Compliance Retainer', 'proposal', 16000000, 55, '2026-03-25', 'Operations package for advisory branch rollout'),
    ('a1000000-0000-0000-0000-000000000001', advisor1_id, 'Patel Offshore Allocation', 'diligence', 58000000, 74, '2026-03-19', 'New family office portfolio sleeve'),
    ('a1000000-0000-0000-0000-000000000003', advisor1_id, 'Mehta Liquidity Mandate', 'commitment', 24000000, 88, '2026-03-15', 'Treasury and debt allocation refresh')
  ON CONFLICT DO NOTHING;

  -- ── Leads ──
  INSERT INTO public.leads (owner_id, company_name, contact_name, email, phone, source, status, score)
  VALUES
    (advisor1_id, 'Nexus Family Wealth', 'Arjun Reddy', 'arjun@nexuswealth.in', '+91 90000 12345', 'referral', 'contacted', 72),
    (advisor1_id, 'Pune Medical Partners', 'Dr. Sanjay Kulkarni', 'sanjay@pmpune.com', '+91 90000 12346', 'event', 'new', 45),
    (advisor1_id, 'Trivedi Holdings', 'Vikram Trivedi', 'vikram@trivediholdings.com', '+91 90000 12347', 'website', 'qualified', 85),
    (advisor1_id, 'Rajan Group', 'Nirmala Rajan', 'nirmala@rajangroup.in', '+91 90000 12348', 'referral', 'contacted', 60),
    (advisor1_id, 'Coastal Investments', 'Srinivas Rao', 'sri@coastalinv.com', '+91 90000 12349', 'cold_outreach', 'new', 30)
  ON CONFLICT DO NOTHING;

  -- ── Meetings ──
  INSERT INTO public.meetings (household_id, owner_id, subject, meeting_type, location, notes, starts_at, ends_at)
  VALUES
    ('a1000000-0000-0000-0000-000000000001', advisor1_id, 'Quarterly Portfolio Review - Patel', 'review', 'Patel Family Office, Ahmedabad', 'Review Q1 performance and discuss rebalancing', now() + interval '3 days', now() + interval '3 days' + interval '1 hour'),
    ('a1000000-0000-0000-0000-000000000002', advisor1_id, 'Succession Planning Discussion - Iyer', 'planning', 'Virtual - Google Meet', 'Discuss trust structure options', now() + interval '5 days', now() + interval '5 days' + interval '90 minutes'),
    ('a1000000-0000-0000-0000-000000000003', advisor1_id, 'Investment Proposal - Mehta', 'proposal', 'WealthFlow Pro Office, Mumbai', 'Present new mid-cap strategy', now() + interval '7 days', now() + interval '7 days' + interval '1 hour'),
    ('a1000000-0000-0000-0000-000000000005', advisor1_id, 'Retirement Review - Sharma', 'review', 'Virtual - Zoom', 'Annual retirement planning review', now() + interval '10 days', now() + interval '10 days' + interval '1 hour')
  ON CONFLICT DO NOTHING;

  -- ── Documents ──
  INSERT INTO public.documents (household_id, client_id, uploaded_by, title, document_type, classification, version_label, signed)
  VALUES
    ('a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', advisor1_id, 'Rajesh Patel - KYC Documents', 'kyc', 'confidential', 'v2', true),
    ('a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000002', advisor1_id, 'Meena Patel - PAN Card', 'identity', 'confidential', 'v1', true),
    ('a1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000003', advisor1_id, 'Iyer Trust Deed', 'legal', 'restricted', 'v1', true),
    ('a1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000005', advisor1_id, 'Mehta Advisory Agreement', 'agreement', 'internal', 'v3', true),
    ('a1000000-0000-0000-0000-000000000004', NULL, advisor1_id, 'Khandelwal Fee Schedule 2026', 'billing', 'internal', 'v1', false),
    ('a1000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000007', advisor1_id, 'Sharma Retirement Plan', 'planning', 'confidential', 'v2', true)
  ON CONFLICT DO NOTHING;

  -- ── Goals ──
  INSERT INTO public.goals (household_id, title, target_amount, current_amount, target_date, priority, status)
  VALUES
    ('a1000000-0000-0000-0000-000000000001', 'Education Fund for Grandchildren', 50000000, 32000000, '2030-06-01', 'high', 'on_track'),
    ('a1000000-0000-0000-0000-000000000002', 'Charitable Trust Corpus', 100000000, 78000000, '2028-12-31', 'medium', 'on_track'),
    ('a1000000-0000-0000-0000-000000000003', 'Business Expansion Fund', 80000000, 42000000, '2027-12-31', 'high', 'at_risk'),
    ('a1000000-0000-0000-0000-000000000005', 'Retirement Corpus', 60000000, 38000000, '2032-03-31', 'high', 'on_track'),
    ('a1000000-0000-0000-0000-000000000004', 'Office Acquisition Fund', 30000000, 18000000, '2027-06-30', 'medium', 'on_track')
  ON CONFLICT DO NOTHING;

  -- ── Fee Schedules ──
  INSERT INTO public.fee_schedules (household_id, billing_frequency, advisory_fee_bps, last_invoice_date, next_invoice_date, collection_status)
  VALUES
    ('a1000000-0000-0000-0000-000000000001', 'quarterly', 75, '2025-12-31', '2026-03-31', 'pending'),
    ('a1000000-0000-0000-0000-000000000002', 'quarterly', 50, '2025-12-31', '2026-03-31', 'pending'),
    ('a1000000-0000-0000-0000-000000000003', 'monthly', 100, '2026-02-28', '2026-03-31', 'collected'),
    ('a1000000-0000-0000-0000-000000000004', 'quarterly', 65, '2025-12-31', '2026-03-31', 'overdue'),
    ('a1000000-0000-0000-0000-000000000005', 'annually', 60, '2025-03-31', '2026-03-31', 'pending')
  ON CONFLICT DO NOTHING;

  RAISE NOTICE 'Seed data inserted successfully for advisor %', advisor1_id;
END $$;
