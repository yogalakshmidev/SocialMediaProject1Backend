const DataUriParser = require('datauri');

const path = require('path');

const getDataUri = (file)=>{
  const parser = new DataUriParser();
  const extName = path.extname(file.originalname).toString();
  return parser.format(extName,file.buffer).content;

}

module.exports = getDataUri;
