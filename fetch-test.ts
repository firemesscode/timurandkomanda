const url = 'https://dhydoigthvkipiaxhdmv.supabase.co/rest/v1/articles?select=id,title,status';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRoeWRvaWd0aHZraXBpYXhoZG12Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4MjMwOTgsImV4cCI6MjA5MTM5OTA5OH0.fQKrT3D4dguZPRlrlX3Hx_8sEyruYJNx53OjAQQSBsM';

fetch(url, {
  headers: {
    'apikey': key,
    'Authorization': `Bearer ${key}`
  }
})
.then(res => res.json())
.then(data => console.log(JSON.stringify(data, null, 2)))
.catch(err => console.error(err));
