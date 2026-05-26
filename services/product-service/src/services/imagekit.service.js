const ImageKit = require("@imagekit/nodejs");
const { v4: uuidv4 } = require("uuid");

const imagekit = new ImageKit({
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "test_private_key",
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY || "test_public_key",
  urlEndpoint:
    process.env.IMAGEKIT_URL_ENDPOINT || "https://ik.imagekit.io/test",
});

const uploadImage = async ({ buffer, folder = "/scale-cart/products" }) => {
  const res = await imagekit.files.upload({
    file: buffer.toString("base64"),
    fileName: `${uuidv4()}.jpg`,
    folder: folder,
  });
  return {
    url: res.url,
    thumbnail: res.thumbnailUrl || res.url,
    id: res.fileId,
  };
};

const deleteImage = async (fileId) => {
  return await imagekit.files.delete(fileId);
};

module.exports = {
  imagekit,
  uploadImage,
  deleteImage,
};
