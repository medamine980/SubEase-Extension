const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const HtmlMinimizerPlugin = require("html-minimizer-webpack-plugin");
const TersetPlugin = require("terser-webpack-plugin")

const package = require("./package.json");

function modify_manifest_json(buffer) {
    // copy-webpack-plugin passes a buffer
    var manifest = JSON.parse(buffer.toString());

    // make any modifications you like, such as
    manifest.version = package.version;

    // pretty print to JSON with four spaces
    manifest_JSON = JSON.stringify(manifest, null, 4);
    return manifest_JSON;
}


module.exports = {
    mode: "production",
    plugins: [
        new CopyPlugin({
            patterns: [
                {
                    from: "**/*.!(js)",
                    filter: async (resourcePath) => {
                        // const data = await fs.promises.readFile(resourcePath);
                        // const content = data.toString();
                        // console.log(resourcePath);
                        // if (content === "my-custom-content") {
                        //     return false;
                        // }
                        if (resourcePath.match(/.*\.js/)) return false;
                        return true;
                    },
                    context: path.resolve(__dirname, "src"),
                },
                {
                    from: "*.json",
                    context: path.resolve(__dirname, "src"),
                    transform(content, path) {
                        if (path.includes("manifest.json")) return modify_manifest_json(content);
                        return content;
                    }
                }
            ],
        }),
    ],
    entry: {
        "service-worker": "./src/service-worker.js",
        "views/search/index": "./src/views/search/index.js",
        "views/settings/index": "./src/views/settings/index.js",
        "views/login/login": "./src/views/login/login.js",
        "popup/js/index": "./src/popup/js/index.js",
        "content_scripts/iframe_script": "./src/content_scripts/iframe_script.js"
    },
    output: {
        path: path.resolve(__dirname, "build"),
    },
    optimization: {
        minimize: true,
        minimizer: [
            new HtmlMinimizerPlugin(),
            new TersetPlugin()
        ]
    },
    watch: true
};