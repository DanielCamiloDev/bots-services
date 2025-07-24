import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
  } from 'typeorm';
  
  export enum UserRole {
    ADMIN = 'admin',
    EDITOR = 'editor',
    VIEWER = 'viewer',
  }
  
  @Entity({ name: 'users' })
  export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column({ length: 50, unique: true })
    username: string;
  
    @Column()
    passwordHash: string;
  
    @Column('simple-array', { nullable: true })
    roles: UserRole[];
  
    @Column({ length: 100, nullable: true })
    fullName?: string;
  
    @Column({ length: 200, nullable: true })
    email?: string;
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  }