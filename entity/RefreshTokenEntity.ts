import {Entity, Index, JoinColumn, OneToOne, PrimaryColumn} from "typeorm";
import {UserEntity} from "./UserEntity";

@Index(["user", "token"], {unique: true})
@Entity({
	name: "refresh_token"
})
export class RefreshTokenEntity {

	@PrimaryColumn()
	token!: string;

	@OneToOne(() => UserEntity, user => user.id, {cascade: true, nullable: false})
	@JoinColumn({
		name: "userID"
	})
	user!: UserEntity;
}
