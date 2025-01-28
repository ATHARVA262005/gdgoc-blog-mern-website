import { Helmet } from 'react-helmet-async';

const SEO = ({ 
  title, 
  description, 
  image, 
  article = false, 
  keywords,
  author,
  publishedAt,
  modifiedAt,
  canonicalUrl,  // Add this prop
  structuredData,
  organization = {
    name: 'GDGoC PDEAs COE',
    logo: `${import.meta.env.VITE_APP_URL}/logo.png`,
    location: 'PDEA COE, Pune',
    branch: true
  }
}) => {
  const siteUrl = import.meta.env.VITE_APP_URL || 'https://yourdomain.com';
  const siteTitle = 'GDG Blog';
  const defaultDescription = 'Official blog of Google Developer Group';
  
  // Generate canonical URL if not provided
  const canonical = canonicalUrl || window.location.href;

  return (
    <Helmet>
      {/* Add canonical URL */}
      <link rel="canonical" href={canonical} />
      
      {/* Basic Meta Tags */}
      <title>{`${title} | ${siteTitle}`}</title>
      <meta name="description" content={description || defaultDescription} />
      {keywords && <meta name="keywords" content={keywords} />}

      {/* Open Graph Meta Tags */}
      <meta property="og:site_name" content={siteTitle} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description || defaultDescription} />
      <meta property="og:type" content={article ? 'article' : 'website'} />
      <meta property="og:image" content={image || `${siteUrl}/default-og-image.jpg`} />
      <meta property="og:url" content={window.location.href} />

      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description || defaultDescription} />
      <meta name="twitter:image" content={image || `${siteUrl}/default-og-image.jpg`} />

      {/* Article Specific Meta Tags */}
      {article && (
        <>
          <meta property="article:published_time" content={publishedAt} />
          {modifiedAt && <meta property="article:modified_time" content={modifiedAt} />}
          {author && <meta property="article:author" content={author} />}
        </>
      )}

      {/* Enhanced Schema.org JSON-LD */}
      <script type="application/ld+json">
        {JSON.stringify(
          structuredData || {
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: siteTitle,
            description: defaultDescription,
            url: siteUrl
          }
        )}
      </script>

      {/* Add Organization Schema */}
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Organization',
          '@id': `${siteUrl}/#organization`,
          name: organization.name,
          url: siteUrl,
          logo: organization.logo,
          location: organization.location,
          sameAs: [
            'https://gdg.community.dev/gdg-pdea/',
            // Add other social/community links
          ],
          parentOrganization: {
            '@type': 'Organization',
            name: 'Google Developer Groups',
            url: 'https://developers.google.com/community/gdg'
          }
        })}
      </script>

      {/* Add Website Schema with branch hierarchy */}
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          '@id': `${siteUrl}/#website`,
          name: `${organization.name} Blog`,
          url: siteUrl,
          description: defaultDescription,
          publisher: {
            '@id': `${siteUrl}/#organization`
          },
          hasPart: [
            {
              '@type': 'WebPage',
              '@id': `${siteUrl}/trending`,
              name: 'Trending Posts',
              isPartOf: { '@id': `${siteUrl}/#website` }
            },
            {
              '@type': 'WebPage',
              '@id': `${siteUrl}/treasure`,
              name: 'Blog Treasure',
              isPartOf: { '@id': `${siteUrl}/#website` }
            }
          ]
        })}
      </script>

      {/* Add breadcrumb schema */}
      {article && (
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                item: {
                  '@id': siteUrl,
                  name: 'Home'
                }
              },
              {
                '@type': 'ListItem',
                position: 2,
                item: {
                  '@id': canonicalUrl,
                  name: title
                }
              }
            ]
          })}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;
