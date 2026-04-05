import { createContentLoader } from 'vitepress'

export default createContentLoader('posts/*.md', {
  excerpt: true,
  transform(rawData) {
    return rawData
      .map((page) => ({
        title: page.frontmatter.title || page.url.split('/').pop()?.replace('.html', ''),
        url: page.url,
        date: page.frontmatter.date ? new Date(page.frontmatter.date).toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }) : 'Unknown',
        timestamp: page.frontmatter.date ? new Date(page.frontmatter.date).getTime() : 0,
        category: page.frontmatter.category || 'Default',
        summary: page.frontmatter.summary || (page.excerpt ? page.excerpt.replace(/<[^>]+>/g, '') : '')
      }))
      .sort((a, b) => b.timestamp - a.timestamp)
  }
})