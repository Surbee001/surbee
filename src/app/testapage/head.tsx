export default function Head() {
  return (
    <>
      <link
        rel="preload"
        href="/testapage/fonts/17330fd087386262-s.p.woff2"
        as="font"
        type="font/woff2"
        crossOrigin="anonymous"
      />
      <link
        rel="preload"
        href="/testapage/fonts/93f479601ee12b01-s.p.woff2"
        as="font"
        type="font/woff2"
        crossOrigin="anonymous"
      />
      <link
        rel="preload"
        href="/testapage/fonts/be66fc6922929061-s.p.woff2"
        as="font"
        type="font/woff2"
        crossOrigin="anonymous"
      />
      <link
        rel="preload"
        href="/testapage/fonts/9610d9e46709d722-s.woff2"
        as="font"
        type="font/woff2"
        crossOrigin="anonymous"
      />
      <link
        rel="preload"
        href="/testapage/fonts/747892c23ea88013-s.woff2"
        as="font"
        type="font/woff2"
        crossOrigin="anonymous"
      />
      <link rel="stylesheet" href="/testapage/css/af1fe7ec6b60f319.css" />
      <link rel="stylesheet" href="/testapage/css/8b7d179711c59696.css" />
      <link rel="icon" href="/testapage/assets/icon0.svg" type="image/svg+xml" />
      <link rel="icon" href="/testapage/assets/favicon.ico" type="image/x-icon" />
      <link rel="apple-touch-icon" href="/testapage/assets/apple-icon.png" sizes="180x180" />
      <link rel="icon" href="/testapage/assets/icon1.png" type="image/png" sizes="96x96" />
      <title>Cofounder</title>
      <meta
        name="description"
        content="Automate your life with natural language. Cofounder plugs into your existing tools, writes automations, and organizes workflows."
      />
      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function () {
              try {
                var doc = document.documentElement;
                doc.classList.remove('dark');
                doc.classList.add('light');
                if (document.body) {
                  document.body.classList.remove('dark');
                  document.body.classList.add('light');
                }
                if (typeof localStorage !== 'undefined') {
                  localStorage.setItem('surbee-theme', 'light');
                }
              } catch (error) {
                console.warn('Failed to force light theme for /testapage.', error);
              }
            })();
          `,
        }}
      />
    </>
  );
}
