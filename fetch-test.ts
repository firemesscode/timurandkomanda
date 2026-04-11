import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dhydoigthvkipiaxhdmv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRoeWRvaWd0aHZraXBpYXhoZG12Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4MjMwOTgsImV4cCI6MjA5MTM5OTA5OH0.fQKrT3D4dguZPRlrlX3Hx_8sEyruYJNx53OjAQQSBsM';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  try {
    console.log('Fetching articles...');
    const { data, error } = await supabase.from('articles').select('*');
    if (error) {
      console.error('Supabase Error:', error);
    } else {
      console.log('Success! Data:', data);
    }
  } catch (err) {
    console.error('Catch Error:', err);
  }
}

test();
