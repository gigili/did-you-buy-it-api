import {Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn} from "typeorm";
import {UserEntity} from "./UserEntity";
import {ListEntity} from "./ListEntity";

@Entity({
	name: "list_item"
})
export class ListItemEntity {
	@PrimaryGeneratedColumn()
	id!: number;

	@OneToOne(() => ListEntity, list => list.id, {cascade: true, nullable: false})
	@JoinColumn({
		name: "listID"
	})
	list!: number;

	@Column({
		length: 255
	})
	name!: string;

	@Column({
		length: 255,
		nullable: true,
		type: "varchar"
	})
	image!: string | null;

	@OneToOne(() => UserEntity, userID => userID.id, {cascade: true, nullable: false})
	@JoinColumn({
		name: "userID"
	})
	userID!: UserEntity;

	@OneToOne(() => UserEntity, purchasedUserID => purchasedUserID.id, {cascade: true, nullable: true})
	@JoinColumn({
		name: "userPurchasedID",
	})
	purchasedUserID!: UserEntity;

	@Column({
		type: "datetime"
	})
	purchase_date!: string;

	@Column({
		type: "enum",
		enum: ["0", "1"],
		default: "0"
	})
	is_repeating!: string;

	@OneToMany(() => ListItemEntity, listItems => listItems.list)
	listItems!: ListItemEntity[];
}
