const fs = require('fs');
let c = fs.readFileSync('components/ProductoForm.tsx', 'utf8');
c = c.replace(
  '          disponible, \n          fotosUrls,',
  '          disponible, \n          categoria: categoria.trim() || undefined,\n          fotosUrls,'
);
c = c.replace('          list="p-categorias-list"\n', '');
c = c.replace(
  /<datalist id="p-categorias-list">[\s\S]*?<\/datalist>/,
  '{categoriasExistentes.length > 0 && (\n' +
  '          <div className="flex flex-wrap gap-2 mt-2">\n' +
  '            {categoriasExistentes.map(cat => (\n' +
  '              <button\n' +
  '                key={cat}\n' +
  '                type="button"\n' +
  '                onClick={() => setCategoria(cat)}\n' +
  '                className={	ext-xs px-2.5 py-1 rounded-full border transition-colors }\n' +
  '              >\n' +
  '                {cat}\n' +
  '              </button>\n' +
  '            ))}\n' +
  '          </div>\n' +
  '        )}'
);
fs.writeFileSync('components/ProductoForm.tsx', c);
