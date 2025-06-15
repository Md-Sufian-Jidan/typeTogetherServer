import mongoose from "mongoose";

const DocumentSchema = new mongoose.Schema(
    {
        _id: {
            type: String,
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
        data: {
            type: Object,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const Document = mongoose.models.Document || mongoose.model("Document", DocumentSchema);

export default Document;
