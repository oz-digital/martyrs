export default `
  <html {{{ meta.htmlAttrs }}}>
    <head {{{ meta.headAttrs }}}>
      {{{ meta.headTags }}}
      <meta charset="UTF-8">
      
      <!-- Facebook Domain Verification -->
      {{#facebookDomainVerification}}
      <meta name="facebook-domain-verification" content="{{facebookDomainVerification}}">
      {{/facebookDomainVerification}}
      
      <link rel="apple-touch-icon" sizes="180x180" href="/favicon/apple-touch-icon.png">
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon/favicon-32x32.png">
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon/favicon-16x16.png">
      <link rel="manifest" href="/manifest.json">
      <link rel="mask-icon" href="/favicon/safari-pinned-tab.svg" color="#5bbad5">
      <meta name="msapplication-TileColor" content="#000000">
      <meta name="theme-color" content="#ffffff">
      <meta name="viewport" content="viewport-fit=cover, width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <!-- Facebook Pixel Code -->
      {{#facebookPixelId}}
      <script>
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', '{{facebookPixelId}}');
      fbq('track', 'PageView');
      </script>
      <noscript><img height="1" width="1" style="display:none"
      src="https://www.facebook.com/tr?id={{facebookPixelId}}&ev=PageView&noscript=1"
      /></noscript>
      {{/facebookPixelId}}
      
      {{{ head }}}
      
      <!-- Google Tag (gtag.js) -->
      {{#googleTagId}}
      <script async src="https://www.googletagmanager.com/gtag/js?id={{googleTagId}}"></script>
      <script>
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '{{googleTagId}}');
      </script>
      {{/googleTagId}}
    </head>
    
    <body {{{ meta.bodyAttrs }}}>
      <div id="app">{{{ appHtml }}}</div>
      
      <script type="application/json" data-user-state>
         {{{ userState }}}
      </script>

      <script type="application/json" data-state>
        {{{ initialState }}}
      </script>
      
      {{{ meta.body }}} {{{ body }}}
    </body>
  </html>
`;
