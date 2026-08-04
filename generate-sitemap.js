import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

async function generateSitemap() {
    // 1. Pindahkan pemanggilan env ke dalam fungsi agar dipastikan terbaca
    const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY;

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://shadowclips.asia/</loc>
    <changefreq>hourly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://shadowclips.asia/populer</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://shadowclips.asia/jelajahi</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://shadowclips.asia/koleksi</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;

    // 2. Sistem Proteksi: Jika variabel env kosong saat build di Vercel, 
    //    jangan dilanjutkan ke Supabase agar tidak crash.
    if (!SUPABASE_URL || !SUPABASE_KEY) {
        console.warn("⚠️ Warning: Variabel SUPABASE_URL atau SUPABASE_KEY tidak terbaca.");
        xml += `\n</urlset>`;
        fs.writeFileSync('public/sitemap.xml', xml);
        console.log("Sitemap statis (tanpa data database) dibuat sebagai fallback.");
        return;
    }

    try {
        // 3. Inisialisasi Supabase di sini HANYA jika variabelnya terbukti ada
        const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

        const { data: videos, error } = await supabase
            .from('videos')
            .select('slug, id, created_at')
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Gagal mengambil data dari Supabase:", error.message);
        } else if (videos && videos.length > 0) {
            videos.forEach(video => {
                const identifier = video.slug || video.id;
                const lastMod = video.created_at ? video.created_at.split('T')[0] : new Date().toISOString().split('T')[0];
                
                xml += `
  <url>
    <loc>https://shadowclips.asia/streaming/${identifier}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
            });
        }

        xml += `\n</urlset>`;
        fs.writeFileSync('public/sitemap.xml', xml);
        console.log("Sitemap dinamis lengkap berhasil dibuat!");
        
    } catch (err) {
        console.error("Terjadi kesalahan sistem:", err);
        // Fallback darurat jika ada error lain agar build tidak gagal total
        xml += `\n</urlset>`;
        fs.writeFileSync('public/sitemap.xml', xml);
    }
}

// 4. Jalankan fungsi
generateSitemap();