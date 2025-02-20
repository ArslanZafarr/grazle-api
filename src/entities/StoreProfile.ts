import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from "typeorm";
import { User } from "./Users";

@Entity("store_profiles")
export class StoreProfile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 255, nullable: true })
  store_name: string;

  @Column({ nullable: true })
  store_image: string;

  @Column({ type: "text", nullable: true })
  store_description: string;

  @Column({ nullable: true })
  account_name: string;

  @Column({ nullable: true })
  account_number: string;

  @Column({ nullable: true })
  bank_name: string;

  @Column({ nullable: true })
  bank_code: string;

  @Column({ nullable: true })
  business_license: string;

  @Column({ nullable: true })
  tax_id: string;

  @Column({ nullable: true })
  proof_of_address: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  state: string;

  @Column({ nullable: true })
  pin_code: string;

  @Column({ nullable: true })
  store_about: string;

  @Column({ nullable: true })
  store_url: string;

  @Column({ nullable: true })
  gst: string;

  @Column({ nullable: true })
  pan: string;

  @Column({ type: "boolean", default: false })
  active: boolean;

  @Column({ type: "boolean", default: false })
  trusted: boolean;

  @CreateDateColumn({ type: "timestamp" })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updated_at: Date;

  @OneToOne(() => User, (user) => user.store_profile, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user: User;
}
