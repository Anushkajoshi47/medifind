const fs = require('fs');
function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = dir + '/' + file;
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else {
      if(file.endsWith('.js')) results.push(file);
    }
  });
  return results;
}

const files = walk('c:/Users/Chintan/Downloads/medifind-app (1)/medifind/frontend/src/screens').concat(walk('c:/Users/Chintan/Downloads/medifind-app (1)/medifind/frontend/src/navigation'));

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  content = content.replace(/,\s*textTransform:\s*'uppercase'/g, '');
  content = content.replace(/,\s*textTransform:\s*"uppercase"/g, '');
  content = content.replace(/,\s*letterSpacing:\s*\d+(\.\d+)?/g, '');
  content = content.replace(/,\s*textShadowColor:\s*[^,]+,\s*textShadowOffset:\s*\{[^}]+\},\s*textShadowRadius:\s*\d+/g, '');
  content = content.replace(/,\s*textShadowColor:\s*[^,]+,\s*textShadowRadius:\s*\d+/g, '');
  content = content.replace(/fontWeight:\s*'900'/g, "fontWeight: '600'");
  content = content.replace(/fontWeight:\s*'800'/g, "fontWeight: '600'");
  content = content.replace(/rgba\(0,\s*240,\s*255/g, 'rgba(14, 165, 233');
  content = content.replace(/rgba\(176,\s*38,\s*255/g, 'rgba(45, 212, 191');
  content = content.replace(/borderRadius:\s*4/g, 'borderRadius: 12');
  
  content = content.replace(/'#00F0FF',\s*'#0084FF'/g, "COLORS.primary, '#0369A1'");
  content = content.replace(/COLORS\.primary,\s*'#0084FF'/g, "COLORS.primary, '#0369A1'");
  content = content.replace(/\['#0B0F19',\s*'#131B2F'\]/g, "['#0F172A', '#1E293B']");
  
  fs.writeFileSync(f, content, 'utf8');
});
console.log('Done mapping themes.');
