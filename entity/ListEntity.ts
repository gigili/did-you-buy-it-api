import {Column, Entity, JoinColumn, JoinTable, ManyToMany, OneToMany, OneToOne, PrimaryGeneratedColumn} from "typeorm";
import {UserEntity} from "./UserEntity";
import {ListItemEntity} from "./ListItemEntity";

@Entity({
	name: "list"
})
export class ListEntity {
	@PrimaryGeneratedColumn()
	id!: number;

	@OneToOne(type => UserEntity, user => user.id, {cascade: true, nullable: false})
	@JoinColumn({
		name: "userID",
	})
	user!: UserEntity;

	@Column({
		length: 150
	})
	name!: string;

	@Column({
		type: "datetime"
	})
	created_at!: string;

	@ManyToMany(() => UserEntity, users => users.id)
	@JoinTable({
		name: "list_user"
	})
	users!: UserEntity[];

	@OneToMany(() => ListItemEntity, items => items.list)
	items!: ListItemEntity[];
}
