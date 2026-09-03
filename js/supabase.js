import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Configurações do Supabase
const SUPABASE_URL = window.ENV?.SUPABASE_URL || 'https://okrkeyyhjvrlvosnnkkj.supabase.co';
const SUPABASE_ANON_KEY = window.ENV?.SUPABASE_ANON_KEY || 'sb_publishable_scy5xHZ1xn2t1wNPDMnRfw_4-YfuJEn';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
