const CompressionWebpackPlugin = require("compression-webpack-plugin");
const isProd = process.env.NODE_ENV === "production";

module.exports = {
  devServer: {
    open: true,
    port: "1234",
    host: "0.0.0.0",
    proxy: {
      "/api/v1": {
        target: "https://dmmm.io",
        ws: true,
        changeOrigin: true,
        secure: true,
        onProxyRes: function(proxyRes, req) {
          var cookies = proxyRes.headers["set-cookie"];
          var cookieRegex = /Domain=dmmm\.io/i;
          if (cookies) {
            var newCookie = cookies.map(function(cookie) {
              if (cookieRegex.test(cookie)) {
                return cookie.replace(
                  cookieRegex,
                  "Domain=" + req.headers.host.split(":")[0]
                );
              }
              return cookie;
            });
            delete proxyRes.headers["set-cookie"];
            proxyRes.headers["set-cookie"] = newCookie;
          }
        }
      }
    },
    disableHostCheck: true
  },
  chainWebpack: config => {
    config.resolve.alias.merge({
      "@assets": `${__dirname}/src/assets`,
      "@comps": `${__dirname}/src/components`
    });
    const basePath = `${__dirname}/src/assets/`;
    config.plugin("spritesmith").use(require("webpack-spritesmith"), [
      {
        src: { cwd: `${basePath}img/icon/`, glob: "icon-*.png" },
        target: {
          image: `${basePath}img/sprite.png`,
          css: `${basePath}scss/_sprite_variables.scss`
        },
        apiOptions: { cssImageRef: "~@assets/img/sprite.png" },
        spritesmithOptions: { padding: 6 }
      }
    ]);
  },
  configureWebpack: {
    plugins: isProd
      ? [
          new CompressionWebpackPlugin({
            test: /\.(js|css|svg|woff|ttf|json|html)$/,
            threshold: 10240
          })
        ]
      : []
  },
  css: {
    loaderOptions: {
      postcss: {
        plugins: [
          require("postcss-plugin-px2rem")({
            rootValue: 75,
            exclude: /(node_module)/,
            mediaQuery: false,
            minPixelValue: 0
          })
        ]
      }
    }
  },
  pluginOptions: {
    vconsole: { enable: true }
  }
};
