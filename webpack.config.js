const path = require('path');
const typescriptIsTransformer = require('typia/lib/transform').default

module.exports = {
    mode: "production",
    entry: './www/src/KaleyraVideo.ts',

    // Enable sourcemaps for debugging webpack's output.
    //devtool: "source-map",
    resolve: {
        extensions: [".webpack.js", ".web.js", ".ts", ".tsx", ".js"],
        symlinks: true
    },
    output: {
        path: __dirname + '/www/out',
        filename: 'kaleyra-video.min.js',
        library: 'KaleyraVideo',
        libraryTarget: 'umd',
        libraryExport: 'default',
        umdNamedDefine: true
    },
    module: {
        rules: [
            {
                test: /\.tsx$/,
                loader: 'babel-loader',
                options: {
                    configFile: path.resolve('babel.config.js')
                },
                include: [
                    path.resolve('www/src')
                ]
            },
            {
                test: /\.tsx$/,
                loader: 'babel-loader',
                options: {
                    configFile: path.resolve('commonjs-babel.config.js')
                },
                include: [
                    path.resolve('node_modules/typia')
                ]
            },
            // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
            // {
            //     enforce: "pre",
            //     test: /\.js$/,
            //     loader: "source-map-loader"
            // },
            {
                test: /\.ts$/,
                loader: 'ts-loader', // or 'awesome-typescript-loader'
                exclude: /node_modules/,
                options: {
                    getCustomTransformers: program => ({
                        before: [
                            typescriptIsTransformer(program, {
                                "ignoreMethods": true
                            })]
                    })
                }
            }
        ]
    },
    node: {
        fs: 'empty'
    }
};
