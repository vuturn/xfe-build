module.exports = {
    plugins: [
        require('postcss-smart-import')({}),
        require('precss')({}),
        require('autoprefixer')({
            browsers: ['> 1%', 'last 5 versions', 'Firefox >= 20', 'iOS >= 7',
                /** @see https://github.com/postcss/autoprefixer/issues/776 */
                'safari >= 6']
        })
    ]
}
