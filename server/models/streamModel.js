import mongoose from "mongoose";

const streamSchema = new mongoose.Schema({
  streamId: {
    type: String,
    required: true,
    unique: true,
  },
  viewers: {
    type: [String],
    default: [],
  },
});

const streamModel = mongoose.model("streams", streamSchema);
export default streamModel;
