import multer from 'multer';
//we use csv-parser package to import products from csv file && we use json2csv form exporting a csv 
const storage = multer.memoryStorage(); // Store CSV file in memory

const csvUpload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv') {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed!'), false);
    }
  }
});

export default csvUpload;
