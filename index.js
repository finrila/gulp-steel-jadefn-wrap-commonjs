/**
 * steel jadefn wrap commonjs 
 * copy jade runtime file to src/js/tpl/ 
 * @author Finrila finrila@gmail.com
 */

var fs = require('fs');
var path = require('path');
var jade = require('jade');
var extend = require('util')._extend;
var gutil = require('gulp-util');
var ext = gutil.replaceExtension;
var File = gutil.File;

var through = require('through2');

module.exports = function(options) {

    options = extend({
        runtimePath: 'tpl/'
    }, options);

    var runtimePath = options.runtimePath;

    var runtimeFile;

    function Wrap_node(file, enc, cb) {

        if (!runtimeFile) {
            runtimeFile = file.clone({contents: false});
        }

        file.path = ext(file.path, '.js');

        if (file.isStream()) {
            return cb(new PluginError('gulp-steel-jadefn-wrap-commonjs', 'Streaming not supported'));
        }

        if (file.isBuffer()) {
            try {
                var compiled;
                var contents = String(file.contents);
                compiled = 'var jade = require(\'' + runtimePath + 'runtime\');\nvar undefined = void 0;\nmodule.exports = ' + contents + ';';
                file.contents = new Buffer(compiled);
            } catch (e) {
                return cb(new PluginError('gulp-steel-jadefn-wrap-commonjs', e));
            }
        }
        cb(null, file);
    }

    return through.obj(Wrap_node, function(cb) {
        if (!runtimeFile) {
            cb();
            return;
        }
        var runtimeFileName = 'runtime.js';
        var runtimeFileNameInLib = runtimeFileName;
        if (jade.runtime.DebugItem) {
            runtimeFileNameInLib = 'runtime-1.11.0.js';
        }
        runtimeFile.path = path.join(runtimeFile.base, runtimePath, runtimeFileName);
        runtimeFile.contents = new Buffer(fs.readFileSync(path.join(__dirname, './lib/jade/' + runtimeFileNameInLib), 'utf-8'));
        this.push(runtimeFile);
        cb();
    });

};