import {FileArray} from "express-fileupload";

const fs = require("fs");

const uploadHelper = {
	AllowedExtensions: {
		images: ["jpg", "jpeg", "png", "bmp"],
		documents: ["doc", "docx", "xls", "xlsx", "pdf"]
	},
	UploadPaths: {
		listItem: {
			upload: "./public/images/listItem/",
			save: "/images/listItem/"
		},
		user: {
			upload: "./public/images/user/",
			save: "/images/user/"
		}
	},
	allowed_file_type(files: FileArray) {
		if (typeof files === "undefined") {
			return true;
		}

		for (const image of Object.values(files)) {
			const extension = image.name.substring(image.name.lastIndexOf(".") + 1, image.name.length);
			if (!this.AllowedExtensions.images.includes(extension)) {
				return false;
			}
		}

		return true;
	},

	//TODO: Implement a general function for handling of single or multiple file uploads
	async handle_upload(file: FileArray, fileName?: string, path: string = "./public/images/") {
		if (file) {
			const validFile = uploadHelper.allowed_file_type(file);
			if (!validFile) return "Invalid file type";

			if (!fs.existsSync(path)) {
				fs.mkdirSync(path, {recursive: true});
			}

			const newImageName = fileName || file.image.name;
			await file.image.mv(`./public/images/user/${newImageName}`);
		}
	}
};

module.exports = uploadHelper;
