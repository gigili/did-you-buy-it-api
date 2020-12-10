import {Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {UserEntity} from "./UserEntity";
import {ListEntity} from "./ListEntity";

@Entity({
	name: "list_item"
})
export class ListItemEntity {
	@PrimaryGeneratedColumn()
	id!: number;

	@ManyToOne(() => ListEntity, list => list.id, {cascade: true, nullable: false})
	@JoinColumn({
		name: "listID"
	})
	list!: Promise<ListEntity>;

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

	@ManyToOne(() => UserEntity, userID => userID.id, {cascade: true, nullable: false})
	@JoinColumn({
		name: "userID"
	})
	userID!: Promise<UserEntity>;

	@ManyToOne(() => UserEntity, purchasedUserID => purchasedUserID.id, {cascade: true, nullable: true})
	@JoinColumn({
		name: "userPurchasedID",
	})
	purchasedUserID!: UserEntity;

	@Column({
		type: "timestamp",
		nullable: true
	})
	purchase_date!: string | null;

	@Column({
		type: "enum",
		enum: ["0", "1"],
		default: "0"
	})
	is_repeating!: string;
}
