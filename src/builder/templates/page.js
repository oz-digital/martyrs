export default `
  <html {{{ meta.htmlAttrs }}}>
    <head {{{ meta.headAttrs }}}>
      {{{ meta.headTags }}}
      
      <meta charset="UTF-8">
      <link rel="apple-touch-icon" sizes="180x180" href="/favicon/apple-touch-icon.png">
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon/favicon-32x32.png">
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon/favicon-16x16.png">
      <link rel="mask-icon" href="/favicon/safari-pinned-tab.svg" color="#5bbad5">
      <meta name="msapplication-TileColor" content="#000000">
      <meta name="theme-color" content="#ffffff">
      <meta name="viewport" content="viewport-fit=cover, width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      
      {{{ head }}}
    </head>
    
    <body {{{ meta.bodyAttrs }}}>
      <div id="app">{{{ appHtml }}}</div>
      
      <script type="application/json" data-user-state>
         {{{ userState }}}
      </script>

      <script type="application/json" data-state>
        {{{ initialState }}}
      </script>

      <script type="application/json" data-loaded-modules>
        {{{ loadedModulesJson }}}
      </script>
      
      {{{ meta.body }}} {{{ body }}}
      
      <script>
        // Load PWA manifest after initial render
        if ('requestIdleCallback' in window) {
          requestIdleCallback(() => {
            const link = document.createElement('link');
            link.rel = 'manifest';
            link.href = '/manifest.json';
            document.head.appendChild(link);
          });
        } else {
          setTimeout(() => {
            const link = document.createElement('link');
            link.rel = 'manifest';
            link.href = '/manifest.json';
            document.head.appendChild(link);
          }, 0);
        }
      </script>
    </body>
  </html>
`;
