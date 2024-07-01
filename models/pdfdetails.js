const mongoose = require("mongoose");
const { Schema } = mongoose;

const PdfDetailsSchema = new Schema(
  {
    pdf: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    }
  }
);

const PDF  = mongoose.model("PdfDetails", PdfDetailsSchema);
module.exports = PDF;