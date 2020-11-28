import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity({
	name: "users"
})
export class UserEntity {

	@PrimaryGeneratedColumn()
	id!: number;

	@Column({
		length: 255
	})
	name!: string;

	@Column({
		length: 50,
		unique: true
	})
	username!: string;

	@Column({
		length: 100,
		unique: true
	})
	email!: string;

	@Column({
		select: false
	})
	password!: string;

	@Column({
		length: 500,
		nullable: true,
		type: "varchar"
	})
	image!: string | null;

	@Column({
		length: 15,
		select: false
	})
	activation_key!: string;

	@Column({
		enumName: "status",
		enum: ["0", "1"],
		default: "0",
		type: "enum"
	})
	status!: string;
}
