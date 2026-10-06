'use strict';

/** Escaping for text placed in XML/SVG. */
class Xml {
  static escape(text) {
    return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
}

module.exports = Xml;
