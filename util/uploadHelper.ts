import {FileArray} from "express-fileupload";

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
	}
};

module.exports = uploadHelper;
