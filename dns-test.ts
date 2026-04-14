import dns from 'dns';
dns.lookup('dhydoigthvkipiaxhdmv.supabase.co', (err, address) => {
  console.log('err:', err);
  console.log('address:', address);
});
