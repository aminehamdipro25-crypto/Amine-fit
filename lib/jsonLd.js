// Safely serialize a JSON-LD object for embedding inside a <script> tag.
// JSON.stringify does NOT escape '<', '>', '&', so a value containing
// "</script>" (or a lone '<') could break out of the script element and inject
// markup. Escaping these as \uXXXX keeps the JSON valid while making script-tag
// breakout impossible. U+2028/U+2029 are also escaped for safe reuse in inline
// JS contexts (harmless inside JSON-LD, which is parsed as JSON).
const LS = String.fromCharCode(0x2028)
const PS = String.fromCharCode(0x2029)

export function safeJsonLd(obj) {
  return JSON.stringify(obj)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(new RegExp(LS, 'g'), '\\u2028')
    .replace(new RegExp(PS, 'g'), '\\u2029')
}
