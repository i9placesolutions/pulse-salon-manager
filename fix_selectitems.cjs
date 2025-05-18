const fs = require('fs');
const path = require('path');

// Caminho para o arquivo Relatorios.tsx
const filePath = path.join(__dirname, 'src', 'pages', 'Relatorios.tsx');

// Ler o conteúdo do arquivo
let content = fs.readFileSync(filePath, 'utf8');

// Substituir todos os <SelectItem value=""> por <SelectItem value="all">
content = content.replace(/<SelectItem value="">/g, '<SelectItem value="all">');

// Substituir todos os <SelectItem value="" disabled>Carregando...</SelectItem> por <SelectItem value="loading" disabled>Carregando...</SelectItem>
content = content.replace(/<SelectItem value="" disabled>Carregando\.\.\.<\/SelectItem>/g, '<SelectItem value="loading" disabled>Carregando...</SelectItem>');

// Ajustar a lógica para lidar com o valor "all"
content = content.replace(/value={globalFilters\.professionalId \|\| ""}/g, 'value={globalFilters.professionalId || "all"}');
content = content.replace(/value={globalFilters\.serviceId \|\| ""}/g, 'value={globalFilters.serviceId || "all"}');
content = content.replace(/value={globalFilters\.status}/g, 'value={globalFilters.status || "all"}');

// Atualizar as funções onValueChange para converter "all" de volta para ""
content = content.replace(/onValueChange={\(value\) => setGlobalFilters\({ \.\.\.globalFilters, professionalId: value }\)}/g, 
                          'onValueChange={(value) => setGlobalFilters({ ...globalFilters, professionalId: value === "all" ? "" : value })}');
content = content.replace(/onValueChange={\(value\) => setGlobalFilters\({ \.\.\.globalFilters, serviceId: value }\)}/g, 
                          'onValueChange={(value) => setGlobalFilters({ ...globalFilters, serviceId: value === "all" ? "" : value })}');
content = content.replace(/onValueChange={\(value\) => setGlobalFilters\({ \.\.\.globalFilters, status: value }\)}/g, 
                          'onValueChange={(value) => setGlobalFilters({ ...globalFilters, status: value === "all" ? "" : value })}');

// Salvar o conteúdo modificado de volta no arquivo
fs.writeFileSync(filePath, content, 'utf8');

console.log('Correções aplicadas com sucesso!');
