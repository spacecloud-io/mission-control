const { override, fixBabelImports, addLessLoader } = require('customize-cra');

const addSvgLoader = () => config => {
  let oneOfRule = config.module.rules.find((r) => r.oneOf);
  oneOfRule.oneOf.splice(0, 0, {
    test: /\.svg/,
    use: {
      loader: "svg-url-loader",
      options: {
        limit: 15000,
      },
    },
  });

  return config;
}
module.exports = override(
  fixBabelImports('import', {
    libraryName: 'antd',
    libraryDirectory: 'es',
    style: true,
  }),
  addLessLoader({
    javascriptEnabled: true,
    modifyVars: {
      '@primary-color': '#FF6700',
      '@label-color': "rgba(0,0,0, 0.56)"
    },
  }),
  addSvgLoader()
);
