import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("sponsors")
export class Sponsor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 255, nullable: true })
  title?: string;

  @Column({ type: "enum", enum: ["image", "video"], nullable: false })
  type: "image" | "video";

  @Column({ type: "varchar", length: 500, nullable: false })
  url: string;

  @Column({ type: "varchar", length: 500, nullable: true })
  sponsor_link?: string;

  @Column({ type: "boolean", default: true })
  active: boolean;

  @CreateDateColumn({ type: "timestamp" })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updated_at: Date;
}
