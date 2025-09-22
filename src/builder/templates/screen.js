export default `
  <!-- <!DOCTYPE html> -->
    <html lang="en">
    <head {{{ meta.headAttrs }}}>
      {{{ meta.headTags }}}
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      <link rel="apple-touch-icon" sizes="180x180" href="/favicon/apple-touch-icon.png">
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon/favicon-32x32.png">
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon/favicon-16x16.png">
      <link rel="manifest" href="/favicon/site.webmanifest">
      <link rel="mask-icon" href="/favicon/safari-pinned-tab.svg" color="#5bbad5">
      <meta name="msapplication-TileColor" content="#000000">
      <meta name="theme-color" content="#ffffff">
      <meta name="viewport" content="viewport-fit=cover, width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      {{{ head }}}
      <!-- Sign in with Apple -->
      <!-- <script type="text/javascript" src="https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js"></script> -->
    </head>
    <!-- Google tag (gtag.js) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id={{googleTagId}}"></script>
    
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

      <script>
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());

        gtag('config', '{{googleTagId}}');
      </script>
      
      {{{ meta.body }}} {{{ body }}}
    </body>
  </html>
`;
