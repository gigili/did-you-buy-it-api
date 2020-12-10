import {Column, Entity, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {ListEntity} from "./ListEntity";

@Entity({
	name: "user"
})
export class UserEntity {

	@PrimaryGeneratedColumn()
	id!: number;

	@Column({length: 255})
	name!: string;

	@Column({length: 100, unique: true})
	email!: string;

	@Column({length: 50, unique: true})
	username!: string;

	@Column({select: false})
	password!: string;

	@Column({length: 500, nullable: true, type: "varchar"})
	image!: string | null;

	@Column({length: 15, select: false})
	activation_key!: string;

	@Column({default: false})
	status!: boolean;

	@OneToMany(() => ListEntity, lists => lists.user)
	lists!: Promise<ListEntity[]>;
}
