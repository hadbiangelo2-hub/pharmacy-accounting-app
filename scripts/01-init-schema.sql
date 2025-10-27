-- Create users table for admin authentication
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'admin',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create daily_log table for daily transactions
CREATE TABLE IF NOT EXISTS daily_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  user_id UUID REFERENCES users(id),
  
  -- Revenue
  sales_amount DECIMAL(12, 2) DEFAULT 0,
  
  -- Expenses
  staff_salary DECIMAL(12, 2) DEFAULT 0,
  partner_commission DECIMAL(12, 2) DEFAULT 0,
  rent DECIMAL(12, 2) DEFAULT 0,
  utilities DECIMAL(12, 2) DEFAULT 0,
  supplies DECIMAL(12, 2) DEFAULT 0,
  other_expenses DECIMAL(12, 2) DEFAULT 0,
  
  -- Advances
  staff_advances DECIMAL(12, 2) DEFAULT 0,
  partner_advances DECIMAL(12, 2) DEFAULT 0,
  
  -- Calculations
  total_expenses DECIMAL(12, 2) DEFAULT 0,
  net_profit DECIMAL(12, 2) DEFAULT 0,
  
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(date, user_id)
);

-- Create advances table for tracking employee/partner advances
CREATE TABLE IF NOT EXISTS advances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  staff_name VARCHAR(255),
  advance_type VARCHAR(50), -- 'staff' or 'partner'
  amount DECIMAL(12, 2) NOT NULL,
  advance_date DATE NOT NULL,
  repayment_date DATE,
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'repaid', 'cancelled'
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create monthly_summary table for monthly reports
CREATE TABLE IF NOT EXISTS monthly_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  
  total_sales DECIMAL(12, 2) DEFAULT 0,
  total_staff_salary DECIMAL(12, 2) DEFAULT 0,
  total_partner_commission DECIMAL(12, 2) DEFAULT 0,
  total_rent DECIMAL(12, 2) DEFAULT 0,
  total_utilities DECIMAL(12, 2) DEFAULT 0,
  total_supplies DECIMAL(12, 2) DEFAULT 0,
  total_other_expenses DECIMAL(12, 2) DEFAULT 0,
  
  total_expenses DECIMAL(12, 2) DEFAULT 0,
  net_profit DECIMAL(12, 2) DEFAULT 0,
  
  outstanding_advances DECIMAL(12, 2) DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(user_id, year, month)
);

-- Create staff_activities table for tracking staff work
CREATE TABLE IF NOT EXISTS staff_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  activity_date DATE NOT NULL,
  staff_name VARCHAR(255),
  activity_type VARCHAR(100), -- Darija terminology
  hours_worked DECIMAL(5, 2),
  amount DECIMAL(12, 2),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create partner_activities table for tracking partner work
CREATE TABLE IF NOT EXISTS partner_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  activity_date DATE NOT NULL,
  partner_name VARCHAR(255),
  activity_type VARCHAR(100), -- Darija terminology
  commission_percentage DECIMAL(5, 2),
  amount DECIMAL(12, 2),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_daily_log_date ON daily_log(date);
CREATE INDEX idx_daily_log_user_id ON daily_log(user_id);
CREATE INDEX idx_advances_user_id ON advances(user_id);
CREATE INDEX idx_advances_status ON advances(status);
CREATE INDEX idx_monthly_summary_user_id ON monthly_summary(user_id);
CREATE INDEX idx_monthly_summary_year_month ON monthly_summary(year, month);
CREATE INDEX idx_staff_activities_date ON staff_activities(activity_date);
CREATE INDEX idx_partner_activities_date ON partner_activities(activity_date);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE advances ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_activities ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users table
CREATE POLICY "Users can view their own data" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (auth.uid()::text = id::text);

-- Create RLS policies for daily_log table
CREATE POLICY "Users can view their own daily logs" ON daily_log
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert their own daily logs" ON daily_log
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own daily logs" ON daily_log
  FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Create RLS policies for advances table
CREATE POLICY "Users can view their own advances" ON advances
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert their own advances" ON advances
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own advances" ON advances
  FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Create RLS policies for monthly_summary table
CREATE POLICY "Users can view their own monthly summaries" ON monthly_summary
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert their own monthly summaries" ON monthly_summary
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own monthly summaries" ON monthly_summary
  FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Create RLS policies for staff_activities table
CREATE POLICY "Users can view their own staff activities" ON staff_activities
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert their own staff activities" ON staff_activities
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own staff activities" ON staff_activities
  FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Create RLS policies for partner_activities table
CREATE POLICY "Users can view their own partner activities" ON partner_activities
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert their own partner activities" ON partner_activities
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own partner activities" ON partner_activities
  FOR UPDATE USING (auth.uid()::text = user_id::text);
