const fs = require('fs');
const {compile} = require('./lib/format');

if (require.main === module) {
  const [node,dir,ifile,odir] = process.argv;  
  if (!ifile || !odir || !fs.existsSync(ifile) || !fs.existsSync(odir)) {
    console.error('usage: node --experimental-fetch index.js <file_of_orcids> <output_directory>');
    process.exit(1);
  }
  compile({ifile,odir});
}
