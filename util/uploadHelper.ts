import {FileArray, UploadedFile} from "express-fileupload";

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

		for (const img of Object.values(files)) {
			const image = img as UploadedFile;
			const extension = image.name.substring(image.name.lastIndexOf(".") + 1, image.name.length);
			if (!this.AllowedExtensions.images.includes(extension)) {
				return false;
			}
		}

		return true;
	},

	//TODO: Implement a general function for handling of single or multiple file uploads
	async handle_upload(file: FileArray, fileName?: string, path: string = "./public/images/") {
	}
};

module.exports = uploadHelper;
