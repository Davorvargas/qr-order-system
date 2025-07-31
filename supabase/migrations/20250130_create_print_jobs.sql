-- Create print_jobs table for tracking print requests and status
CREATE TABLE IF NOT EXISTS print_jobs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) NOT NULL,
    printer_id UUID REFERENCES printers(id) NOT NULL,
    print_type TEXT NOT NULL CHECK (print_type IN ('kitchen', 'drink', 'receipt')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'printing', 'completed', 'failed', 'cancelled')),
    requested_by UUID REFERENCES auth.users(id) NOT NULL,
    requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    retry_count INTEGER NOT NULL DEFAULT 0,
    max_retries INTEGER NOT NULL DEFAULT 3,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_print_jobs_order_id ON print_jobs(order_id);
CREATE INDEX IF NOT EXISTS idx_print_jobs_printer_id ON print_jobs(printer_id);
CREATE INDEX IF NOT EXISTS idx_print_jobs_status ON print_jobs(status);
CREATE INDEX IF NOT EXISTS idx_print_jobs_print_type ON print_jobs(print_type);
CREATE INDEX IF NOT EXISTS idx_print_jobs_requested_at ON print_jobs(requested_at DESC);

-- Enable RLS (Row Level Security)
ALTER TABLE print_jobs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Staff can view print jobs" ON print_jobs
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Staff can insert print jobs" ON print_jobs
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Staff can update print jobs" ON print_jobs
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Update trigger for updated_at
CREATE TRIGGER update_print_jobs_updated_at 
    BEFORE UPDATE ON print_jobs 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add printer_last_seen field to printers table to track when printer was last active
ALTER TABLE printers ADD COLUMN IF NOT EXISTS last_seen TIMESTAMP WITH TIME ZONE;
ALTER TABLE printers ADD COLUMN IF NOT EXISTS last_error TEXT;
ALTER TABLE printers ADD COLUMN IF NOT EXISTS print_queue_count INTEGER DEFAULT 0;

COMMENT ON TABLE print_jobs IS 'Tracks individual print job requests and their status';
COMMENT ON COLUMN print_jobs.print_type IS 'Type of print job: kitchen, drink, or receipt';
COMMENT ON COLUMN print_jobs.status IS 'Current status: pending, printing, completed, failed, cancelled';
COMMENT ON COLUMN print_jobs.retry_count IS 'Number of retry attempts made';
COMMENT ON COLUMN print_jobs.max_retries IS 'Maximum number of retries allowed';