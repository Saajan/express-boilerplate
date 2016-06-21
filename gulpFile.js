/*!
 * gulp
 * $ npm install gulp-ruby-sass gulp-autoprefixer gulp-cssnano gulp-jshint gulp-concat gulp-uglify gulp-imagemin gulp-notify gulp-rename gulp-livereload gulp-cache del --save-dev
 */

// Load plugins
var gulp = require('gulp'),
  nodemon = require('gulp-nodemon'),
  browserSync = require('browser-sync').create(),
  sass = require('gulp-ruby-sass'),
  autoprefixer = require('gulp-autoprefixer'),
  cssnano = require('gulp-cssnano'),
  eslint = require('gulp-eslint'),
  uglify = require('gulp-uglify'),
  imagemin = require('gulp-imagemin'),
  rename = require('gulp-rename'),
  concat = require('gulp-concat'),
  notify = require('gulp-notify'),
  cache = require('gulp-cache'),
  livereload = require('gulp-livereload'),
  del = require('del');


// Styles
gulp.task('styles', function() {
  return sass('src/styles/main.scss', {
      style: 'expanded'
    })
    .pipe(autoprefixer(['> 1%']))
    .pipe(gulp.dest('public/dist/styles'))
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(cssnano())
    .pipe(gulp.dest('public/dist/styles'))
    .pipe(notify({
      message: 'Styles task complete'
    }));
});

// Scripts
gulp.task('scripts-custom', function() {
  return gulp.src('src/scripts/custom/*.js')
    .pipe(eslint({
      extends: 'eslint:recommended',
      ecmaFeatures: {
        'modules': true
      },
      rules: {
        'my-custom-rule': 1,
        'strict': 2
      },
      globals: {
        'jQuery': false,
        '$': true
      },
      envs: [
        'browser'
      ]
    }))
    .pipe(concat('main.js'))
    .pipe(gulp.dest('public/dist/scripts'))
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(uglify())
    .pipe(gulp.dest('public/dist/scripts'))
    .pipe(notify({
      message: 'Scripts task for customs is complete'
    }));
});

// Scripts
gulp.task('scripts-vendor', function() {
  return gulp.src(['src/scripts/vendor/*.js'])
    .pipe(concat('vendor.js'))
    .pipe(gulp.dest('public/dist/scripts'))
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(uglify())
    .pipe(gulp.dest('public/dist/scripts'))
    .pipe(notify({
      message: 'Scripts task for vendor is complete'
    }));
});

//Copy
gulp.task('copy', function() {
  return gulp
    .src('src/styles/etc/**/*')
    .pipe(gulp.dest('public/dist/styles/etc'));
});

//Copy
//gulp.task('copy-script', function() {
//  return gulp
//    .src('src/scripts/vendor/*js')
////    .pipe(gulp.dest('public/dist/scripts/vendor'));
//});

// Images
gulp.task('images', function() {
  return gulp.src('src/images/**/*')
    .pipe(cache(imagemin({
      optimizationLevel: 3,
      progressive: true,
      interlaced: true
    })))
    .pipe(gulp.dest('public/dist/images'))
    .pipe(notify({
      message: 'Images task complete'
    }));
});

gulp.task('browser-sync', function() {
  browserSync.init(null, {
    proxy: "http://localhost:5000"
  });
});

gulp.task('server', function() {
  // configure nodemon
  nodemon({
    // the script to run the app
    script: 'app.js',
    // this listens to changes in any of these files/routes and restarts the application
    watch: ["app.js", "routes/", 'public/*', 'public/*/**'],
    ext: 'js'
      // Below i'm using es6 arrow functions but you can remove the arrow and have it a normal .on('restart', function() { // then place your stuff in here }
  }).on('restart', () => {
    gulp.src('app.js')
      // I've added notify, which displays a message on restart. Was more for me to test so you can remove this
      .pipe(notify('Running the start tasks and stuff'));
  });
});

// Clean
gulp.task('clean', function() {
  return del(['public/dist/styles', 'public/dist/scripts', 'public/dist/images']);
});

// Default task
gulp.task('default', ['clean'], function() {
  gulp.start('styles', 'scripts-custom', 'scripts-vendor', 'images', 'copy', 'server', 'browser-sync', 'watch');
});

// Watch
gulp.task('watch', function() {

  // Watch .scss files
  gulp.watch('src/styles/**/*.scss', ['styles']);

  // Watch .js files
  gulp.watch('src/scripts/**/*.js', ['scripts-custom', 'scripts-vendor']);

  // Watch image files
  gulp.watch('src/images/**/*', ['images']);

  // Create LiveReload server
  livereload.listen();

  // Watch any files in dist/, reload on change
  gulp.watch(['public/dist/**']).on('change', browserSync.reload);

  gulp.watch(['views/**']).on('change', browserSync.reload);

});
