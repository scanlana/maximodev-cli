/*
 * Copyright (c) 2018-present, IBM CORP.
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// https://www.npmjs.com/package/mustache
var mustache = require('mustache');
var fs = require('fs-extra');
var log = require('./logger');
var path = require('path');
var env = require('./env');

var templates = module.exports = Object.create({});

templates.dir = function() {
  return path.resolve(path.join(env.TOOLS_DIR, "templates"));
}

/**
 * Render template string using args and return the rendered template
 * @param templateStr
 * @param templateArgs
 * @returns {string}
 */
templates.render = function (templateStr, templateArgs) {
  var args = {...templateArgs};
  if (args.addon_id) args.addon_id_lower = args.addon_id.toLowerCase();
  return mustache.render(templateStr, args);
};

/**
 * Return the contents of the template.
 * @param tplPath relative to 'templates' folder
 * @returns {string}
 */
templates.resolveContents = function(tplPath) {
  return fs.readFileSync(templates.resolveName(tplPath));
};

/**
 * resolve template name relative to the 'templates' folder
 * @param tplPath
 * @returns {*|string}
 */
templates.resolveName = function(tplPath) {
  return (path.join(templates.dir(), tplPath));
};

/**
 * Render template file to the oupput file using the template args
 *
 * @param templateFileIn
 * @param templateArgs
 * @param outputFile
 */
templates.renderToFile = function(templateFileIn, templateArgs, outputFile) {
  if (!fs.existsSync(templateFileIn)) {
    // not exists, so let's resolve it relative to templates
    var t = templates.resolveName(templateFileIn);
    if (!fs.existsSync(t)) throw Error('Missing template file: ' + templateFileIn);
    templateFileIn=t;
  }
  if (!fs.existsSync(templateFileIn)) throw Error('Missing template file: ' + templateFileIn);

  if (!outputFile) {
    if (templateFileIn.endsWith(".in")) {
      outputFile = templateFileIn.substring(0, templateFileIn.length-3);
    }
  }

  if (!outputFile) throw Error("Missing output file or input is not a .in file");

  var tplText = fs.readFileSync(templateFileIn,"utf8");
  log.trace(tplText);
  var rendered = templates.render(tplText, templateArgs);
  log.trace(rendered);

  if (rendered) {
    fs.ensureDirSync(path.dirname(outputFile));
    fs.writeFileSync(outputFile, rendered, "utf8");
  }
};