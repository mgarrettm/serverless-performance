const fs = require('fs');

fs.createReadStream('scripts/res/createFunctions.js').pipe(fs.createWriteStream('node_modules/serverless-google-cloudfunctions/deploy/lib/createFunctions.js'));