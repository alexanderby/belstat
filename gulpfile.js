const gulp = require('gulp');
const gulpConnect = require('gulp-connect');
const gulpRename = require('gulp-rename');
const gulpReplace = require('gulp-replace');
const Malevic = require('malevic');
const rollup = require('rollup');
const rollupPluginTypescript = require('@alexlur/rollup-plugin-typescript');
const rollupStream = require('rollup-stream');
const sourceStream = require('vinyl-source-stream');
const typescript = require('typescript');

require('ts-node/register');
const Body = require('./src/Body').default;
const data = require('./src/data/belstat').default;

gulp.task('build-js', () => {
    return rollupStream({
        input: './src/index.tsx',
        strict: true,
        format: 'iife',
        external: ['malevic'],
        globals: { 'malevic': 'Malevic' },
        rollup,
        sourcemap: 'inline',
        plugins: [
            rollupPluginTypescript({
                typescript
            })
        ]
    })
        .pipe(sourceStream('index.js'))
        .pipe(gulp.dest('./www'))
        .pipe(gulpConnect.reload());
});

gulp.task('build-html', () => {
    return gulp.src('./src/index.html')
        .pipe(gulpReplace(
            /{{BODY}}/,
            Malevic.renderToString(
                Body({ title: 'Server Side', data })
            )
        ))
        .pipe(gulp.dest('./www'))
        .pipe(gulpConnect.reload());
});

gulp.task('copy-deps', () => {
    return gulp.src('./node_modules/malevic/umd/index.js')
        .pipe(gulpRename('malevic.js'))
        .pipe(gulp.dest('./www'));
});

gulp.task('watch', ['build-js', 'build-html', 'copy-deps'], () => {
    gulpConnect.server({
        host: '0.0.0.0',
        port: 9073,
        root: './www',
        livereload: true,
    });
    gulp.watch(['src/**/*.ts', 'src/**/*.tsx'], ['build-js']);
    gulp.watch(['src/**/*.html'], ['build-html']);
});

gulp.task('default', ['build-js', 'build-html', 'copy-deps']);
