import sitemap from 'sitemap.js';
import { createGzip } from 'zlib';
const { SitemapStream, streamToPromise } = sitemap;
async function generateSitemap(db, req, res) {
  const Blogpost = db.blogpost;
  // Set HTTP headers
  res.setHeader('Content-Type', 'application/xml');
  res.setHeader('Content-Encoding', 'gzip');
  const posts = await Blogpost.find();
  const languages = ['', 'en', 'ru', 'fr', 'de', 'it', 'zh']; // Add or remove languages as needed
  const smStream = new SitemapStream({ hostname: 'https://thecommunephuket.com/' });
  const pipeline = smStream.pipe(createGzip());
  const routes = ['/', '/about', '/gallery', '/contacts', '/community'];
  languages.forEach(lang => {
    const prefix = lang ? `${lang}` : '';
    routes.forEach(route => {
      smStream.write({ url: `${prefix}${route}`, changefreq: 'monthly', priority: 0.7 });
    });
    posts.forEach(post => {
      smStream.write({
        url: `${prefix}/community/posts/${post.url}`,
        changefreq: 'weekly',
        priority: 0.5,
      });
    });
  });
  smStream.end();
  // Handle the stream error explicitly
  pipeline.pipe(res).on('error', e => {
    console.error(e);
    res.status(500).send('An error occurred while generating the sitemap.');
  });
}
export default generateSitemap;
