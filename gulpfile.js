var gulp = require("gulp");
var babel = require("gulp-babel");
const concat = require('gulp-concat');

gulp.task("default", function() {
  return gulp.src(['test.js', 'index.js', 'HgRepo.js'])
    .pipe(babel())
    .pipe(gulp.dest("dist"));
});
