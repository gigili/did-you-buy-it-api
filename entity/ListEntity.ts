import {Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {UserEntity} from "./UserEntity";
import {ListItemEntity} from "./ListItemEntity";

@Entity({
	name: "list"
})
export class ListEntity {
	@PrimaryGeneratedColumn()
	id!: number;

	@ManyToOne(type => UserEntity, user => user.id, {cascade: true, nullable: false})
	@JoinColumn({
		name: "userID",
	})
	user!: Promise<UserEntity>;

	@Column({
		length: 150
	})
	name!: string;

	@Column({
		type: "timestamp"
	})
	created_at!: string;

	@ManyToMany(() => UserEntity, users => users.id)
	@JoinTable({
		name: "list_user"
	})
	users!: Promise<UserEntity[]>;

	@OneToMany(() => ListItemEntity, items => items.list)
	items!: Promise<ListItemEntity[]>;
}
