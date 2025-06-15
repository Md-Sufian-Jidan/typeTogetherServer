import Document from "../schema/docSchema.js";

export const getDocument = async (id, user) => {
    if (!id) return null;

    const document = await Document.findById(id);
    if (document) return document;

    await Document.create({
        _id: id,
        data: "",
        email: user?.email,
        name: user?.name,
    });
};


export const updateDocument = async (id, content, user) => {
    if (!id) throw new Error("Document ID required");

    const filter = { _id: id };
    const update = {
        name: user.name,
        email: user.email,
        data: content,
    };
    const options = { upsert: true, new: true, setDefaultsOnInsert: true };

    const updatedDoc = await Document.findOneAndUpdate(filter, update, options);
    return updatedDoc;
};

