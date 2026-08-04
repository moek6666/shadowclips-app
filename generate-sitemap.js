import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function generateSitemap() {
    try {
        const { data: videos, error } = await supabase
            .from('videos')
            .select('slug, id, created_at')
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Gagal mengambil data dari Supabase:", error.message);
            return; // Menggunakan return agar Node.js berhenti secara alami
        }

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

        if (videos && videos.length > 0) {
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
        console.log("Sitemap berhasil dibuat!");
        
    } catch (err) {
        console.error("Terjadi kesalahan sistem:", err);
    }
}

generateSitemap();